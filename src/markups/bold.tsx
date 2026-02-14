import type { MarkupRenderer } from './types';

const renderBold: MarkupRenderer = ({ children }) => <strong>{children}</strong>;

export default renderBold;

