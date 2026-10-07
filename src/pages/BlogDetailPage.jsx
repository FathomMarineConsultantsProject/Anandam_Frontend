import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  Globe2,
  Lock,
  Share2,
  Trash2,
  X,
  CheckCircle2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import {
  deleteBlog,
  getBlogById,
  getBlogErrorMessage,
  updateBlogVisibility,
} from "../api/blogApi";
import { BlogContent } from "../components/blog/BlogContent";
import {
  getBlogIllustration,
  getInitials,
  getProfileAvatar,
} from "../utils/blogAssets";

import "../styles/blogs.css";

const ROOT_ROUTE = "/app/blogs";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ShareModal({ blog, onClose }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = blog?.publicUrl || "";

  async function copyLink() {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link:", shareUrl);
    }
  }

  function openShare(target) {
    if (!shareUrl) return;

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(blog?.title || "Anandam blog");

    const urls = {
      x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      threads: `https://www.threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`,
    };

    window.open(urls[target], "_blank", "noopener,noreferrer,width=700,height=600");
  }

  return (
    <div className="blog-modal-backdrop" role="presentation">
      <section className="blog-modal blog-share-modal" role="dialog" aria-modal="true">
        <button
          type="button"
          className="blog-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2>Share this blog</h2>

        <div className="blog-social-row">
          <button type="button" onClick={() => openShare("x")} aria-label="Share on X">
            X
          </button>
          <button
            type="button"
            className="is-linkedin"
            onClick={() => openShare("linkedin")}
            aria-label="Share on LinkedIn"
          >
            in
          </button>
          <button
            type="button"
            onClick={() => openShare("threads")}
            aria-label="Share on Threads"
          >
            @
          </button>
        </div>

        <label className="blog-share-link-label">Share This Link</label>
        <div className="blog-share-link-row">
          <input value={shareUrl} readOnly aria-label="Public blog link" />
          <button type="button" className="blog-primary-button" onClick={copyLink}>
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </section>
    </div>
  );
}

function DeleteModal({ title, deleting, onCancel, onDelete }) {
  return (
    <div className="blog-modal-backdrop" role="presentation">
      <section className="blog-modal blog-delete-modal" role="dialog" aria-modal="true">
        <button
          type="button"
          className="blog-modal__close"
          onClick={onCancel}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2>Delete this Blog?</h2>
        <p>
          This will permanently delete <strong>{title || "your blog"}</strong> and its
          public link. You won't be able to undo this.
        </p>

        <div className="blog-modal__actions">
          <button type="button" className="blog-secondary-button" onClick={onCancel}>
            Keep blog
          </button>
          <button
            type="button"
            className="blog-danger-button"
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Blog"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function BlogDetailPage() {
  const navigate = useNavigate();
  const { blogId } = useParams();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingVisibility, setUpdatingVisibility] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadBlog() {
      setLoading(true);
      setError("");

      try {
        const data = await getBlogById(blogId);
        if (!cancelled) setBlog(data);
      } catch (loadError) {
        if (!cancelled) {
          setError(getBlogErrorMessage(loadError, "We couldn't load this blog."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBlog();

    return () => {
      cancelled = true;
    };
  }, [blogId]);

  async function toggleVisibility() {
    if (!blog?.isOwner || updatingVisibility) return;

    const nextVisibility = blog.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    setUpdatingVisibility(true);
    setError("");

    try {
      const updated = await updateBlogVisibility(blog.id, nextVisibility);

      setBlog((current) => ({
        ...current,
        ...updated,
        visibility: nextVisibility,
        canShare: nextVisibility === "PUBLIC",
        publicUrl:
          nextVisibility === "PUBLIC"
            ? updated?.publicUrl || current?.publicUrl || null
            : null,
      }));

      setToast(
        nextVisibility === "PUBLIC"
          ? "Blog is now public."
          : "Blog is now private. The previous public link no longer works."
      );
      window.setTimeout(() => setToast(""), 2800);
    } catch (visibilityError) {
      setError(
        getBlogErrorMessage(visibilityError, "We couldn't change blog visibility.")
      );
    } finally {
      setUpdatingVisibility(false);
    }
  }

  async function confirmDelete() {
    if (!blog?.id || deleting) return;

    setDeleting(true);
    setError("");

    try {
      await deleteBlog(blog.id);
      setDeleteOpen(false);
      navigate(`${ROOT_ROUTE}?tab=mine`, {
        replace: true,
        state: { blogToast: "Blog deleted" },
      });
    } catch (deleteError) {
      setError(getBlogErrorMessage(deleteError, "We couldn't delete this blog."));
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="blog-detail-page">
          <div className="blogs-loading-panel">Loading blog...</div>
        </div>
      </AppLayout>
    );
  }

  if (error && !blog) {
    return (
      <AppLayout>
        <div className="blog-detail-page">
          <button type="button" className="blog-back-button" onClick={() => navigate(ROOT_ROUTE)}>
            <ArrowLeft size={17} /> Back
          </button>
          <div className="blog-inline-error">{error}</div>
        </div>
      </AppLayout>
    );
  }

  const authorName = blog?.author?.fullName || "Crew member";
  const avatar = getProfileAvatar(blog?.author);
  const isPublic = blog?.visibility === "PUBLIC";

  return (
    <AppLayout>
      <div className="blog-detail-page">
        {toast ? <div className="blog-toast blog-toast--success">{toast}</div> : null}

        <div className="blog-detail-topbar">
          <button type="button" className="blog-back-button" onClick={() => navigate(ROOT_ROUTE)}>
            <ArrowLeft size={17} /> Back
          </button>

          <div className="blog-detail-actions">
            {blog?.isOwner ? (
              <span className={`blog-visibility-chip ${isPublic ? "is-public" : "is-private"}`}>
                {isPublic ? <Globe2 size={15} /> : <Lock size={15} />}
                {isPublic ? "Public" : "Private"}
              </span>
            ) : null}

            {isPublic ? (
              <button
                type="button"
                className="blog-secondary-button"
                onClick={() => setShareOpen(true)}
              >
                <Share2 size={16} /> Share
              </button>
            ) : null}

            {blog?.isOwner ? (
              <>
                <button
                  type="button"
                  className="blog-secondary-button"
                  onClick={toggleVisibility}
                  disabled={updatingVisibility}
                >
                  {isPublic ? <Lock size={16} /> : <Globe2 size={16} />}
                  {updatingVisibility
                    ? "Updating..."
                    : isPublic
                    ? "Make it Private"
                    : "Make it Public"}
                </button>

                <button
                  type="button"
                  className="blog-secondary-button"
                  onClick={() => navigate(`${ROOT_ROUTE}/${blog.id}/edit`)}
                >
                  <Edit3 size={16} /> Edit
                </button>

                <button
                  type="button"
                  className="blog-danger-outline-button"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 size={17} /> Delete blog
                </button>
              </>
            ) : null}
          </div>
        </div>

        {error ? <div className="blog-inline-error">{error}</div> : null}

        <article className="blog-reading-card">
          <img
            src={getBlogIllustration(blog?.coverIllustrationKey)}
            alt=""
            className="blog-reading-cover"
          />

          <div className="blog-reading-body">
            <h1>{blog?.title || "Untitled blog"}</h1>

            <div className="blog-reading-meta">
              <div className="blog-reading-author">
                {avatar ? (
                  <img src={avatar} alt="" />
                ) : (
                  <span>{getInitials(authorName)}</span>
                )}
                <strong>{authorName}</strong>
              </div>

              <div className="blog-reading-date">
                <CalendarDays size={17} strokeWidth={1.5} />
                {formatDate(blog?.publishedAt || blog?.createdAt)}
              </div>

              {blog?.readingTimeMinutes ? (
                <span className="blog-reading-time">
                  {blog.readingTimeMinutes} min read
                </span>
              ) : null}
            </div>

            <div className="blog-reading-divider" />
            <BlogContent document={blog?.content} />
          </div>
        </article>

        {isPublic && blog?.publicUrl ? (
          <a
            className="blog-public-link-inline"
            href={blog.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open public version <ExternalLink size={14} />
          </a>
        ) : null}

        {shareOpen ? <ShareModal blog={blog} onClose={() => setShareOpen(false)} /> : null}
        {deleteOpen ? (
          <DeleteModal
            title={blog?.title}
            deleting={deleting}
            onCancel={() => setDeleteOpen(false)}
            onDelete={confirmDelete}
          />
        ) : null}
      </div>
    </AppLayout>
  );
}
