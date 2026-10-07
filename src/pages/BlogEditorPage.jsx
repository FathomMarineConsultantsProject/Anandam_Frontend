import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Eye,
  Globe2,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Lock,
  Redo2,
  Save,
  Strikethrough,
  Underline,
  Undo2,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import {
  createBlog,
  getBlogById,
  getBlogErrorMessage,
  updateBlog,
  updateBlogVisibility,
} from "../api/blogApi";
import {
  BLOG_ILLUSTRATIONS,
  getBlogIllustration,
} from "../utils/blogAssets";
import {
  BlogContent,
  documentPlainText,
  documentToEditorHtml,
  editorDomToDocument,
  emptyBlogDocument,
} from "../components/blog/BlogContent";

import "../styles/blogs.css";

const ROOT_ROUTE = "/app/blogs";

function SelectionModal({
  open,
  visibility,
  onVisibilityChange,
  onClose,
  onConfirm,
  saving,
}) {
  if (!open) return null;

  const isPublic = visibility === "PUBLIC";

  return (
    <div className="blog-modal-backdrop" role="presentation">
      <section
        className="blog-modal blog-visibility-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="blog-visibility-title"
      >
        <button
          type="button"
          className="blog-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 id="blog-visibility-title">Who can read your blog?</h2>
        <p>Share your thoughts with everyone or keep them just for yourself.</p>

        <div className="blog-visibility-options">
          <button
            type="button"
            className={`blog-visibility-option${isPublic ? " is-selected" : ""}`}
            onClick={() => onVisibilityChange("PUBLIC")}
          >
            <span className="blog-radio" aria-hidden="true" />
            <span className="blog-visibility-option__icon">
              <Globe2 size={18} strokeWidth={1.6} />
            </span>
            <span>
              <strong>Public</strong>
              <small>
                Everyone can read your blog and you can share its public link.
              </small>
            </span>
          </button>

          <button
            type="button"
            className={`blog-visibility-option${!isPublic ? " is-selected" : ""}`}
            onClick={() => onVisibilityChange("PRIVATE")}
          >
            <span className="blog-radio" aria-hidden="true" />
            <span className="blog-visibility-option__icon">
              <Lock size={18} strokeWidth={1.6} />
            </span>
            <span>
              <strong>Private</strong>
              <small>Only you can read this blog inside Anandam.</small>
            </span>
          </button>
        </div>

        <div className="blog-modal__actions">
          <button
            type="button"
            className="blog-secondary-button"
            onClick={onClose}
          >
            Keep Editing
          </button>

          <button
            type="button"
            className="blog-primary-button"
            onClick={onConfirm}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : isPublic
              ? "Publish blog"
              : "Save Privately"}
          </button>
        </div>
      </section>
    </div>
  );
}

function CoverPicker({ selectedKey, onSelect }) {
  const trackRef = useRef(null);

  function scroll(direction) {
    trackRef.current?.scrollBy({
      left: direction * 430,
      behavior: "smooth",
    });
  }

  return (
    <section className="blog-cover-picker" id="blog-cover-picker">
      <div className="blog-cover-picker__heading">
        <div>
          <h2>Choose a cover illustration</h2>
          <p>Select an illustration that fits your story.</p>
        </div>

        <div className="blog-cover-picker__arrows">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Previous illustrations"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Next illustrations"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {BLOG_ILLUSTRATIONS.length ? (
        <div className="blog-cover-picker__viewport" ref={trackRef}>
          {BLOG_ILLUSTRATIONS.map((illustration) => (
            <button
              type="button"
              key={illustration.key}
              className={`blog-cover-choice${
                selectedKey === illustration.key ? " is-selected" : ""
              }`}
              onClick={() => onSelect(illustration.key)}
              aria-pressed={selectedKey === illustration.key}
            >
              <img src={illustration.src} alt={illustration.label} />
              <span className="blog-cover-choice__check" aria-hidden="true">
                ✓
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="blog-cover-picker__empty">
          Add PNG/JPG/WebP illustrations inside{" "}
          <code>src/assets/blogpage</code>.
        </div>
      )}
    </section>
  );
}

function ToolbarButton({ title, onMouseDown, children }) {
  return (
    <button
      type="button"
      className="blog-toolbar-button"
      title={title}
      aria-label={title}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.();
      }}
    >
      {children}
    </button>
  );
}

export default function BlogEditorPage() {
  const navigate = useNavigate();
  const { blogId } = useParams();

  // /app/blogs/write is CREATE mode. Only a real id is EDIT mode.
  const normalizedBlogId = String(blogId || "").trim().toLowerCase();
  const isEditing =
    Boolean(blogId) && normalizedBlogId !== "write" && normalizedBlogId !== "new";

  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);

  const [title, setTitle] = useState("");
  const [coverKey, setCoverKey] = useState(BLOG_ILLUSTRATIONS[0]?.key || "");
  const [currentBlog, setCurrentBlog] = useState(null);
  const [initialDocument, setInitialDocument] = useState(emptyBlogDocument());
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [visibilityModalOpen, setVisibilityModalOpen] = useState(false);
  const [publishVisibility, setPublishVisibility] = useState("PUBLIC");
  const [previewing, setPreviewing] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(emptyBlogDocument());

  useEffect(() => {
    if (!isEditing) {
      setLoading(false);
      setCurrentBlog(null);
      setInitialDocument(emptyBlogDocument());
      return undefined;
    }

    let cancelled = false;

    async function loadBlog() {
      setLoading(true);
      setError("");

      try {
        const blog = await getBlogById(blogId);
        if (cancelled) return;

        if (!blog?.isOwner) {
          setError("Only the author can edit this blog.");
          return;
        }

        setCurrentBlog(blog);
        setTitle(blog.title || "");
        setCoverKey(
          blog.coverIllustrationKey || BLOG_ILLUSTRATIONS[0]?.key || ""
        );
        setInitialDocument(blog.content || emptyBlogDocument());
        setPublishVisibility(blog.visibility || "PUBLIC");
      } catch (loadError) {
        if (!cancelled) {
          setError(
            getBlogErrorMessage(
              loadError,
              "We couldn't open this blog for editing."
            )
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBlog();

    return () => {
      cancelled = true;
    };
  }, [blogId, isEditing]);

  useEffect(() => {
    if (!loading && editorRef.current) {
      editorRef.current.innerHTML = documentToEditorHtml(initialDocument);
    }
  }, [loading, initialDocument]);

  const previewImage = useMemo(
    () => getBlogIllustration(coverKey),
    [coverKey]
  );

  function rememberSelection() {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    if (editorRef.current.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }

  function restoreSelection() {
    const range = savedRangeRef.current;
    if (!range) return;

    const selection = window.getSelection();
    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(range);
  }

  function runCommand(command, value = null) {
    if (!editorRef.current || typeof document.execCommand !== "function") return;

    editorRef.current.focus();
    restoreSelection();

    try {
      document.execCommand("styleWithCSS", false, true);
    } catch {
      // Some browsers do not expose styleWithCSS; the command still works.
    }

    document.execCommand(command, false, value);
    rememberSelection();
  }

  function applyBlockFormat(tagName) {
    runCommand("formatBlock", tagName);
  }

  function applyFontSize(size) {
    if (!editorRef.current || !size) return;

    editorRef.current.focus();
    restoreSelection();

    // contentEditable has no native exact-pixel command. Use a temporary
    // <font size="7"> then immediately replace it with a styled <span>.
    document.execCommand("fontSize", false, "7");

    editorRef.current.querySelectorAll('font[size="7"]').forEach((font) => {
      const span = document.createElement("span");
      span.style.fontSize = `${size}px`;

      while (font.firstChild) {
        span.appendChild(font.firstChild);
      }

      font.replaceWith(span);
    });

    rememberSelection();
  }

  function applyHighlight(color) {
    if (!editorRef.current) return;

    editorRef.current.focus();
    restoreSelection();

    let applied = false;
    try {
      applied = document.execCommand("hiliteColor", false, color);
    } catch {
      applied = false;
    }

    if (!applied) {
      document.execCommand("backColor", false, color);
    }

    rememberSelection();
  }

  function addLink() {
    const entered = window.prompt("Paste the link you want to add:");
    if (!entered) return;

    let href = entered.trim();
    if (
      href &&
      !/^https?:\/\//i.test(href) &&
      !/^mailto:/i.test(href) &&
      !/^tel:/i.test(href) &&
      !href.startsWith("/") &&
      !href.startsWith("#")
    ) {
      href = `https://${href}`;
    }

    runCommand("createLink", href);
  }

  function scrollToCovers() {
    document.getElementById("blog-cover-picker")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  function getCurrentDocument() {
    return editorDomToDocument(editorRef.current);
  }

  function validateDraft() {
    const cleanTitle = title.trim();
    const docData = getCurrentDocument();
    const plainText = documentPlainText(docData);

    if (!cleanTitle) {
      setError("Give your blog a title before saving.");
      return null;
    }

    if (cleanTitle.length > 200) {
      setError("Blog title cannot exceed 200 characters.");
      return null;
    }

    if (!coverKey) {
      setError("Please select a cover illustration.");
      scrollToCovers();
      return null;
    }

    if (!plainText.trim()) {
      setError("Write something in your blog before saving.");
      editorRef.current?.focus();
      return null;
    }

    setError("");

    return {
      title: cleanTitle,
      content: docData,
      coverIllustrationKey: coverKey,
    };
  }

  async function saveDraft() {
    const payload = validateDraft();
    if (!payload || saving) return;

    setSaving(true);
    setNotice("");
    setError("");

    try {
      if (currentBlog?.id || isEditing) {
        const id = currentBlog?.id || blogId;
        const updated = await updateBlog(id, payload);
        setCurrentBlog((old) => ({ ...old, ...updated, id }));
        setNotice("Draft saved.");
      } else {
        // Backend has PUBLIC / PRIVATE only. A new draft is stored PRIVATE.
        const created = await createBlog({
          ...payload,
          visibility: "PRIVATE",
        });

        setCurrentBlog(created);
        setPublishVisibility("PRIVATE");
        setNotice("Draft saved privately.");

        navigate(`${ROOT_ROUTE}/${created.id}/edit`, { replace: true });
      }
    } catch (saveError) {
      setError(
        getBlogErrorMessage(saveError, "We couldn't save your draft.")
      );
    } finally {
      setSaving(false);
    }
  }

  function showPreview() {
    setPreviewDocument(getCurrentDocument());
    setPreviewing(true);
  }

  function openPublishModal() {
    const payload = validateDraft();
    if (!payload) return;

    setPublishVisibility(currentBlog?.visibility || "PUBLIC");
    setVisibilityModalOpen(true);
  }

  async function confirmPublish() {
    const payload = validateDraft();
    if (!payload || saving) return;

    setSaving(true);
    setError("");

    try {
      let savedBlog = currentBlog;

      if (savedBlog?.id || isEditing) {
        const id = savedBlog?.id || blogId;
        const updated = await updateBlog(id, payload);
        savedBlog = { ...savedBlog, ...updated, id };

        if (savedBlog.visibility !== publishVisibility) {
          const visibilityUpdate = await updateBlogVisibility(
            id,
            publishVisibility
          );

          savedBlog = {
            ...savedBlog,
            ...visibilityUpdate,
            visibility: publishVisibility,
          };
        }
      } else {
        savedBlog = await createBlog({
          ...payload,
          visibility: publishVisibility,
        });
      }

      setVisibilityModalOpen(false);
      navigate(`${ROOT_ROUTE}/${savedBlog.id}`, { replace: true });
    } catch (publishError) {
      setError(
        getBlogErrorMessage(publishError, "We couldn't publish your blog.")
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="blog-editor-page">
          <div className="blogs-loading-panel">Loading your blog...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="blog-editor-page">
        <div className="blog-editor-topbar">
          <button
            type="button"
            className="blog-back-button"
            onClick={() => navigate(ROOT_ROUTE)}
          >
            <ArrowLeft size={17} /> Back
          </button>

          <div className="blog-editor-topbar__actions">
            <button
              type="button"
              className="blog-secondary-button"
              onClick={saveDraft}
              disabled={saving}
            >
              <Save size={17} /> Save Draft
            </button>

            <button
              type="button"
              className="blog-secondary-button"
              onClick={showPreview}
              disabled={saving}
            >
              <Eye size={17} /> Preview
            </button>

            <button
              type="button"
              className="blog-primary-button"
              onClick={openPublishModal}
              disabled={saving}
            >
              <Globe2 size={17} /> {isEditing ? "Update blog" : "Publish blog"}
            </button>
          </div>
        </div>

        {error ? <div className="blog-inline-error">{error}</div> : null}
        {notice ? <div className="blog-inline-success">{notice}</div> : null}

        <section className="blog-editor-card">
          <div
            className="blog-editor-toolbar"
            role="toolbar"
            aria-label="Blog formatting"
          >
            <div className="blog-toolbar-group blog-toolbar-group--selects">
              <select
                className="blog-toolbar-select blog-toolbar-select--style"
                defaultValue="P"
                aria-label="Text style"
                onMouseDown={rememberSelection}
                onChange={(event) => applyBlockFormat(event.target.value)}
              >
                <option value="P">Normal text</option>
                <option value="H1">Heading 1</option>
                <option value="H2">Heading 2</option>
                <option value="H3">Heading 3</option>
                <option value="H4">Heading 4</option>
                <option value="H5">Heading 5</option>
                <option value="BLOCKQUOTE">Quote</option>
              </select>

              <select
                className="blog-toolbar-select blog-toolbar-select--font"
                defaultValue="Roboto"
                aria-label="Font family"
                onMouseDown={rememberSelection}
                onChange={(event) => runCommand("fontName", event.target.value)}
              >
                <option value="Roboto">Roboto</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Verdana">Verdana</option>
                <option value="Courier New">Courier New</option>
              </select>

              <select
                className="blog-toolbar-select blog-toolbar-select--size"
                defaultValue="16"
                aria-label="Font size"
                onMouseDown={rememberSelection}
                onChange={(event) => applyFontSize(Number(event.target.value))}
              >
                <option value="12">12</option>
                <option value="14">14</option>
                <option value="16">16</option>
                <option value="18">18</option>
                <option value="20">20</option>
                <option value="24">24</option>
                <option value="28">28</option>
                <option value="32">32</option>
                <option value="36">36</option>
                <option value="40">40</option>
                <option value="48">48</option>
              </select>
            </div>

            <span className="blog-toolbar-divider" />

            <div className="blog-toolbar-group">
              <ToolbarButton title="Undo" onMouseDown={() => runCommand("undo")}>
                <Undo2 size={18} />
              </ToolbarButton>
              <ToolbarButton title="Redo" onMouseDown={() => runCommand("redo")}>
                <Redo2 size={18} />
              </ToolbarButton>
            </div>

            <span className="blog-toolbar-divider" />

            <div className="blog-toolbar-group">
              <ToolbarButton title="Bold" onMouseDown={() => runCommand("bold")}>
                <Bold size={18} />
              </ToolbarButton>
              <ToolbarButton
                title="Italic"
                onMouseDown={() => runCommand("italic")}
              >
                <Italic size={18} />
              </ToolbarButton>
              <ToolbarButton
                title="Underline"
                onMouseDown={() => runCommand("underline")}
              >
                <Underline size={18} />
              </ToolbarButton>
              <ToolbarButton
                title="Strikethrough"
                onMouseDown={() => runCommand("strikeThrough")}
              >
                <Strikethrough size={18} />
              </ToolbarButton>
            </div>

            <span className="blog-toolbar-divider" />

            <div className="blog-toolbar-group">
              <label className="blog-color-control" title="Text colour">
                <span className="blog-color-control__letter">A</span>
                <span className="blog-color-control__line" />
                <input
                  type="color"
                  defaultValue="#2a211c"
                  aria-label="Text colour"
                  onMouseDown={rememberSelection}
                  onChange={(event) =>
                    runCommand("foreColor", event.target.value)
                  }
                />
              </label>

              <label className="blog-color-control" title="Highlight colour">
                <span className="blog-highlight-symbol">A</span>
                <span className="blog-highlight-symbol__background" />
                <input
                  type="color"
                  defaultValue="#fff2b8"
                  aria-label="Highlight colour"
                  onMouseDown={rememberSelection}
                  onChange={(event) => applyHighlight(event.target.value)}
                />
              </label>
            </div>

            <span className="blog-toolbar-divider" />

            <div className="blog-toolbar-group">
              <ToolbarButton
                title="Align left"
                onMouseDown={() => runCommand("justifyLeft")}
              >
                <AlignLeft size={18} />
              </ToolbarButton>
              <ToolbarButton
                title="Align centre"
                onMouseDown={() => runCommand("justifyCenter")}
              >
                <AlignCenter size={18} />
              </ToolbarButton>
              <ToolbarButton
                title="Align right"
                onMouseDown={() => runCommand("justifyRight")}
              >
                <AlignRight size={18} />
              </ToolbarButton>
              <ToolbarButton
                title="Justify"
                onMouseDown={() => runCommand("justifyFull")}
              >
                <AlignJustify size={18} />
              </ToolbarButton>
            </div>

            <span className="blog-toolbar-divider" />

            <div className="blog-toolbar-group">
              <ToolbarButton
                title="Bulleted list"
                onMouseDown={() => runCommand("insertUnorderedList")}
              >
                <List size={18} />
              </ToolbarButton>
              <ToolbarButton
                title="Numbered list"
                onMouseDown={() => runCommand("insertOrderedList")}
              >
                <ListOrdered size={18} />
              </ToolbarButton>
              <ToolbarButton title="Add link" onMouseDown={addLink}>
                <Link2 size={18} />
              </ToolbarButton>
              <ToolbarButton
                title="Clear formatting"
                onMouseDown={() => runCommand("removeFormat")}
              >
                <Eraser size={18} />
              </ToolbarButton>
            </div>

            <span className="blog-toolbar-divider" />

            <button
              type="button"
              className="blog-toolbar-cover-button"
              onClick={scrollToCovers}
              title="Choose cover illustration"
            >
              <ImageIcon size={17} />
              Cover
            </button>
          </div>

          <input
            type="text"
            className="blog-title-input"
            value={title}
            maxLength={200}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Give your blog a title"
            aria-label="Blog title"
          />

          <div
            ref={editorRef}
            className="blog-rich-editor"
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Start writing your thoughts..."
            aria-label="Blog content"
            onMouseUp={rememberSelection}
            onKeyUp={rememberSelection}
            onInput={rememberSelection}
            onFocus={rememberSelection}
          />
        </section>

        <CoverPicker selectedKey={coverKey} onSelect={setCoverKey} />

        {previewing ? (
          <div className="blog-preview-backdrop">
            <section
              className="blog-preview-panel"
              role="dialog"
              aria-modal="true"
            >
              <div className="blog-preview-panel__top">
                <strong>Preview</strong>
                <button
                  type="button"
                  onClick={() => setPreviewing(false)}
                  aria-label="Close preview"
                >
                  <X size={20} />
                </button>
              </div>

              {previewImage ? (
                <img src={previewImage} alt="" className="blog-preview-cover" />
              ) : null}

              <h1>{title.trim() || "Untitled blog"}</h1>
              <BlogContent document={previewDocument} />
            </section>
          </div>
        ) : null}

        <SelectionModal
          open={visibilityModalOpen}
          visibility={publishVisibility}
          onVisibilityChange={setPublishVisibility}
          onClose={() => setVisibilityModalOpen(false)}
          onConfirm={confirmPublish}
          saving={saving}
        />
      </div>
    </AppLayout>
  );
}
