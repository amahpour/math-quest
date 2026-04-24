// Renders a mixed string where math segments are wrapped in $...$ delimiters.
// Uses KaTeX (loaded via index.html) for the math portions.

function MQMath({ src, style, block }) {
  const ref = React.useRef(null);
  const text = src == null ? '' : String(src);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.katex) { el.textContent = text; return; }
    el.innerHTML = '';
    const parts = text.split(/(\$[^$]+\$)/g);
    for (const p of parts) {
      if (!p) continue;
      if (p.startsWith('$') && p.endsWith('$') && p.length > 2) {
        const span = document.createElement('span');
        try {
          window.katex.render(p.slice(1, -1), span, { throwOnError: false, displayMode: !!block });
        } catch (e) { span.textContent = p; }
        el.appendChild(span);
      } else {
        el.appendChild(document.createTextNode(p));
      }
    }
  }, [text, block]);
  return React.createElement('span', { ref, style });
}

Object.assign(window, { MQMath });
