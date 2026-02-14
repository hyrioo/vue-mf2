import type { MarkupRenderer } from './types';

const renderItalic: MarkupRenderer = ({ children }) => <em>{children}</em>;

export default renderItalic;

