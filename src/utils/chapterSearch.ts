/**
 * Utilities for finding and highlighting text matches within chapter content.
 * Supports Vietnamese accent-insensitive search, rock-solid cross-browser DOM <mark>
 * highlighting, active match pulsing emphasis, and smooth scroll centering.
 */

export interface SearchMatch {
  index: number;
  element: HTMLElement;
  snippet: string;
  originalWord: string;
  node?: Text;
  startOffset?: number;
  endOffset?: number;
  range?: Range;
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
 * Removes all search highlight marks from the document or target container,
 * restoring original text nodes seamlessly via DOM normalize.
 */
export function clearSearchHighlights(container?: HTMLElement | null): void {
  const root = container || document.getElementById('chapter-content-article') || document.body;
  if (!root) return;

  const marks = root.querySelectorAll<HTMLElement>('mark.reader-search-match');
  const parentsToNormalize = new Set<Node>();

  marks.forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;

    parentsToNormalize.add(parent);
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark);
    }
    parent.removeChild(mark);
  });

  parentsToNormalize.forEach((parent) => {
    try {
      parent.normalize();
    } catch {
      // ignore
    }
  });

  // Also clean up CSS Highlights if supported
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
 * Backwards-compatible alias for clearSearchHighlights.
 */
export function clearCSSHighlights(): void {
  clearSearchHighlights();
}

/**
 * Searches for all occurrences of `query` within the text nodes of `container`,
 * wrapping each match in a highly visible `<mark class="reader-search-match">` element.
 */
export function findMatchesInElement(container: HTMLElement, query: string): SearchMatch[] {
  // Always clean up any existing highlights first
  clearSearchHighlights(container);

  if (!container) return [];
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const normalizedQuery = removeVietnameseAccents(cleanQuery.toLowerCase());
  if (!normalizedQuery) return [];

  // 1. Gather all searchable text nodes
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

  const textNodes: Text[] = [];
  let currentNode = treeWalker.nextNode() as Text | null;
  while (currentNode) {
    if (currentNode.textContent && currentNode.textContent.trim()) {
      textNodes.push(currentNode);
    }
    currentNode = treeWalker.nextNode() as Text | null;
  }

  interface MatchInfo {
    start: number;
    end: number;
    snippet: string;
    originalWord: string;
    element?: HTMLElement;
    range?: Range;
  }

  const allMatches: SearchMatch[] = [];
  let globalIndex = 0;

  // 2. Locate matches in each text node and wrap with <mark>
  for (const node of textNodes) {
    const rawContent = node.textContent || '';
    const originalText = rawContent.normalize('NFC');
    const normalizedText = removeVietnameseAccents(originalText.toLowerCase());

    const nodeMatches: MatchInfo[] = [];
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
      const originalWord = originalText.substring(foundIdx, endIdx);

      let matchRange: Range | undefined;
      try {
        matchRange = new Range();
        matchRange.setStart(node, foundIdx);
        matchRange.setEnd(node, endIdx);
      } catch {
        // Range creation might fail if text is modified
      }

      nodeMatches.push({
        start: foundIdx,
        end: endIdx,
        snippet,
        originalWord,
        range: matchRange,
      });

      pos = endIdx;
    }

    if (nodeMatches.length === 0) continue;

    // Process from end to beginning so earlier offsets in the same text node stay intact
    for (let i = nodeMatches.length - 1; i >= 0; i--) {
      const m = nodeMatches[i];
      let matchNode: Text;

      if (m.start === 0) {
        if (m.end < node.textContent!.length) {
          node.splitText(m.end);
        }
        matchNode = node;
      } else {
        const afterStart = node.splitText(m.start);
        if (m.end - m.start < afterStart.textContent!.length) {
          afterStart.splitText(m.end - m.start);
        }
        matchNode = afterStart;
      }

      const matchIndex = globalIndex + i;
      const mark = document.createElement('mark');
      mark.className = 'reader-search-match';
      mark.setAttribute('data-search-index', String(matchIndex));
      mark.setAttribute('title', `Kết quả tìm kiếm #${matchIndex + 1}`);

      matchNode.parentNode!.replaceChild(mark, matchNode);
      mark.appendChild(matchNode);

      m.element = mark;
    }

    for (let i = 0; i < nodeMatches.length; i++) {
      allMatches.push({
        index: globalIndex++,
        element: nodeMatches[i].element!,
        snippet: nodeMatches[i].snippet,
        originalWord: nodeMatches[i].originalWord,
        range: nodeMatches[i].range,
      });
    }
  }

  return allMatches;
}

/**
 * Sets the active match, updating classes for visual emphasis and pulse animation.
 */
export function setActiveHighlight(matches: SearchMatch[], activeIndex: number): void {
  matches.forEach((m, idx) => {
    let el = m.element;
    if (!el || !document.body.contains(el)) {
      const liveEl = document.querySelector<HTMLElement>(
        `mark.reader-search-match[data-search-index="${m.index}"]`
      );
      if (liveEl) {
        el = liveEl;
        m.element = liveEl;
      }
    }
    if (!el) return;

    if (idx === activeIndex) {
      el.classList.add('reader-search-match-active');
      el.setAttribute('aria-current', 'true');
    } else {
      el.classList.remove('reader-search-match-active');
      el.removeAttribute('aria-current');
    }
  });

  // Optional CSS Custom Highlight API sync for browser devtools & native inspection
  if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
    try {
      if (matches.length === 0) {
        CSS.highlights.delete('chapter-search-match');
        CSS.highlights.delete('chapter-search-active');
      } else {
        const validRanges = matches.map((m) => m.range).filter(Boolean) as Range[];
        if (validRanges.length > 0) {
          // @ts-ignore
          CSS.highlights.set('chapter-search-match', new Highlight(...validRanges));
        }
        if (activeIndex >= 0 && activeIndex < matches.length && matches[activeIndex].range) {
          // @ts-ignore
          CSS.highlights.set('chapter-search-active', new Highlight(matches[activeIndex].range!));
        }
      }
    } catch {
      // ignore
    }
  }
}

/**
 * Backwards-compatible alias for setActiveHighlight.
 */
export function applyCSSHighlights(matches: SearchMatch[], activeIndex: number): boolean {
  setActiveHighlight(matches, activeIndex);
  return true;
}

/**
 * Scrolls smoothly to position the target match directly at the center of the viewport,
 * and triggers a distinct flash pulse to immediately draw the reader's eye to it.
 */
export function scrollToMatch(match: SearchMatch): void {
  if (!match) return;

  // 1. Locate the live element in the DOM
  let targetEl: HTMLElement | null = null;
  if (typeof match.index === 'number') {
    targetEl = document.querySelector<HTMLElement>(
      `mark.reader-search-match[data-search-index="${match.index}"]`
    );
  }
  if (!targetEl && match.element && document.body.contains(match.element)) {
    targetEl = match.element;
  }

  if (!targetEl) return;

  // 2. Direct window.scrollTo to position targetEl at natural eye level (~38% of viewport)
  // Sticky header height: ReaderToolbar (56px) + ChapterSearchBar (~50px) = ~106px
  const stickyHeaderHeight = 110;
  const rect = targetEl.getBoundingClientRect();
  const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
  const targetScrollY = currentScrollY + rect.top - Math.max(stickyHeaderHeight + 30, window.innerHeight * 0.38);

  window.scrollTo({
    top: Math.max(0, Math.round(targetScrollY)),
    behavior: 'smooth',
  });

  // 3. Trigger attention-grabbing pulse flash animation
  targetEl.classList.remove('reader-search-pulse');
  void targetEl.offsetWidth; // Force CSS reflow
  targetEl.classList.add('reader-search-pulse');
}
