import type { MarkupRenderer } from './types';

const renderUnderline: MarkupRenderer = ({ children }) => <u>{children}</u>;

export default renderUnderline;
