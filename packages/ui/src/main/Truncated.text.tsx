'use client';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface TruncatedTextProps {
  text?: string | object;
  pre?: boolean;
  maxLength?: number;
  className?: string;
  cardWidth?: number;
}

/**
 * TruncatedText Component
 *
 * Displays truncated text with ellipsis. If text is longer than maxLength,
 * shows full text in a HoverCard on hover with proper text wrapping.
 *
 * @example
 * <TruncatedText
 *   text="This is a very long description that needs truncation"
 *   maxLength={40}
 *   cardWidth={300}
 * />
 *
 * @example
 * <TruncatedText
 *   text={{ key: "value" }}
 *   pre={true}
 *   maxLength={30}
 * />
 */
export function TruncatedText({
  text,
  pre = false,
  maxLength = 50,
  className = '',
  cardWidth = 300,
}: TruncatedTextProps) {
  // Convert object to string if needed
  const textString = typeof text === 'object' ? JSON.stringify(text) : text || '';

  // Handle empty or undefined text
  if (!textString) {
    return <span className={className}>-</span>;
  }

  // If text is shorter than maxLength, display as is
  if (textString.length <= maxLength) {
    const displayContent = pre ? (
      <pre className={` whitespace-pre-wrap ${className}`}>{textString}</pre>
    ) : (
      <span className={` whitespace-pre-wrap ${className}`}>{textString}</span>
    );
    return displayContent;
  }

  // Truncate text and add ellipsis
  const truncatedText = textString.substring(0, maxLength) + '...';

  // Format full text for display
  const fullText = typeof text === 'object' ? JSON.stringify(text, null, 2) : textString;

  // With HoverCard for full text with wrapping
  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <span className={`underline decoration-dashed cursor-help ${className}`}>
            {truncatedText}
          </span>
        }
      />
      <HoverCardContent className="w-80" style={{ width: `${cardWidth}px` }}>
        {pre === true ? (
          <pre className="text-sm leading-relaxed wrap-break-words whitespace-pre-wrap">
            {fullText}
          </pre>
        ) : (
          <p className="text-sm leading-relaxed wrap-break-words whitespace-pre-wrap">{fullText}</p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
