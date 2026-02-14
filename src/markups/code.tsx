import type { MarkupRenderer } from './types';

const renderCode: MarkupRenderer = ({ children }) => <code>{children}</code>;

export default renderCode;
