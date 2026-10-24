import { useRef } from 'react';
import type { Highlight } from '../lib/types';

type Props = {
  body: string;
  highlights?: Highlight[];
  selectable?: boolean;
  variant?: 'user' | 'correction';
  onSelectText?: (range: { start: number; end: number }) => void;
};

function normalizeHighlights(highlights: Highlight[], length: number): Highlight[] {
  const sorted = highlights
    .map((highlight) => ({
      ...highlight,
      start: Math.max(0, Math.min(highlight.start, length)),
      end: Math.max(0, Math.min(highlight.end, length)),
    }))
    .filter((highlight) => highlight.start < highlight.end)
    .sort((a, b) => a.start - b.start);

  const merged: Highlight[] = [];
  for (const highlight of sorted) {
    const previous = merged.at(-1);
    if (previous && highlight.start <= previous.end) {
      previous.end = Math.max(previous.end, highlight.end);
      previous.reason = previous.reason ?? highlight.reason;
    } else {
      merged.push({ ...highlight });
    }
  }
  return merged;
}

export default function EmailBody({
  body,
  highlights = [],
  selectable = false,
  variant = 'user',
  onSelectText,
}: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);

  const handleSelection = () => {
    if (!selectable || !onSelectText) return;
    const selection = window.getSelection();
    const container = bodyRef.current;
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed || !container) return;

    const range = selection.getRangeAt(0);
    if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) return;

    const before = range.cloneRange();
    before.selectNodeContents(container);
    before.setEnd(range.startContainer, range.startOffset);

    const start = before.toString().length;
    const selectedText = range.toString();
    if (!selectedText.trim()) return;

    onSelectText({ start, end: start + selectedText.length });
    selection.removeAllRanges();
  };

  const ranges = normalizeHighlights(highlights, body.length);
  const parts: Array<{ text: string; highlight?: Highlight }> = [];
  let cursor = 0;

  for (const highlight of ranges) {
    if (highlight.start > cursor) {
      parts.push({ text: body.slice(cursor, highlight.start) });
    }
    parts.push({ text: body.slice(highlight.start, highlight.end), highlight });
    cursor = highlight.end;
  }
  if (cursor < body.length) {
    parts.push({ text: body.slice(cursor) });
  }

  return (
    <div
      ref={bodyRef}
      className={`email-body${selectable ? ' email-body--selectable' : ''}`}
      onMouseUp={handleSelection}
    >
      {parts.map((part, index) =>
        part.highlight ? (
          <mark
            key={`${part.highlight.start}-${index}`}
            className={variant === 'correction' ? 'mark mark--correction' : 'mark mark--user'}
            title={part.highlight.reason}
          >
            {part.text}
          </mark>
        ) : (
          <span key={`text-${index}`}>{part.text}</span>
        ),
      )}
    </div>
  );
}
