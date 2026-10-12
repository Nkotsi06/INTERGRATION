import { useEffect } from 'react';

/**
 * LanguageObserver
 *
 * Runtime translation for Option B: no page edits needed.
 *
 * How it works:
 *   1. Build a reverse lookup from English translation_value → other-language value.
 *   2. Walk the DOM. For each text node, if its trimmed content matches a key
 *      in the reverse lookup, replace it with the current language's value.
 *   3. Watch for DOM changes (React renders) and translate new nodes.
 *   4. When the language changes, translate from the base (English) text.
 *
 * Constraints:
 *   - Only handles static strings that match an English translation_value.
 *   - Does not handle {placeholders} that get substituted into the string.
 *   - Ignores <script>, <style>, <code>, and elements marked data-no-i18n.
 */

// Cache: English value → { langCode: translatedValue }
let reverseMap = {};

// Cache: node → original English text (so we can re-translate on language change)
const originalText = new WeakMap();
const originalAttrs = new WeakMap();

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA']);

// Attributes to translate on every element.
const TRANSLATABLE_ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];

function buildReverseMap(translations) {
  // translations is a flat { key: value } object for ONE language.
  // We need the English map to build the reverse lookup.
  // The observer is always given BOTH the current language map and the EN map.
  return null; // placeholder — set by the caller
}

function normalise(str) {
  if (typeof str !== 'string') return '';
  // Collapse whitespace, trim. English source text on pages is a single line
  // but JSX may inject newlines/indentation.
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Build the reverse lookup.
 * @param {Object} enMap        - { key: englishValue }  (the reference language)
 * @param {Object} targetMap    - { key: translatedValue } (the language to switch to)
 */
export function buildLookup(enMap, targetMap) {
  const map = {};
  Object.keys(enMap).forEach((key) => {
    const en = normalise(enMap[key]);
    const target = targetMap[key];
    if (!en || !target) return;
    if (en === normalise(target)) return; // skip identical (no-op)
    map[en] = target;
  });
  return map;
}

function shouldSkip(node) {
  let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  while (el) {
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.hasAttribute && el.hasAttribute('data-no-i18n')) return true;
    el = el.parentElement;
  }
  return false;
}

function translateTextNode(node, lookup) {
  if (shouldSkip(node)) return;

  const current = node.nodeValue;
  if (!current) return;

  const trimmed = normalise(current);
  if (!trimmed) return;

  // Remember the original English text the first time we see this node.
  if (!originalText.has(node)) {
    originalText.set(node, current);
  }
  const original = originalText.get(node);
  const originalTrimmed = normalise(original);

  if (lookup === null) {
    // Reset to original English.
    if (current !== original) node.nodeValue = original;
    return;
  }

  // Try full-string match first.
  if (lookup[originalTrimmed]) {
    // Preserve surrounding whitespace of the node.
    const leading = original.match(/^\s*/)[0];
    const trailing = original.match(/\s*$/)[0];
    const translated = leading + lookup[originalTrimmed] + trailing;
    if (node.nodeValue !== translated) node.nodeValue = translated;
  } else {
    // Reset if previously translated but no longer matches.
    if (current !== original) node.nodeValue = original;
  }
}

function translateAttributes(el, lookup) {
  if (shouldSkip(el)) return;

  TRANSLATABLE_ATTRS.forEach((attr) => {
    const current = el.getAttribute(attr);
    if (!current) return;

    let store = originalAttrs.get(el);
    if (!store) {
      store = {};
      originalAttrs.set(el, store);
    }
    if (store[attr] === undefined) store[attr] = current;

    const original = store[attr];
    const trimmed = normalise(original);

    if (lookup === null) {
      if (current !== original) el.setAttribute(attr, original);
      return;
    }

    if (lookup[trimmed]) {
      if (current !== lookup[trimmed]) el.setAttribute(attr, lookup[trimmed]);
    } else if (current !== original) {
      el.setAttribute(attr, original);
    }
  });
}

function walk(root, lookup) {
  if (!root) return;
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root, lookup);
    return;
  }
  if (root.nodeType === Node.ELEMENT_NODE) {
    translateAttributes(root, lookup);
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      if (node.nodeType === Node.ELEMENT_NODE && SKIP_TAGS.has(node.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (n.nodeType === Node.TEXT_NODE) translateTextNode(n, lookup);
    else if (n.nodeType === Node.ELEMENT_NODE) translateAttributes(n, lookup);
  }
}

/**
 * The React component. Mount once, high in the tree.
 *
 * Props:
 *   lookup   - the reverse map from buildLookup(); null means "reset to English"
 *   version  - increment to force a re-run (used when the lookup changes)
 */
export default function LanguageObserver({ lookup, version }) {
  useEffect(() => {
    // Translate whatever is already on the page.
    walk(document.body, lookup);

    // Watch for new nodes (React renders after navigation, state changes, etc).
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => walk(node, lookup));
        if (m.type === 'characterData') {
          translateTextNode(m.target, lookup);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [lookup, version]);

  return null;
}