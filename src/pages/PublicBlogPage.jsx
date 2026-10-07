import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useParams } from "react-router-dom";

import { getPublicBlogByToken, getBlogErrorMessage } from "../api/blogApi";
import { BlogContent } from "../components/blog/BlogContent";
import {
  getBlogIllustration,
  getInitials,
  getProfileAvatar,
} from "../utils/blogAssets";

import anandamLogo from "../assets/anandum logo.png";
import "../styles/blogs.css";

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

export default function PublicBlogPage() {
  const { shareToken } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadBlog() {
      setLoading(true);
      setError("");

      try {
        const data = await getPublicBlogByToken(shareToken);
        if (!cancelled) setBlog(data);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            getBlogErrorMessage(
              loadError,
              "This public blog is unavailable or no longer public."
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
  }, [shareToken]);

  if (loading) {
    return (
      <div className="public-blog-page">
        <header className="public-blog-header">
          <img src={anandamLogo} alt="Anandam" />
        </header>
        <main className="public-blog-content-shell">
          <div className="blogs-loading-panel">Loading blog...</div>
        </main>
      </div>
    );
  }

  if (!blog || error) {
    return (
      <div className="public-blog-page">
        <header className="public-blog-header">
          <img src={anandamLogo} alt="Anandam" />
        </header>
        <main className="public-blog-content-shell">
          <div className="public-blog-unavailable">
            <h1>Blog unavailable</h1>
            <p>{error || "This blog is no longer available."}</p>
          </div>
        </main>
      </div>
    );
  }

  const authorName = blog?.author?.fullName || "Anandam member";
  const avatar = getProfileAvatar(blog?.author);

  return (
    <div className="public-blog-page">
      <header className="public-blog-header">
        <img src={anandamLogo} alt="Anandam" />
        <span>Shared from Anandam</span>
      </header>

      <main className="public-blog-content-shell">
        <article className="blog-reading-card blog-reading-card--public">
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
      </main>
    </div>
  );
}
