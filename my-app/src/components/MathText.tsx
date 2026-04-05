import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/**
 * Renders a string that may contain LaTeX math in any common notation:
 *   $$...$$ or \[...\] → block (display) math
 *   $...$  or \(...\)  → inline math
 *
 * Also renders markdown formatting (bold, lists, etc.)
 * Uses the same pipeline as SolutionCard for consistency.
 */

function normalizeLatex(raw: string): string {
  let text = raw;
  // \( inline \) → $ inline $
  text = text.replace(/\\\((.+?)\\\)/g, (_m, inner: string) => `$${inner}$`);
  // \[ display \] → $$ display $$
  text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_m, inner: string) => `$$${inner}$$`);
  return text;
}

export default function MathText({ text }: { text: string }) {
  if (!text) return null;

  const content = normalizeLatex(text);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
    >
      {content}
    </ReactMarkdown>
  );
}
