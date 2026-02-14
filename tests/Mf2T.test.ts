import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Mf2Bundle, Mf2T, createMf2 } from '../src';

async function renderMf2T(
  options: {
    message: string;
    keypath?: string;
    args?: Record<string, unknown>;
  },
  slots?: Record<string, (props: Record<string, unknown>) => unknown>
): Promise<string> {
  const keypath = options.keypath ?? 'msg';
  const mf2 = createMf2({
    locale: 'en-US',
    bundles: [new Mf2Bundle('en-US').addResource({ [keypath]: options.message })]
  });

  const app = createSSRApp({
    render() {
      return h(Mf2T, { keypath, args: options.args ?? {} }, slots ?? {});
    }
  });
  app.use(mf2);

  return renderToString(app);
}

describe('Mf2T rendering', () => {
  it('renders built-in bold markup', async () => {
    const html = await renderMf2T({
      message: 'Please {#bold}read this{/bold}.'
    });

    expect(html).toContain('<strong>read this</strong>');
  });

  it('renders built-in link markup with options', async () => {
    const html = await renderMf2T({
      message: 'Need help? {#link to=|/help|}Open docs{/link}'
    });

    expect(html).toContain('<a href="/help">Open docs</a>');
  });

  it('renders custom markup slot override', async () => {
    const html = await renderMf2T(
      {
        message: 'Use {#bold}brand{/bold} style.'
      },
      {
        bold: ({ value }) => h('span', { class: 'brand-bold' }, String(value))
      }
    );

    expect(html).toContain('<span class="brand-bold">brand</span>');
  });

  it('falls back to keypath text when message key is missing', async () => {
    const mf2 = createMf2({
      locale: 'en-US',
      bundles: [new Mf2Bundle('en-US').addResource({})]
    });

    const app = createSSRApp({
      render() {
        return h(Mf2T, { keypath: 'missing.key' });
      }
    });
    app.use(mf2);

    const html = await renderToString(app);
    expect(html).toContain('missing.key');
  });
});
