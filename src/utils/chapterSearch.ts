/**
 * Utilities for finding and highlighting text matches within chapter content.
 * Supports Vietnamese accent-insensitive search and CSS Custom Highlight API.
 */

export interface SearchMatch {
  index: number;
  node: Text;
  startOffset: number;
  endOffset: number;
  range: Range;
  snippet: string;
}

/**
 * Normalizes Vietnamese characters by removing diacritical marks.
 * Example: "Thành công" -> "thanh cong"
 */
export function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Searches for all occurrences of `query` within the text nodes of `container`.
 */
export function findMatchesInElement(container: HTMLElement, query: string): SearchMatch[] {
  if (!container) return [];
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const normalizedQuery = removeVietnameseAccents(cleanQuery.toLowerCase());
  if (!normalizedQuery) return [];

  const matches: SearchMatch[] = [];

  const treeWalker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tagName = parent.tagName.toLowerCase();
      if (['script', 'style', 'button', 'input', 'textarea', 'svg', 'noscript'].includes(tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (parent.closest('[data-no-search="true"]')) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let matchIndex = 0;
  let currentNode = treeWalker.nextNode() as Text | null;

  while (currentNode) {
    const originalText = currentNode.textContent || '';
    if (originalText.trim()) {
      const normalizedText = removeVietnameseAccents(originalText.toLowerCase());

      let pos = 0;
      while (pos < normalizedText.length) {
        const foundIdx = normalizedText.indexOf(normalizedQuery, pos);
        if (foundIdx === -1) break;

        const endIdx = foundIdx + normalizedQuery.length;

        // Extract readable snippet around the match
        const snippetStart = Math.max(0, foundIdx - 35);
        const snippetEnd = Math.min(originalText.length, endIdx + 35);
        const prefix = snippetStart > 0 ? '...' : '';
        const suffix = snippetEnd < originalText.length ? '...' : '';
        const snippet = prefix + originalText.substring(snippetStart, snippetEnd).trim() + suffix;

        try {
          const range = new Range();
          range.setStart(currentNode, foundIdx);
          range.setEnd(currentNode, endIdx);

          matches.push({
            index: matchIndex++,
            node: currentNode,
            startOffset: foundIdx,
            endOffset: endIdx,
            range,
            snippet,
          });
        } catch {
          // If range creation fails on boundary edge, skip gracefully
        }

        pos = endIdx;
      }
    }

    currentNode = treeWalker.nextNode() as Text | null;
  }

  return matches;
}

/**
 * Applies custom CSS highlights for matches and the current active match.
 */
export function applyCSSHighlights(matches: SearchMatch[], activeIndex: number): boolean {
  if (typeof CSS === 'undefined' || !('highlights' in CSS)) {
    return false;
  }

  try {
    if (matches.length === 0) {
      CSS.highlights.delete('chapter-search-match');
      CSS.highlights.delete('chapter-search-active');
      return true;
    }

    // Register all match ranges
    const allRanges = matches.map((m) => m.range);
    // @ts-ignore Highlight constructor is standard in modern browsers
    const matchHighlight = new Highlight(...allRanges);
    CSS.highlights.set('chapter-search-match', matchHighlight);

    // Register active highlight range
    if (activeIndex >= 0 && activeIndex < matches.length) {
      const activeRange = matches[activeIndex].range;
      // @ts-ignore Highlight constructor is standard in modern browsers
      const activeHighlight = new Highlight(activeRange);
      CSS.highlights.set('chapter-search-active', activeHighlight);
    } else {
      CSS.highlights.delete('chapter-search-active');
    }

    return true;
  } catch (err) {
    console.warn('Error applying CSS.highlights:', err);
    return false;
  }
}

/**
 * Removes custom CSS highlights.
 */
export function clearCSSHighlights(): void {
  if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
    try {
      CSS.highlights.delete('chapter-search-match');
      CSS.highlights.delete('chapter-search-active');
    } catch {
      // ignore
    }
  }
}

/**
 * Scrolls smoothly to position the target match at center of screen.
 */
export function scrollToMatch(match: SearchMatch): void {
  if (!match || !match.range) return;

  try {
    const rect = match.range.getBoundingClientRect();
    if (rect && (rect.top !== 0 || rect.bottom !== 0)) {
      const scrollTop = window.scrollY + rect.top - window.innerHeight / 2;
      window.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth',
      });
      return;
    }
  } catch {
    // Fallback to parent element scrolling
  }

  const parent = match.node.parentElement;
  if (parent) {
    parent.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
