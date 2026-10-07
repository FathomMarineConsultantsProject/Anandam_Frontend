const ALLOWED_TAGS = new Set([
  "P",
  "DIV",
  "BR",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "S",
  "SPAN",
  "FONT",
  "UL",
  "OL",
  "LI",
  "BLOCKQUOTE",
  "A",
]);

const ALLOWED_STYLES = new Set([
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "color",
  "background-color",
  "text-decoration",
  "text-decoration-line",
  "text-decoration-color",
  "text-decoration-style",
  "text-align",
]);

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isSafeHref(value) {
  if (!value) return false;

  const href = String(value).trim();

  return (
    /^https?:\/\//i.test(href) ||
    /^mailto:/i.test(href) ||
    /^tel:/i.test(href) ||
    href.startsWith("/") ||
    href.startsWith("#")
  );
}

function cleanStyleValue(property, value) {
  const normalized = String(value || "").trim();
  if (!normalized) return "";

  if (property === "text-align") {
    return ["left", "center", "right", "justify", "start", "end"].includes(
      normalized.toLowerCase()
    )
      ? normalized
      : "";
  }

  if (property === "font-size") {
    const match = normalized.match(/^([0-9]+(?:\.[0-9]+)?)(px|pt|em|rem|%)$/i);
    if (!match) return "";

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    if (unit === "px" && (amount < 8 || amount > 72)) return "";
    if (unit === "pt" && (amount < 6 || amount > 54)) return "";
    if ((unit === "em" || unit === "rem") && (amount < 0.5 || amount > 5)) {
      return "";
    }
    if (unit === "%" && (amount < 50 || amount > 500)) return "";

    return normalized;
  }

  if (property === "font-family") {
    return normalized.length <= 120 ? normalized : "";
  }

  if (property === "font-weight") {
    return /^(normal|bold|bolder|lighter|[1-9]00)$/i.test(normalized)
      ? normalized
      : "";
  }

  if (property === "font-style") {
    return /^(normal|italic|oblique)$/i.test(normalized) ? normalized : "";
  }

  if (property.startsWith("text-decoration")) {
    return normalized.length <= 100 ? normalized : "";
  }

  // CSSStyleDeclaration has already parsed colour values for us.
  if (property === "color" || property === "background-color") {
    return normalized.length <= 80 ? normalized : "";
  }

  return normalized;
}

export function sanitizeBlogHtml(html = "") {
  if (!html) return "";

  const parser = new DOMParser();
  const parsed = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = parsed.body.firstElementChild;

  if (!root) return "";

  function cleanElement(element) {
    Array.from(element.children).forEach(cleanElement);

    const tag = element.tagName;

    if (["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED"].includes(tag)) {
      element.remove();
      return;
    }

    if (!ALLOWED_TAGS.has(tag)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();

      if (
        name === "style" ||
        name === "href" ||
        name === "target" ||
        name === "rel" ||
        name === "face" ||
        name === "color" ||
        name === "size"
      ) {
        return;
      }

      element.removeAttribute(attribute.name);
    });

    if (element.hasAttribute("style")) {
      const safeStyles = [];

      for (let i = 0; i < element.style.length; i += 1) {
        const property = element.style[i];
        if (!ALLOWED_STYLES.has(property)) continue;

        const value = cleanStyleValue(
          property,
          element.style.getPropertyValue(property)
        );

        if (value) safeStyles.push(`${property}: ${value}`);
      }

      if (safeStyles.length) {
        element.setAttribute("style", safeStyles.join("; "));
      } else {
        element.removeAttribute("style");
      }
    }

    if (tag === "A") {
      const href = element.getAttribute("href");

      if (!isSafeHref(href)) {
        element.removeAttribute("href");
        element.removeAttribute("target");
        element.removeAttribute("rel");
      } else {
        element.setAttribute("target", "_blank");
        element.setAttribute("rel", "noopener noreferrer");
      }
    }

    if (tag === "FONT") {
      const face = element.getAttribute("face");
      const color = element.getAttribute("color");
      const size = element.getAttribute("size");

      if (face && face.length > 120) element.removeAttribute("face");
      if (color && color.length > 80) element.removeAttribute("color");
      if (size && !/^[1-7]$/.test(size)) element.removeAttribute("size");
    }
  }

  Array.from(root.children).forEach(cleanElement);
  return root.innerHTML;
}

export function emptyBlogDocument() {
  return {
    type: "doc",
    content: [],
  };
}

export function editorDomToDocument(editorElement) {
  if (!editorElement) return emptyBlogDocument();

  const html = sanitizeBlogHtml(editorElement.innerHTML);
  const parser = new DOMParser();
  const parsed = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = parsed.body.firstElementChild;

  const text = root?.textContent?.replace(/\s+/g, " ").trim() || "";

  if (!text) return emptyBlogDocument();

  // The backend already accepts generic JSON. We keep a plain text copy for
  // excerpt / reading-time extraction and the sanitised HTML for formatting.
  return {
    type: "doc",
    content: [
      {
        type: "richHtml",
        text,
        attrs: {
          html,
        },
      },
    ],
  };
}

export function documentPlainText(node) {
  if (node === null || node === undefined) return "";

  if (Array.isArray(node)) {
    return node.map(documentPlainText).filter(Boolean).join(" ").trim();
  }

  if (typeof node !== "object") return "";

  const ownText = typeof node.text === "string" ? node.text : "";
  const childText = Array.isArray(node.content)
    ? node.content.map(documentPlainText).filter(Boolean).join(" ")
    : "";

  return [ownText, childText]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function renderLegacyNode(node) {
  if (!node) return "";

  if (Array.isArray(node)) {
    return node.map(renderLegacyNode).join("");
  }

  if (typeof node !== "object") return "";

  if (node.type === "richHtml") {
    return sanitizeBlogHtml(node?.attrs?.html || "");
  }

  if (node.type === "text") {
    let result = escapeHtml(node.text || "");
    const marks = Array.isArray(node.marks) ? node.marks : [];

    marks.forEach((mark) => {
      const type = typeof mark === "string" ? mark : mark?.type;

      if (type === "bold") result = `<strong>${result}</strong>`;
      if (type === "italic") result = `<em>${result}</em>`;
      if (type === "underline") result = `<u>${result}</u>`;
      if (type === "strike") result = `<s>${result}</s>`;

      if (type === "link") {
        const href = mark?.attrs?.href;
        if (isSafeHref(href)) {
          result = `<a href="${escapeHtml(
            href
          )}" target="_blank" rel="noopener noreferrer">${result}</a>`;
        }
      }
    });

    return result;
  }

  const inner = renderLegacyNode(node.content || []);

  switch (node.type) {
    case "paragraph":
      return `<p>${inner}</p>`;

    case "heading": {
      const level = Math.min(
        5,
        Math.max(1, Number(node?.attrs?.level || 2))
      );
      return `<h${level}>${inner}</h${level}>`;
    }

    case "bulletList":
      return `<ul>${inner}</ul>`;

    case "orderedList":
      return `<ol>${inner}</ol>`;

    case "listItem":
      return `<li>${inner}</li>`;

    case "blockquote":
      return `<blockquote>${inner}</blockquote>`;

    case "hardBreak":
      return "<br />";

    case "doc":
      return inner;

    default:
      return inner;
  }
}

export function documentToEditorHtml(document) {
  if (!document) return "";
  return sanitizeBlogHtml(renderLegacyNode(document));
}

export function BlogContent({ document }) {
  const html = documentToEditorHtml(document);

  return (
    <div
      className="blog-content-renderer"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
