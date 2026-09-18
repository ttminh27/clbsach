import { TextHighlight } from '../types/highlight';

/**
 * Removes all user highlight marks from the document or target container,
 * restoring original text nodes cleanly.
 */
export function clearHighlightsFromElement(container?: HTMLElement | null): void {
  const root = container || document.getElementById('chapter-content-article') || document.body;
  if (!root) return;

  const marks = root.querySelectorAll<HTMLElement>('mark.reader-user-highlight');
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
}

interface TextPosition {
  node: Text;
  startInDoc: number;
  endInDoc: number;
}

/**
 * Traverses text nodes inside container, builds continuous string,
 * and maps character indices to DOM Text nodes.
 */
function buildTextIndex(container: HTMLElement): { fullText: string; positions: TextPosition[] } {
  const treeWalker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tagName = parent.tagName.toLowerCase();
      if (['script', 'style', 'button', 'input', 'textarea', 'svg', 'noscript'].includes(tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (parent.closest('[data-no-highlight="true"]') || parent.closest('[data-selection-tooltip="true"]')) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const positions: TextPosition[] = [];
  let fullText = '';

  let currentNode = treeWalker.nextNode() as Text | null;
  while (currentNode) {
    const text = currentNode.textContent || '';
    if (text.length > 0) {
      const startInDoc = fullText.length;
      fullText += text;
      const endInDoc = fullText.length;
      positions.push({
        node: currentNode,
        startInDoc,
        endInDoc,
      });
    }
    currentNode = treeWalker.nextNode() as Text | null;
  }

  return { fullText, positions };
}

/**
 * Finds all occurrences of `targetText` in `fullText` and picks the one
 * matching `prefix` and `suffix` closest.
 */
function findBestMatchIndex(
  fullText: string,
  targetText: string,
  prefix?: string,
  suffix?: string
): number {
  if (!targetText || !fullText) return -1;

  // Normalize spaces to prevent whitespace discrepancy
  const cleanTarget = targetText.trim();
  if (!cleanTarget) return -1;

  const matches: number[] = [];
  let pos = 0;
  while (pos < fullText.length) {
    const idx = fullText.indexOf(cleanTarget, pos);
    if (idx === -1) break;
    matches.push(idx);
    pos = idx + cleanTarget.length;
  }

  if (matches.length === 0) {
    // Try matching with normalized spaces (collapsing multi spaces into single space)
    return -1;
  }

  if (matches.length === 1 || (!prefix && !suffix)) {
    return matches[0];
  }

  // Disambiguate using prefix and suffix scores
  let bestIdx = matches[0];
  let maxScore = -1;

  const cleanPrefix = (prefix || '').trim();
  const cleanSuffix = (suffix || '').trim();

  for (const matchIdx of matches) {
    let score = 0;
    if (cleanPrefix) {
      const beforeText = fullText.substring(Math.max(0, matchIdx - cleanPrefix.length), matchIdx);
      if (beforeText.includes(cleanPrefix) || cleanPrefix.includes(beforeText.trim())) {
        score += 10;
      }
    }
    if (cleanSuffix) {
      const afterText = fullText.substring(matchIdx + cleanTarget.length, matchIdx + cleanTarget.length + cleanSuffix.length);
      if (afterText.includes(cleanSuffix) || cleanSuffix.includes(afterText.trim())) {
        score += 10;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestIdx = matchIdx;
    }
  }

  return bestIdx;
}

/**
 * Applies a list of TextHighlight items onto the DOM of `container`.
 * Wraps matching text in `<mark class="reader-user-highlight hl-${color}" data-highlight-id="${id}">`.
 */
export function applyHighlightsToElement(container: HTMLElement, highlights: TextHighlight[]): void {
  if (!container || !highlights || highlights.length === 0) {
    clearHighlightsFromElement(container);
    return;
  }

  // Always clear previous user highlights first to have a clean DOM slate
  clearHighlightsFromElement(container);

  // Sort highlights by createdAt or position to avoid index corruption
  for (const hl of highlights) {
    // Re-build text index for each highlight because DOM mutation modifies nodes
    const { fullText, positions } = buildTextIndex(container);
    const targetText = hl.text.trim();
    if (!targetText) continue;

    const matchStart = findBestMatchIndex(fullText, targetText, hl.prefix, hl.suffix);
    if (matchStart === -1) continue;

    const matchEnd = matchStart + targetText.length;

    // Find all text positions overlapping with [matchStart, matchEnd]
    const affected = positions.filter((p) => p.endInDoc > matchStart && p.startInDoc < matchEnd);
    if (affected.length === 0) continue;

    // Process overlapping nodes in reverse order so splitting doesn't alter earlier indices
    for (let i = affected.length - 1; i >= 0; i--) {
      const posInfo = affected[i];
      const node = posInfo.node;
      if (!node.parentNode) continue;

      const nodeStartInDoc = posInfo.startInDoc;
      const nodeLength = node.textContent?.length || 0;

      // Local offsets within this particular text node
      const localStart = Math.max(0, matchStart - nodeStartInDoc);
      const localEnd = Math.min(nodeLength, matchEnd - nodeStartInDoc);

      if (localStart >= localEnd) continue;

      let targetNode: Text;

      if (localStart === 0) {
        if (localEnd < node.textContent!.length) {
          node.splitText(localEnd);
        }
        targetNode = node;
      } else {
        const afterStart = node.splitText(localStart);
        if (localEnd - localStart < afterStart.textContent!.length) {
          afterStart.splitText(localEnd - localStart);
        }
        targetNode = afterStart;
      }

      const mark = document.createElement('mark');
      mark.className = `reader-user-highlight hl-${hl.color}`;
      mark.setAttribute('data-highlight-id', hl.id);
      mark.setAttribute('data-highlight-color', hl.color);
      if (hl.note) {
        mark.setAttribute('data-highlight-note', hl.note);
      }
      mark.title = hl.note ? `Ghi chú: ${hl.note}` : 'Đoạn highlight (Bấm để tùy chỉnh)';

      targetNode.parentNode!.replaceChild(mark, targetNode);
      mark.appendChild(targetNode);
    }
  }
}

/**
 * Extracts context (prefix and suffix) around a DOM Range for W3C TextQuoteSelector.
 */
export function getTextQuoteContext(range: Range, length = 35): { prefix: string; suffix: string } {
  let prefix = '';
  let suffix = '';

  try {
    const article = document.getElementById('chapter-content-article') || document.body;
    const { fullText } = buildTextIndex(article);

    const text = range.toString().trim();
    if (!text || !fullText) return { prefix, suffix };

    const idx = fullText.indexOf(text);
    if (idx !== -1) {
      const pStart = Math.max(0, idx - length);
      prefix = fullText.substring(pStart, idx).trim();

      const sEnd = Math.min(fullText.length, idx + text.length + length);
      suffix = fullText.substring(idx + text.length, sEnd).trim();
    }
  } catch (err) {
    console.warn('Error extracting text quote context:', err);
  }

  return { prefix, suffix };
}

/**
 * Scrolls smoothly to a highlight and briefly animates a pulse halo to draw focus.
 */
export function scrollToHighlight(highlightId: string): boolean {
  const mark = document.querySelector<HTMLElement>(`mark.reader-user-highlight[data-highlight-id="${highlightId}"]`);
  if (!mark) return false;

  mark.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });

  const allMarks = document.querySelectorAll<HTMLElement>(`mark.reader-user-highlight[data-highlight-id="${highlightId}"]`);
  allMarks.forEach((el) => {
    el.classList.add('reader-highlight-pulse');
  });

  setTimeout(() => {
    allMarks.forEach((el) => {
      el.classList.remove('reader-highlight-pulse');
    });
  }, 2200);

  return true;
}
