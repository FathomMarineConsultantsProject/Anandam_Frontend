import { useEffect, useMemo, useState } from "react";
import { PenLine, Search, RefreshCw } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import {
  getMyBlogs,
  getPublicBlogs,
  getBlogErrorMessage,
} from "../api/blogApi";
import {
  getBlogIllustration,
  getInitials,
  getProfileAvatar,
} from "../utils/blogAssets";
import { getStoredUser } from "../utils/storage";

import "../styles/blogs.css";

const ROOT_ROUTE = "/app/blogs";

function formatBlogDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function BlogCard({ blog, fallbackAuthor, onOpen }) {
  const authorName = blog?.author?.fullName || fallbackAuthor || "Crew member";
  const avatar = getProfileAvatar(blog?.author);
  const date = blog?.publishedAt || blog?.updatedAt || blog?.createdAt;

  return (
    <article className="blog-card">
      <button
        type="button"
        className="blog-card__image-button"
        onClick={() => onOpen(blog)}
        aria-label={`Open ${blog?.title || "blog"}`}
      >
        <img
          src={getBlogIllustration(blog?.coverIllustrationKey)}
          alt=""
          className="blog-card__image"
        />
      </button>

      <div className="blog-card__body">
        <div className="blog-card__meta">
          <div className="blog-card__author">
            {avatar ? (
              <img src={avatar} alt="" className="blog-card__avatar" />
            ) : (
              <span className="blog-card__initials">
                {getInitials(authorName)}
              </span>
            )}
            <span>{authorName}</span>
          </div>

          <span>{formatBlogDate(date)}</span>
        </div>

        <div className="blog-card__divider" />

        <h2>{blog?.title || "Untitled blog"}</h2>

        {blog?.excerpt ? (
          <p className="blog-card__excerpt">{blog.excerpt}</p>
        ) : null}

        <button
          type="button"
          className="blog-card__view"
          onClick={() => onOpen(blog)}
        >
          View post
        </button>
      </div>
    </article>
  );
}

function BlogCardSkeleton() {
  return (
    <div className="blog-card blog-card--skeleton" aria-hidden="true">
      <div className="blog-skeleton blog-skeleton--cover" />
      <div className="blog-card__body">
        <div className="blog-skeleton blog-skeleton--line short" />
        <div className="blog-skeleton blog-skeleton--line" />
        <div className="blog-skeleton blog-skeleton--line medium" />
      </div>
    </div>
  );
}

function EmptyBlogs({ tab, hasSearch }) {
  return (
    <div className="blogs-empty-state">
      <div className="blogs-empty-state__icon">✎</div>
      <h2>
        {hasSearch
          ? "No matching blogs"
          : tab === "mine"
          ? "You haven't written a blog yet"
          : "No public blogs yet"}
      </h2>
      <p>
        {hasSearch
          ? "Try a different title or author name."
          : tab === "mine"
          ? "Your published and private blogs will appear here."
          : "Shared experiences from the Anandam community will appear here."}
      </p>
    </div>
  );
}

export default function BlogsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const storedUser = getStoredUser();

  const initialTab = searchParams.get("tab") === "mine" ? "mine" : "explore";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [query, setQuery] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(location.state?.blogToast || "");


  useEffect(() => {
    if (!location.state?.blogToast) return undefined;

    setToast(location.state.blogToast);
    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: {},
    });

    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    let cancelled = false;

    async function loadBlogs() {
      setLoading(true);
      setError("");

      try {
        const data =
          activeTab === "mine" ? await getMyBlogs() : await getPublicBlogs();

        if (!cancelled) {
          setBlogs(Array.isArray(data) ? data : []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            getBlogErrorMessage(loadError, "We couldn't load the blogs right now.")
          );
          setBlogs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBlogs();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  function changeTab(tab) {
    setActiveTab(tab);
    setQuery("");

    if (tab === "mine") {
      setSearchParams({ tab: "mine" }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }

  const filteredBlogs = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return blogs;

    return blogs.filter((blog) => {
      const title = String(blog?.title || "").toLowerCase();
      const author = String(
        blog?.author?.fullName ||
          (activeTab === "mine" ? storedUser?.fullName || "" : "")
      ).toLowerCase();

      return title.includes(search) || author.includes(search);
    });
  }, [blogs, query, activeTab, storedUser?.fullName]);

  function openBlog(blog) {
    if (!blog?.id) return;
    navigate(`${ROOT_ROUTE}/${blog.id}`);
  }

  return (
    <AppLayout>
      <div className="blogs-page">
        {toast ? (
          <div className="blog-toast blog-toast--success">
            <strong>{toast}</strong>
            <span>Your blog has been successfully deleted.</span>
          </div>
        ) : null}
        <header className="blogs-page__heading">
          <div>
            <h1>Blogs</h1>
            <p>Read shared experiences or make space for your own.</p>
          </div>
        </header>

        <div className="blogs-toolbar-row">
          <div className="blogs-tabs" role="tablist" aria-label="Blog views">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "explore"}
              className={activeTab === "explore" ? "is-active" : ""}
              onClick={() => changeTab("explore")}
            >
              Explore
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "mine"}
              className={activeTab === "mine" ? "is-active" : ""}
              onClick={() => changeTab("mine")}
            >
              My blogs
            </button>
          </div>

          <button
            type="button"
            className="blog-primary-button"
            onClick={() => navigate(`${ROOT_ROUTE}/write`)}
          >
            <PenLine size={17} strokeWidth={1.6} />
            Write a blog
          </button>
        </div>

        <label className="blogs-search">
          <Search size={20} strokeWidth={1.6} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search blogs by title or author"
            aria-label="Search blogs by title or author"
          />
        </label>

        {error ? (
          <div className="blog-inline-error">
            <span>{error}</span>
            <button type="button" onClick={() => window.location.reload()}>
              <RefreshCw size={15} /> Retry
            </button>
          </div>
        ) : null}

        <section className="blogs-grid" aria-busy={loading}>
          {loading
            ? Array.from({ length: 6 }, (_, index) => (
                <BlogCardSkeleton key={index} />
              ))
            : filteredBlogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  fallbackAuthor={
                    activeTab === "mine"
                      ? storedUser?.fullName || "You"
                      : "Crew member"
                  }
                  onOpen={openBlog}
                />
              ))}
        </section>

        {!loading && !error && filteredBlogs.length === 0 ? (
          <EmptyBlogs tab={activeTab} hasSearch={Boolean(query.trim())} />
        ) : null}
      </div>
    </AppLayout>
  );
}
