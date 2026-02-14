import type { MarkupRenderer } from './types';

const renderMark: MarkupRenderer = ({ children }) => <mark>{children}</mark>;

export default renderMark;
