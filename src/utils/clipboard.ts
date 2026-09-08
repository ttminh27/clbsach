/**
 * Utility functions for clipboard operations and markdown text processing.
 */

/**
 * Strips markdown formatting to produce clean, readable plain text.
 */
export function stripMarkdownToPlainText(markdown: string): string {
  if (!markdown) return '';

  return markdown
    // Remove YAML frontmatter if any
    .replace(/^---[\s\S]*?---\n*/, '')
    // Headers -> text with newline
    .replace(/^#+\s+(.*)$/gm, '$1\n')
    // Remove images completely: ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    // Links: [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // Bold & italic: **text**, *text*, __text__, _text_
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Strikethrough ~~text~~ -> text
    .replace(/~~(.*?)~~/g, '$1')
    // Inline code: `code` -> code
    .replace(/`([^`]+)`/g, '$1')
    // Blockquotes: > quote -> quote
    .replace(/^\s*>+\s?/gm, '')
    // Unordered list bullets: - or * -> •
    .replace(/^[-*+]\s+/gm, '• ')
    // Code blocks: ```lang ... ``` -> content
    .replace(/```[a-z]*\n?([\s\S]*?)```/g, '$1')
    // HTML tags: <tag> -> strip
    .replace(/<[^>]+>/g, '')
    // Clean multiple blank lines into max 2
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Copies text to system clipboard with fallback support for non-secure contexts.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      textarea.setAttribute('readonly', '');
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}
