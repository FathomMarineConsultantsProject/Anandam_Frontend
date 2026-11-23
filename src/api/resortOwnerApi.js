/** Resort-owner API. Pass the existing access JWT from your login integration. */
const LIMIT = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export function createResortOwnerApi({ token, baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000' }) {
  const prefix = `${baseUrl.replace(/\/$/, '')}/api/resort-owner`;
  const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
  async function request(path, method = 'GET', body) {
    if (!token) throw new Error('Please sign in as a resort owner.');
    const response = await fetch(prefix + path, {
      method, headers: headers(), ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const details = Array.isArray(payload.fields) && payload.fields.length ? ` Missing: ${payload.fields.join(', ')}` : '';
      throw new Error((payload.message || `Request failed (${response.status})`) + details);
    }
    return payload;
  }
  return {
    getCatalog: () => request('/catalog'),
    list: () => request('/properties'),
    create: (name) => request('/properties', 'POST', name ? { name } : {}),
    get: (id) => request(`/properties/${encodeURIComponent(id)}`),
    section: (id, section, data) => request(`/properties/${encodeURIComponent(id)}/sections/${section}`, 'PATCH', data),
    createRoom: (id, data) => request(`/properties/${encodeURIComponent(id)}/rooms`, 'POST', data),
    updateRoom: (id, roomId, data) => request(`/properties/${encodeURIComponent(id)}/rooms/${encodeURIComponent(roomId)}`, 'PATCH', data),
    deleteRoom: (id, roomId) => request(`/properties/${encodeURIComponent(id)}/rooms/${encodeURIComponent(roomId)}`, 'DELETE'),
    review: (id) => request(`/properties/${encodeURIComponent(id)}/review`),
    publish: (id) => request(`/properties/${encodeURIComponent(id)}/publish`, 'POST', { confirmedAccurate: true }),
    visibility: (id, status) => request(`/properties/${encodeURIComponent(id)}/visibility`, 'PATCH', { status }),
    deleteImage: (id, imageId) => request(`/properties/${encodeURIComponent(id)}/images/${encodeURIComponent(imageId)}`, 'DELETE'),
    async uploadImage(id, file, kind, roomTypeId = null) {
      if (!(file instanceof File)) throw new Error('Choose an image file.');
      if (!ALLOWED.includes(file.type)) throw new Error('Only JPEG, PNG and WebP images are supported.');
      if (!file.size || file.size > LIMIT) throw new Error('Each image must be 5 MB or smaller.');
      if (kind === 'ROOM' && !roomTypeId) throw new Error('Save the room before uploading its photos.');
      const metadata = { kind, fileName: file.name, contentType: file.type, sizeBytes: file.size, ...(roomTypeId ? { roomTypeId } : {}) };
      const signed = await request(`/properties/${encodeURIComponent(id)}/images/presign`, 'POST', metadata);
      // IMPORTANT: The signed PUT sends raw file bytes, NOT form-data and NOT JSON.
      // Do not send the app Authorization header to the Vercel URL.
      const uploaded = await fetch(signed.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!uploaded.ok) throw new Error(`Image upload failed (${uploaded.status}): ${(await uploaded.text()).slice(0, 250)}`);
      return request(`/properties/${encodeURIComponent(id)}/images/confirm`, 'POST', {
        kind, pathname: signed.pathname, fileName: file.name, ...(roomTypeId ? { roomTypeId } : {}),
      });
    },
  };
}
