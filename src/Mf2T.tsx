import {
    defineComponent,
    type PropType,
    type Slot,
    type VNodeChild,
} from 'vue';
import type {
    MessageBiDiIsolationPart,
    MessageMarkupPart,
    MessagePart,
    MessageTextPart,
} from 'messageformat';
import { useMf2Composer } from './vue-mf2';
import type { Mf2Plugin } from './vue-mf2';
import type { MarkupRenderer } from './markups/types';

type VariableNode = {
    type: 'variable';
    name: string | null;
    value: unknown;
    text: string;
};

type TextNode = {
    type: 'text';
    text: string;
};

type MarkupNode = {
    type: 'markup';
    name: string;
    options?: Record<string, unknown>;
    children: AstNode[];
};

type AstNode = VariableNode | TextNode | MarkupNode;

type RuntimeMessagePart = MessagePart<string>;
type MessageExpressionLikePart = Exclude<RuntimeMessagePart, MessageTextPart | MessageMarkupPart | MessageBiDiIsolationPart>;

function isMarkupPart(part: RuntimeMessagePart): part is MessageMarkupPart {
    return part.type === 'markup' && 'kind' in part && 'name' in part;
}

function resolveExpressionText(part: MessageExpressionLikePart): string {
    if (part.parts !== undefined) {
        let text = '';
        for (const expressionPart of part.parts) {
            if (expressionPart.value !== undefined) {
                text += String(expressionPart.value);
                continue;
            }

            if ('source' in part && typeof part.source === 'string') {
                return `{${part.source}}`;
            }
            return '';
        }

        return text;
    }

    if (part.value !== undefined) {
        return String(part.value);
    }

    if ('source' in part && typeof part.source === 'string') {
        return `{${part.source}}`;
    }

    return '';
}

function resolveVariableName(part: MessageExpressionLikePart): string | null {
    if (!('source' in part) || typeof part.source !== 'string' || !part.source) {
        return null;
    }

    const source = part.source.trim();
    const sourceMatch = source.match(/^\$([a-zA-Z0-9_]+)/);
    if (sourceMatch) {
        return sourceMatch[1];
    }

    const fallbackMatch = source.match(/([a-zA-Z_][a-zA-Z0-9_]*)/);
    return fallbackMatch?.[1] ?? null;
}

function parseToAst(parts: RuntimeMessagePart[]): AstNode[] {
    const root: AstNode[] = [];
    const stack: MarkupNode[] = [];

    for (const part of parts) {
        if (part.type === 'text') {
            const textNode: TextNode = {
                type: 'text',
                text: part.value !== undefined ? String(part.value) : '',
            };
            (stack.at(-1)?.children ?? root).push(textNode);
            continue;
        }

        if (part.type === 'bidiIsolation') {
            continue;
        }

        if (isMarkupPart(part)) {
            if (part.kind === 'open') {
                const markupNode: MarkupNode = {
                    type: 'markup',
                    name: part.name,
                    options: part.options,
                    children: [],
                };
                (stack.at(-1)?.children ?? root).push(markupNode);
                stack.push(markupNode);
                continue;
            }

            if (part.kind === 'close') {
                if (stack.length > 0 && stack[stack.length - 1].name === part.name) {
                    stack.pop();
                }
                continue;
            }

            const markupNode: MarkupNode = {
                type: 'markup',
                name: part.name,
                options: part.options,
                children: [],
            };
            (stack.at(-1)?.children ?? root).push(markupNode);
            continue;
        }

        const expression = part as MessageExpressionLikePart;
        const valueText = resolveExpressionText(expression);
        const valueNode: AstNode = {
            type: 'variable',
            name: resolveVariableName(expression),
            value: expression.value,
            text: valueText,
        };

        (stack.at(-1)?.children ?? root).push(valueNode);
    }

    return root;
}

function astToPlainText(nodes: AstNode[]): string {
    let output = '';
    for (const node of nodes) {
        if (node.type === 'text' || node.type === 'variable') {
            output += node.text;
            continue;
        }

        output += astToPlainText(node.children);
    }

    return output;
}

function renderNodeList(
    nodes: AstNode[],
    slots: Record<string, Slot | undefined>,
    resolveMarkupRenderer: (name: string) => MarkupRenderer | undefined,
): VNodeChild[] {
    const output: VNodeChild[] = [];
    for (const node of nodes) {
        if (node.type === 'text') {
            output.push(node.text);
            continue;
        }

        if (node.type === 'variable') {
            const slot = node.name ? slots[node.name] : null;
            if (slot) {
                const props = node.name
                    ? {[node.name]: node.value, value: node.value}
                    : {value: node.value};
                output.push(...slot(props));
                continue;
            }

            output.push(node.text);
            continue;
        }

        const children = renderNodeList(node.children, slots, resolveMarkupRenderer);
        const slot = slots[node.name];
        if (slot) {
            const plainText = astToPlainText(node.children);
            output.push(...slot({
                [node.name]: plainText,
                value: plainText,
                children,
                options: node.options ?? {},
            }));
            continue;
        }

        const renderMarkup = resolveMarkupRenderer(node.name);
        output.push(renderMarkup ? renderMarkup({ children, options: node.options }) : <span>{children}</span>);
    }

    return output;
}

export default defineComponent({
    name: 'Mf2T',
    props: {
        keypath: {
            type: String,
            required: false,
        },
        path: {
            type: String,
            required: false,
        },
        tag: {
            type: String as PropType<string>,
            default: 'span',
        },
        args: {
            type: Object as PropType<Record<string, unknown>>,
            default: () => ({}),
        },
        instance: {
            type: Object as PropType<Mf2Plugin | undefined>,
            required: false,
        },
    },
    setup(props, { slots }) {
        const composer = useMf2Composer(props.instance);

        return () => {
            const Tag = props.tag as any;
            const path = props.keypath ?? props.path;
            if (!path) {
                return <Tag>{''}</Tag>;
            }

            const parts = composer.tp(path, props.args) as RuntimeMessagePart[];
            if (parts.length === 0) {
                return <Tag>{composer.t(path, props.args)}</Tag>;
            }

            try {
                const ast = parseToAst(parts);
                const content = renderNodeList(ast, slots, composer.getMarkupRenderer);
                return <Tag>{content.length > 0 ? content : composer.t(path, props.args)}</Tag>;
            } catch {
                return <Tag>{composer.t(path, props.args)}</Tag>;
            }
        };
    },
});
