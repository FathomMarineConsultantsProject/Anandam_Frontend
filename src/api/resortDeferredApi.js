import { registerUser } from './authApi';
import { createResortOwnerApi } from './resortOwnerApi';
import { peekResortSignup, clearResortSignup } from './resortSignupDraft';

const FIELDS = {
  basic: ['name','resortRating','websiteUrl','propertyType','description'],
  location: ['country','addressLine1','addressLine2','city','stateRegion','postalCode','googleMapsUrl'],
  amenities: ['amenities'], photos: [], rooms: [],
  contact: ['contactName','enquiryEmail','phoneNumber'],
  rules: ['smokingPolicy','petsPolicy','alcoholPolicy','additionalRules'],
};
const REQUIRED = [
  'name','resortRating','websiteUrl','propertyType','description',
  'country','addressLine1','city','stateRegion','postalCode','googleMapsUrl',
  'contactName','enquiryEmail','phoneNumber','smokingPolicy','petsPolicy','alcoholPolicy'
];
const empty = { status:'DRAFT', onboardingStep:1, onboardingCompleted:false, rooms:[], images:[] };
let nextId = 0;
const newId = (prefix) => `draft_${prefix}_${++nextId}`;

// In-memory adapter for the existing 8-step UI. No backend requests until Publish.
export function createResortDeferredApi({ baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000' } = {}) {
  const draft = { ...empty, id:'local-resort-draft', slug:'', amenities:[], rooms:[], images:[] };
  const blobs = new Map();
  let createdToken = '';
  let serverId = '';
  const apiOrigin = baseUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  // Verify that the target backend has the resort-owner route BEFORE creating an account.
  // The endpoint is protected, so 401/403 indicates the route exists; 404 indicates it does not.
  async function verifyResortApi() {
    let response;
    try {
      response = await fetch(`${apiOrigin}/api/resort-owner/properties`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
    } catch {
      throw new Error(`Cannot connect to the backend at ${apiOrigin}. Check VITE_API_BASE_URL and whether the backend is running.`);
    }
    if (response.status === 404) {
      throw new Error(`Resort-owner API is missing on ${apiOrigin} (404). Start the updated backend on port 5000 or deploy the resort routes, then try Publish again. No account was created by this attempt.`);
    }
    if (response.status >= 500) {
      throw new Error(`Backend at ${apiOrigin} is unavailable (${response.status}). Please try again when it is healthy.`);
    }
    if (response.status !== 401 && response.status !== 403 && !response.ok) {
      throw new Error(`Unexpected response from resort API (${response.status}) at ${apiOrigin}.`);
    }
  }
  const result = () => ({ property: { ...draft, rooms: draft.rooms.map(r=>({...r,beds:[...r.beds],images:[...r.images]})), images:[...draft.images] } });
  const roomBy = id => draft.rooms.find(r => r.id === id);

  return {
    list: async () => ({properties: [result().property]}),
    create: async () => result(),
    get: async () => result(),
    section: async (_id, section, data) => {
      if (!FIELDS[section]) throw new Error(`Unknown section: ${section}`);
      Object.assign(draft, Object.fromEntries(Object.entries(data || {}).filter(([key])=>FIELDS[section].includes(key))));
      const step = Object.keys(FIELDS).indexOf(section) + 1;
      draft.onboardingStep = Math.max(draft.onboardingStep, step+1);
      return result();
    },
    createRoom: async (_id, data) => {
      const room = { ...data, id:newId('room'), images:[], beds:[...(data.beds||[])] };
      draft.rooms.push(room);
      return {room};
    },
    updateRoom: async (_id, roomId, data) => {
      const room=roomBy(roomId);
      if (!room) throw new Error('Room not found');
      Object.assign(room, data, {images:room.images, beds:data.beds||room.beds});
      return {room};
    },
    deleteRoom: async (_id, roomId) => {
      const index=draft.rooms.findIndex(r=>r.id===roomId);
      if (index<0) throw new Error('Room not found');
      for (const image of draft.rooms[index].images) {
        URL.revokeObjectURL(image.url);
        blobs.delete(image.id);
      }
      draft.rooms.splice(index,1);
      return {message:'Room removed'};
    },
    uploadImage: async (_id, file, kind, roomId=null) => {
      if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose a JPEG, PNG or WebP image.');
      if (!file.size || file.size>5*1024*1024) throw new Error('Each image must be 5 MB or smaller.');
      const room=roomId ? roomBy(roomId) : null;
      if (kind==='ROOM' && !room) throw new Error('Save the room before adding its photos.');
      if (kind==='COVER' || kind==='PROFILE') {
        for (const image of [...draft.images].filter(i=>i.kind===kind)) {
          URL.revokeObjectURL(image.url);blobs.delete(image.id);
          draft.images.splice(draft.images.indexOf(image),1);
        }
      }
      const image={id:newId('image'),kind,url:URL.createObjectURL(file),roomTypeId:roomId,sortOrder:kind==='ROOM' ? (room.images.length) : draft.images.length};
      blobs.set(image.id, {file,kind,roomId});
      if(room) room.images.push(image); else draft.images.push(image);
      return {image};
    },
    deleteImage: async (_id, imageId) => {
      const image=draft.images.find(i=>i.id===imageId) || draft.rooms.flatMap(r=>r.images).find(i=>i.id===imageId);
      if(!image) throw new Error('Image not found');
      const collection=image.roomTypeId ? roomBy(image.roomTypeId)?.images : draft.images;
      if(collection) collection.splice(collection.indexOf(image),1);
      URL.revokeObjectURL(image.url);blobs.delete(image.id);
      return {message:'Image removed'};
    },
    review: async () => {
      const missingFields=REQUIRED.filter(k=>!String(draft[k]??'').trim());
      if (!draft.rooms.length) missingFields.push('rooms');
      return {...result(),missingFields,readyToPublish:missingFields.length===0};
    },
    publish: async () => {
      const signup=peekResortSignup();
      if (!signup && !createdToken) throw new Error('Signup details expired. Return to signup and enter your details again.');
      const {missingFields}=await thisReview();
      if(missingFields.length) throw new Error(`Complete the required fields: ${missingFields.join(', ')}`);
      // Registration only happens after the user finishes the onboarding form.
      // If a later step fails, keep the issued token and remote property ID for retry.
      if (!createdToken) {
        await verifyResortApi();
        const registered=await registerUser({...signup,accountType:'RESORT_OWNER'});
        createdToken=registered?.accessToken || registered?.data?.accessToken || '';
        if(!createdToken) throw new Error('Account created, but signup returned no access token. Sign in to finish publishing.');
      }
      const remote=createResortOwnerApi({token:createdToken,baseUrl:apiOrigin});
      if(!serverId) serverId=(await remote.create(draft.name)).property.id;
      for (const [section, keys] of Object.entries(FIELDS)) {
        const payload=Object.fromEntries(keys.map(k=>[k,draft[k] ?? (k==='amenities'?[]:null)]));
        await remote.section(serverId,section,payload);
      }
      // Rooms are recreated only once per publish attempt; reuse IDs after a partial failure.
      const roomIds=new Map();
      for (const room of draft.rooms) {
        let realId=room.serverRoomId;
        if(!realId) {
          const {id,images,serverRoomId,...data}=room;
          realId=(await remote.createRoom(serverId,data)).room.id;
          room.serverRoomId=realId;
        }
        roomIds.set(room.id, realId);
      }
      for (const [localId, item] of blobs) {
        if(item.uploaded) continue;
        await remote.uploadImage(serverId,item.file,item.kind,item.roomId?roomIds.get(item.roomId):null);
        item.uploaded=true;
        blobs.set(localId,item);
      }
      const final=await remote.review(serverId);
      if(!final.readyToPublish) throw new Error(`Resort saved, but not ready to publish: ${(final.missingFields||[]).join(', ')}`);
      const completed=await remote.publish(serverId);
      draft.status='PUBLISHED';draft.onboardingCompleted=true;
      clearResortSignup();
      return completed;
    },
  };

  async function thisReview() {
    const missingFields=REQUIRED.filter(k=>!String(draft[k]??'').trim());
    if(!draft.rooms.length) missingFields.push('rooms');
    return {missingFields};
  }
}
