import { apiRequest } from "./client";

const BLOG_ROOT = "/blogs";

function unwrapData(response) {
  if (
    response &&
    typeof response === "object" &&
    Object.prototype.hasOwnProperty.call(response, "data")
  ) {
    return response.data;
  }

  return response;
}

export function getBlogErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const backendMessage =
    error?.data?.error ||
    error?.response?.data?.error ||
    error?.error ||
    error?.message ||
    "";

  const status =
    error?.status ||
    error?.response?.status ||
    error?.statusCode ||
    null;

  if (status === 400) {
    return backendMessage || "Please check the blog details and try again.";
  }

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (status === 403) {
    return "You don't have permission to do that.";
  }

  if (status === 404) {
    return backendMessage || "This blog could not be found.";
  }

  if (status === 409) {
    return backendMessage || "This blog changed while you were editing it. Please refresh and try again.";
  }

  if (status === 429) {
    return "Too many requests were sent. Please wait a moment and try again.";
  }

  if (status && status >= 500) {
    return "The blog service is temporarily unavailable. Please try again.";
  }

  return backendMessage || fallback;
}

export async function getPublicBlogs() {
  const response = await apiRequest(BLOG_ROOT, {
    method: "GET",
  });

  const data = unwrapData(response);
  return Array.isArray(data) ? data : [];
}

export async function getMyBlogs() {
  const response = await apiRequest(`${BLOG_ROOT}/mine`, {
    method: "GET",
  });

  const data = unwrapData(response);
  return Array.isArray(data) ? data : [];
}

export async function getBlogById(blogId) {
  const response = await apiRequest(
    `${BLOG_ROOT}/${encodeURIComponent(blogId)}`,
    { method: "GET" }
  );

  return unwrapData(response);
}

// This route is intentionally public in the backend.
// apiRequest may still attach a token when one exists, but a token must not be
// required for this endpoint.
export async function getPublicBlogByToken(shareToken) {
  const response = await apiRequest(
    `${BLOG_ROOT}/public/${encodeURIComponent(shareToken)}`,
    { method: "GET" }
  );

  return unwrapData(response);
}

export async function createBlog({
  title,
  content,
  coverIllustrationKey,
  visibility,
}) {
  const response = await apiRequest(BLOG_ROOT, {
    method: "POST",
    body: JSON.stringify({
      title,
      content,
      coverIllustrationKey,
      visibility,
    }),
  });

  return unwrapData(response);
}

// Visibility is deliberately NOT accepted here because the backend rotates /
// invalidates the public share token in the dedicated visibility endpoint.
export async function updateBlog(blogId, updates = {}) {
  const payload = {};

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.content !== undefined) payload.content = updates.content;
  if (updates.coverIllustrationKey !== undefined) {
    payload.coverIllustrationKey = updates.coverIllustrationKey;
  }

  const response = await apiRequest(
    `${BLOG_ROOT}/${encodeURIComponent(blogId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );

  return unwrapData(response);
}

export async function updateBlogVisibility(blogId, visibility) {
  const response = await apiRequest(
    `${BLOG_ROOT}/${encodeURIComponent(blogId)}/visibility`,
    {
      method: "PATCH",
      body: JSON.stringify({ visibility }),
    }
  );

  return unwrapData(response);
}

export async function deleteBlog(blogId) {
  return apiRequest(`${BLOG_ROOT}/${encodeURIComponent(blogId)}`, {
    method: "DELETE",
  });
}
