import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Camera, Check, Edit3, ImagePlus, LoaderCircle, Plus, Trash2, Wifi, Car, Snowflake, Brush,
  Shirt, Waves, Utensils, Trees, BookOpen, Flower2, Mountain, TreePine, Accessibility, ShieldCheck, HeartPulse, Sparkles,
  Dumbbell, Leaf, BedDouble, Coffee, Lock, Sun, Home, Building2, Droplets, TentTree, CircleHelp
} from 'lucide-react';
import { createResortOwnerApi } from '../api/resortOwnerApi';
import '../styles/resort-onboarding.css';

const TITLES = [
  'Let’s get to know your resort', 'Where can guests find you?',
  'What amenities will guests find at your property?', 'Show guests around your property',
  'Set up your rooms', 'Where should guests send enquiries?', 'Set your property rules', 'Review your listing',
];
const PROPERTY_TYPES = [
  ['RESORT', 'Resort', Home], ['WELLNESS_CENTRE', 'Wellness Centre', Flower2],
  ['YOGA_CENTRE', 'Yoga Centre', Sun], ['AYURVEDA_CENTRE', 'Ayurveda Centre', Leaf],
  ['MEDITATION_CENTRE', 'Meditation Centre', Sparkles], ['SPA', 'Spa', Droplets],
  ['NATURE_RESORT', 'Nature Resort', Trees], ['FITNESS_CENTRE', 'Fitness Centre', Dumbbell],
  ['OTHER', 'Other', Plus],
];
const AMENITY_SECTIONS = [
  ['Basic', [['WIFI','Wi-Fi',Wifi],['PARKING','Parking',Car],['AIR_CONDITIONING','Air conditioning',Snowflake],['HOUSEKEEPING','Housekeeping',Brush],['LAUNDRY_SERVICE','Laundry service',Shirt]]],
  ['Property features', [['SWIMMING_POOL','Swimming pool',Waves],['RESTAURANT','Restaurant',Utensils],['GARDEN','Garden',Flower2],['LIBRARY','Library',BookOpen],['RELAXATION_LOUNGE','Relaxation lounge',Home],['OUTDOOR_SPACE','Outdoor space',Trees]]],
  ['Wellness facilities', [['YOGA_STUDIO','Yoga studio',Sun],['MEDITATION_SPACE','Meditation space',Sparkles],['SPA_ROOMS','Spa rooms',Droplets],['STEAM_ROOM','Steam room',Waves],['PRIVATE_CONSULTATION_ROOM','Private consultation room',HeartPulse]]],
  ['Location & surroundings', [['BEACHFRONT','Beachfront',Waves],['NEAR_BEACH','Near the beach',Sun],['MOUNTAIN_SETTING','Mountain setting',Mountain],['FOREST_SETTING','Forest setting',TreePine],['LAKESIDE','Lakeside',Waves],['RIVERSIDE','Riverside',Waves],['COUNTRYSIDE','Countryside',TentTree],['CITY_SETTING','City setting',Building2]]],
  ['Accessibility', [['STEP_FREE_ENTRANCE','Step-free entrance',Accessibility],['WHEELCHAIRS_AVAILABLE','Wheelchairs available',Accessibility],['WHEELCHAIR_ACCESSIBLE_PATHS','Wheelchair-accessible paths',Accessibility],['LIFT_ACCESS','Lift access',Building2]]],
  ['Safety & security', [['ON_SITE_SECURITY','On-site security',ShieldCheck],['CCTV','CCTV',Camera],['FIRE_EXTINGUISHERS','Fire extinguishers',ShieldCheck],['SMOKE_ALARMS','Smoke alarms',ShieldCheck],['FIRST_AID_KIT','First-aid kit',HeartPulse],['IN_ROOM_SAFE','In-room safe',Lock]]],
];
const ROOM_FEATURES = [['WIFI','Wi-Fi',Wifi],['AIR_CONDITIONING','Air conditioning',Snowflake],['PRIVATE_BATHROOM','Private bathroom',Droplets],['BALCONY','Balcony',Home],['GARDEN_VIEW','Garden view',Trees],['RIVER_VIEW','River view',Waves],['IN_ROOM_SAFE','In-room safe',Lock],['TEA_COFFEE_MAKER','Tea / coffee maker',Coffee],['OTHER','Other',Plus]];
const EMPTY = { name: '', resortRating: '', websiteUrl: '', propertyType: '', description: '', country: '', addressLine1: '', addressLine2: '', city: '', stateRegion: '', postalCode: '', googleMapsUrl: '', amenities: [], contactName: '', enquiryEmail: '', phoneNumber: '', smokingPolicy: '', petsPolicy: '', alcoholPolicy: '', additionalRules: '' };
const EMPTY_ROOM = { name: '', quantity: '1', maxAdults: '2', maxChildren: '0', beds: [{bedType:'KING',quantity:'1'}], features: [], includedMeals: [], currency: 'INR', basePrice: '', description: '' };
const SECTIONS = ['basic', 'location', 'amenities', 'photos', 'rooms', 'contact', 'rules'];
const FIELDS = {
  basic: ['name', 'resortRating', 'websiteUrl', 'propertyType', 'description'],
  location: ['country', 'addressLine1', 'addressLine2', 'city', 'stateRegion', 'postalCode', 'googleMapsUrl'],
  amenities: ['amenities'], photos: [], rooms: [],
  contact: ['contactName', 'enquiryEmail', 'phoneNumber'],
  rules: ['smokingPolicy', 'petsPolicy', 'alcoholPolicy', 'additionalRules'],
};
const required = (value) => String(value ?? '').trim().length > 0;
const money = (price, currency) => {
  try { return new Intl.NumberFormat('en-IN', {style:'currency',currency:currency||'INR',maximumFractionDigits:0}).format(Number(price)||0); }
  catch { return `${currency || 'INR'} ${price || 0}`; }
};

function Field({ label, value, onChange, placeholder, required: must = false, textarea = false, type = 'text', children }) {
  return <label className="res-field"><span>{label}{must && <b> *</b>}</span>
    {children || (textarea ? <textarea value={value ?? ''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={4}/> : <input type={type} value={value ?? ''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>)}
  </label>;
}
function Tile({ value, label, Icon, selected, onClick }) {
  return <button type="button" aria-pressed={selected} className={`res-tile${selected ? ' selected' : ''}`} onClick={onClick} title={label}><Icon size={23} strokeWidth={1.7}/><span>{label}</span></button>;
}
function UploadTile({ label, image, onFile, onDelete, loading, cover = false, compact = false }) {
  const input = useRef(null);
  return <div className={`res-upload${cover?' cover':''}${compact?' compact':''}`}>
    {image?.url && <img src={image.url} alt={image.altText || label}/>}
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>{const file=e.target.files?.[0]; e.target.value=''; if(file) onFile(file);}}/>
    <button className="res-upload-main" disabled={loading} type="button" onClick={()=>input.current?.click()}>
      {loading ? <LoaderCircle className="res-spin" size={27}/> : image ? <Camera size={22}/> : <ImagePlus size={compact?23:34} strokeWidth={1.4}/>}
      <span>{loading ? 'Uploading…' : image ? 'Change photo' : label}</span>
    </button>
    {image && onDelete && <button type="button" className="res-image-delete" aria-label="Delete photo" onClick={onDelete}><Trash2 size={15}/></button>}
  </div>;
}
function RadioRow({ label, value, options, onChange }) {
  return <div className="res-radio-row"><strong>{label}<b> *</b></strong><div className="res-radio-options">{options.map(([v,t])=><label key={v} className={`res-radio-chip${value===v?' active':''}`}><input type="radio" checked={value===v} onChange={()=>onChange(v)} />{t}</label>)}</div></div>;
}
function RoomCard({ room, edit, remove }) {
  const image = room.images?.find(x=>x.kind==='ROOM');
  const bedCount = (room.beds||[]).reduce((s,x)=>s+(Number(x.quantity)||0),0);
  return <div className="res-room-card"><div className="res-room-thumb">{image ? <img src={image.url} alt={room.name}/> : <BedDouble size={36}/>}</div><div className="res-room-copy"><h3>{room.name}</h3><p>{Number(room.maxAdults)+Number(room.maxChildren)} guests · {bedCount} bed{bedCount===1?'':'s'} · {room.quantity} room{Number(room.quantity)===1?'':'s'} of this type</p><p>{(room.features||[]).slice(0,4).map(s=>s.replaceAll('_',' ').toLowerCase()).join(' · ') || 'Room features not selected'}</p><p className="res-room-price"><b>{room.basePrice ? money(room.basePrice,room.currency) : 'Price not set'}</b> {room.basePrice && '/night'}</p></div><div className="res-room-actions"><button type="button" aria-label="Delete room" onClick={remove}><Trash2 size={17}/></button><button type="button" aria-label="Edit room" onClick={edit}><Edit3 size={17}/></button></div></div>;
}

/**
 * Mount this page behind your existing RESORT_OWNER auth guard.
 * accessToken is supplied by your current login/session code; no auth files are changed.
 * Optional propertyId opens a specific property; otherwise draft is reused or created.
 */
export default function ResortOnboardingPage({ accessToken, apiBaseUrl, propertyId: initialPropertyId, onFinished, apiOverride }) {
  const navigate = useNavigate();
  const api = useMemo(()=>apiOverride || createResortOwnerApi({token:accessToken,baseUrl:apiBaseUrl}),[apiOverride,accessToken,apiBaseUrl]);
  const [propertyId,setPropertyId] = useState(initialPropertyId||'');
  const [property,setProperty] = useState(null);
  const [form,setForm] = useState(EMPTY);
  const [step,setStep] = useState(1);
  const [rooms,setRooms] = useState([]);
  const [images,setImages] = useState([]);
  const [roomDraft,setRoomDraft] = useState(null);
  const [editingRoomId,setEditingRoomId] = useState(null);
  const [roomImagesLoading,setRoomImagesLoading] = useState(false);
  const [uploading,setUploading] = useState('');
  const [busy,setBusy] = useState(false);
  const [starting,setStarting] = useState(true);
  const [notice,setNotice] = useState('');
  const [error,setError] = useState('');
  const [confirmed,setConfirmed] = useState(false);
  const [published,setPublished] = useState(false);
  const [review,setReview] = useState(null);
  const set = (key, value) => setForm(f=>({...f,[key]:value}));
  const sync = useCallback(p=>{setProperty(p); setPropertyId(p.id); setForm(f=>({...EMPTY,...f,...Object.fromEntries(Object.keys(EMPTY).map(k=>[k,p[k]??EMPTY[k]]))})); setRooms(p.rooms||[]); setImages(p.images||[]); setPublished(p.status==='PUBLISHED');},[]);
  useEffect(()=>{let alive=true; (async()=>{try{setStarting(true); let p;
    if(initialPropertyId){p=(await api.get(initialPropertyId)).property;}
    else {const listing=(await api.list()).properties||[]; p=listing.find(x=>x.status==='DRAFT')||listing.find(x=>x.status==='UNPUBLISHED'); if(!p){p=(await api.create()).property;} else p=(await api.get(p.id)).property;}
    if(alive){sync(p); setStep(Math.max(1,Math.min(8,p.onboardingCompleted?8:p.onboardingStep||1)));}
  }catch(e){if(alive)setError(e.message);}finally{if(alive)setStarting(false);}})();return()=>{alive=false};},[api,initialPropertyId,sync]);
  const go = n=>{setError('');setNotice('');setStep(n);window.scrollTo?.({top:0,behavior:'smooth'});};
  const saveSection = async (s = step, advance = true) => {let section=SECTIONS[s-1]; if(!section) return;
    if(s===1 && (!required(form.name)||!required(form.resortRating)||!required(form.websiteUrl)||!required(form.propertyType)||!required(form.description))) throw new Error('Complete all required property details.');
    if(s===2 && (!required(form.country)||!required(form.addressLine1)||!required(form.city)||!required(form.stateRegion)||!required(form.postalCode)||!required(form.googleMapsUrl))) throw new Error('Complete all required address details.');
    if(s===6 && (!required(form.contactName)||!required(form.enquiryEmail)||!required(form.phoneNumber))) throw new Error('Complete all contact details.');
    if(s===7 && (!form.smokingPolicy||!form.petsPolicy||!form.alcoholPolicy)) throw new Error('Choose each property rule.');
    if(s===5 && rooms.length===0) throw new Error('Please add at least one room type.');
    const payload=Object.fromEntries(FIELDS[section].map(k=>[k,form[k]]));
    const data=await api.section(propertyId,section,payload); if(data.property){setProperty(data.property);setRooms(data.property.rooms||[]);setImages(data.property.images||[]);}
    setNotice('Saved successfully'); if(s===7) setReview(await api.review(propertyId)); if(advance)go(Math.min(8,s+1));
  };
  const advance = async()=>{try{setBusy(true);setError('');await saveSection();}catch(e){setError(e.message);}finally{setBusy(false);}};
  const upload = async (file,kind,roomTypeId) => {const key=`${kind}:${roomTypeId||''}`; try {setUploading(key);setError('');const result=await api.uploadImage(propertyId,file,kind,roomTypeId);const refreshed=(await api.get(propertyId)).property;setImages(refreshed.images||[]);setRooms(refreshed.rooms||[]);return result.image;}catch(e){setError(e.message);return null;}finally{setUploading('');}};
  const deleteImage = async (imageId) => {try{setBusy(true);await api.deleteImage(propertyId,imageId);const refreshed=(await api.get(propertyId)).property;setImages(refreshed.images||[]);setRooms(refreshed.rooms||[]);}catch(e){setError(e.message);}finally{setBusy(false);}};
  const imageOf = kind=>images.find(i=>i.kind===kind);
  const propertyPhotos=images.filter(i=>i.kind==='PROPERTY');
  const beginRoom = room => {setEditingRoomId(room?.id||null);setRoomDraft(room ? {...room,beds:room.beds?.map(b=>({bedType:b.bedType,quantity:String(b.quantity)}))||[],basePrice:room.basePrice??''} : structuredClone(EMPTY_ROOM));};
  const saveRoom = async()=>{try{setRoomImagesLoading(true);setError('');const body={...roomDraft,quantity:Number(roomDraft.quantity),maxAdults:Number(roomDraft.maxAdults),maxChildren:Number(roomDraft.maxChildren),beds:roomDraft.beds.map(b=>({...b,quantity:Number(b.quantity)})),basePrice:roomDraft.basePrice||null}; const response=editingRoomId?await api.updateRoom(propertyId,editingRoomId,body):await api.createRoom(propertyId,body);
    setRoomDraft(null);setEditingRoomId(null);sync((await api.get(propertyId)).property);setNotice(`Room “${response.room.name}” saved. You can now add room photos.`);
  }catch(e){setError(e.message);}finally{setRoomImagesLoading(false);}};
  const removeRoom = async room=>{if(!window.confirm(`Delete “${room.name}”?`))return;try{setBusy(true);await api.deleteRoom(propertyId,room.id);sync((await api.get(propertyId)).property);}catch(e){setError(e.message);}finally{setBusy(false);}};
  const gotoReview = async()=>{try{setBusy(true);setError('');const data=await api.review(propertyId);setReview(data);go(8);}catch(e){setError(e.message);}finally{setBusy(false);}};
  const publish = async () => {
    if (busy || published) return;
    try {
      if (!confirmed) throw new Error('Please confirm that the information is accurate.');
      setBusy(true);
      setError('');
      const data = await api.publish(propertyId);
      sync(data.property);
      setPublished(true);
      setNotice('Your listing is now published.');
      // Preserve existing session/finalization behavior before redirecting.
      await onFinished?.(data.property);
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to complete publishing.');
    } finally {
      setBusy(false);
    }
  };
  const reviewEdit = n=>go(n);
  if(starting) return <main className="res-onboard"><div className="res-center-state"><LoaderCircle className="res-spin"/>Loading your property…</div></main>;
  if(!propertyId) return <main className="res-onboard"><div className="res-center-state res-error">{error||'Could not load resort property.'}</div></main>;
  return <main className="res-onboard"><div className="res-pattern" aria-hidden="true"/><div className="res-container">
    <div className="res-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(step/8*100)}><span style={{width:`${step/8*100}%`}}/></div>
    <header className="res-heading">{step<8&&<span>Step {step}</span>}<h1>{TITLES[step-1]}</h1>{step===8&&<p>Review everything before publishing your property.</p>}</header>
    {error&&<div role="alert" className="res-alert">{error}<button type="button" onClick={()=>setError('')}>Dismiss</button></div>}
    {notice&&!error&&<div role="status" className="res-notice">{notice}<button type="button" onClick={()=>setNotice('')}>Dismiss</button></div>}
    {step===1&&<section className="res-panel"><div className="res-profile-upload"><UploadTile compact label="Upload profile photo" image={imageOf('PROFILE')} onFile={f=>upload(f,'PROFILE')} onDelete={imageOf('PROFILE')?()=>deleteImage(imageOf('PROFILE').id):null} loading={uploading==='PROFILE:'}/><div><h2>Upload profile photo</h2><p>Choose a clear photo of your property. JPG, PNG or WebP, up to 5 MB.</p></div></div><div className="res-form-grid"><Field label="Resort Name" required value={form.name} onChange={v=>set('name',v)} placeholder="Enter your resort name"/><Field label="Resort Rating" required value={form.resortRating} onChange={v=>set('resortRating',v)} placeholder="Enter resort rating"/><div className="res-full"><Field label="Website" required value={form.websiteUrl} onChange={v=>set('websiteUrl',v)} placeholder="Enter your website URL" type="url"/></div><div className="res-full"><h3 className="res-label-heading">Property Type <b>*</b></h3><div className="res-tiles types">{PROPERTY_TYPES.map(([code,label,Icon])=><Tile key={code} label={label} Icon={Icon} selected={form.propertyType===code} onClick={()=>set('propertyType',code)}/>)}</div></div><div className="res-full"><Field label="About Your Property" required textarea value={form.description} onChange={v=>set('description',v)} placeholder="Share a brief introduction, including the setting and experience you offer."/></div></div><Footer busy={busy} onNext={advance} first/></section>}
    {step===2&&<section className="res-panel"><div className="res-form-grid"><Field label="Country" required value={form.country} onChange={v=>set('country',v)} placeholder="Select or enter country"/><Field label="Address Line 1" required value={form.addressLine1} onChange={v=>set('addressLine1',v)} placeholder="Enter building name, street or area"/><Field label="Address Line 2" value={form.addressLine2} onChange={v=>set('addressLine2',v)} placeholder="Enter landmark or additional address details"/><Field label="City / Town" required value={form.city} onChange={v=>set('city',v)} placeholder="Enter city or town"/><Field label="State / Region" required value={form.stateRegion} onChange={v=>set('stateRegion',v)} placeholder="Enter state or region"/><Field label="PIN / Postal Code" required value={form.postalCode} onChange={v=>set('postalCode',v)} placeholder="Enter PIN or postal code"/><div className="res-full"><Field label="Google Maps Link" required type="url" value={form.googleMapsUrl} onChange={v=>set('googleMapsUrl',v)} placeholder="Paste your property's Google Maps link"/></div></div><Footer busy={busy} onBack={()=>go(1)} onNext={advance}/></section>}
    {step===3&&<section className="res-panel">{AMENITY_SECTIONS.map(([group,items])=><div className="res-amenity-group" key={group}><h2>{group}</h2><div className="res-tiles amenities">{items.map(([code,label,Icon])=><Tile key={code} label={label} Icon={Icon} selected={form.amenities.includes(code)} onClick={()=>set('amenities',form.amenities.includes(code)?form.amenities.filter(x=>x!==code):[...form.amenities,code])}/>)}</div></div>)}<Footer busy={busy} onBack={()=>go(2)} onNext={advance}/></section>}
    {step===4&&<section className="res-panel res-photos"><UploadTile cover label="Upload cover photo" image={imageOf('COVER')} loading={uploading==='COVER:'} onFile={f=>upload(f,'COVER')} onDelete={imageOf('COVER')?()=>deleteImage(imageOf('COVER').id):null}/><div className="res-property-grid">{[0,1,2,3].map(i=><UploadTile key={propertyPhotos[i]?.id||i} label="Add property photo" image={propertyPhotos[i]} loading={uploading==='PROPERTY:'} onFile={f=>upload(f,'PROPERTY')} onDelete={propertyPhotos[i]?()=>deleteImage(propertyPhotos[i].id):null}/>)}</div>{propertyPhotos.length>4&&<div className="res-property-grid">{propertyPhotos.slice(4).map(i=><UploadTile key={i.id} label="Add property photo" image={i} onFile={f=>upload(f,'PROPERTY')} onDelete={()=>deleteImage(i.id)} loading={uploading==='PROPERTY:'}/>)}</div>}<Footer busy={busy} onBack={()=>go(3)} onNext={advance}/></section>}
    {step===5&&<section className={roomDraft?'res-panel':'res-rooms-layout'}>{roomDraft ? <><div className="res-form-section"><h2>Room photos</h2><div className="res-room-photo-grid">{editingRoomId?(rooms.find(r=>r.id===editingRoomId)?.images||[]).filter(i=>i.kind==='ROOM').map(i=><UploadTile key={i.id} compact label="Add room photo" image={i} onFile={f=>upload(f,'ROOM',editingRoomId)} onDelete={()=>deleteImage(i.id)} loading={uploading===`ROOM:${editingRoomId}`}/>):null}{editingRoomId&&<UploadTile compact label="Add room photo" onFile={f=>upload(f,'ROOM',editingRoomId)} loading={uploading===`ROOM:${editingRoomId}`}/>}</div>{!editingRoomId&&<p className="res-help">Save this room first, then edit it to upload room photos.</p>}</div><div className="res-form-section"><h2>Room details</h2><div className="res-form-grid"><Field label="Room type / name" required value={roomDraft.name} onChange={v=>setRoomDraft(r=>({...r,name:v}))} placeholder="e.g. Deluxe Garden Room"/><Field label="Number of rooms of this type" required type="number" value={roomDraft.quantity} onChange={v=>setRoomDraft(r=>({...r,quantity:v}))} placeholder="e.g. 2"/></div></div><div className="res-form-section"><h2>Guest capacity and beds</h2><div className="res-form-grid"><Field label="Maximum adults" required type="number" value={roomDraft.maxAdults} onChange={v=>setRoomDraft(r=>({...r,maxAdults:v}))}/><Field label="Maximum children" required type="number" value={roomDraft.maxChildren} onChange={v=>setRoomDraft(r=>({...r,maxChildren:v}))}/></div><div className="res-beds">{roomDraft.beds.map((bed,i)=><div className="res-bed-row" key={i}><Field label="Beds" required value={bed.bedType} onChange={v=>setRoomDraft(r=>({...r,beds:r.beds.map((b,j)=>j===i?{...b,bedType:v}:b)}))}><select value={bed.bedType} onChange={e=>setRoomDraft(r=>({...r,beds:r.beds.map((b,j)=>j===i?{...b,bedType:e.target.value}:b)}))}><option value="KING">King</option><option value="QUEEN">Queen</option><option value="DOUBLE">Double</option><option value="SINGLE">Single</option><option value="TWIN">Twin</option><option value="SOFA_BED">Sofa bed</option><option value="BUNK">Bunk</option></select></Field><Field label="Number of beds" required type="number" value={bed.quantity} onChange={v=>setRoomDraft(r=>({...r,beds:r.beds.map((b,j)=>j===i?{...b,quantity:v}:b)}))}/>{roomDraft.beds.length>1&&<button type="button" className="res-bed-remove" aria-label="Remove bed type" onClick={()=>setRoomDraft(r=>({...r,beds:r.beds.filter((_,j)=>i!==j)}))}><Trash2 size={17}/></button>}</div>)}<button className="res-add-link" type="button" onClick={()=>setRoomDraft(r=>({...r,beds:[...r.beds,{bedType:'SINGLE',quantity:'1'}]}))}><Plus size={14}/> Add another bed type</button></div></div><div className="res-form-section"><h2>Room features</h2><p className="res-help">Select all features available in this room type.</p><div className="res-feature-list">{ROOM_FEATURES.map(([v,label,Icon])=><button type="button" key={v} className={`res-feature${roomDraft.features.includes(v)?' selected':''}`} onClick={()=>setRoomDraft(r=>({...r,features:r.features.includes(v)?r.features.filter(x=>x!==v):[...r.features,v]}))}><Icon size={17}/>{label}</button>)}</div></div><div className="res-form-section"><h2>Pricing and meals</h2><div className="res-form-grid"><Field label="Currency" value={roomDraft.currency} onChange={v=>setRoomDraft(r=>({...r,currency:v}))}><select value={roomDraft.currency} onChange={e=>setRoomDraft(r=>({...r,currency:e.target.value}))}>{['INR','USD','EUR','GBP','AED'].map(x=><option key={x} value={x}>{x}</option>)}</select></Field><Field label="Base price per room per night" type="number" value={roomDraft.basePrice} onChange={v=>setRoomDraft(r=>({...r,basePrice:v}))} placeholder="e.g. 6500"/></div><h3 className="res-label-heading res-meal-label">Meals included in the room price</h3><p className="res-help">Select all that apply</p><div className="res-checks">{['BREAKFAST','LUNCH','DINNER'].map(meal=><label key={meal}><input type="checkbox" checked={roomDraft.includedMeals.includes(meal)} onChange={()=>setRoomDraft(r=>({...r,includedMeals:r.includedMeals.includes(meal)?r.includedMeals.filter(m=>m!==meal):[...r.includedMeals,meal]}))}/>{meal[0]+meal.slice(1).toLowerCase()}</label>)}</div></div><div className="res-form-section"><Field label="Short description" textarea value={roomDraft.description} onChange={v=>setRoomDraft(r=>({...r,description:v}))} placeholder="Describe the room and what makes it special"/></div><Footer busy={roomImagesLoading} backLabel="Cancel" onBack={()=>{setRoomDraft(null);setEditingRoomId(null);}} nextLabel="Save this room" onNext={saveRoom}/></> : <>{rooms.length===0?<div className="res-panel res-room-empty"><h2>Add your first room type</h2><p>Include room photos, guest capacity and a nightly price. You can add more room types later.</p><hr/><button className="res-primary" type="button" onClick={()=>beginRoom(null)}>Add rooms</button></div>:<><div className="res-room-list">{rooms.map(r=><RoomCard key={r.id} room={r} edit={()=>beginRoom(r)} remove={()=>removeRoom(r)}/>)}</div><div className="res-add-room-wrap"><button className="res-outline" type="button" onClick={()=>beginRoom(null)}><Plus size={17}/> Add another room</button></div></>}<Footer busy={busy} onBack={()=>go(4)} onNext={advance} nextLabel="Continue"/></>}</section>}
    {step===6&&<section className="res-panel"><div className="res-form-grid"><Field label="Contact Person’s Name" required value={form.contactName} onChange={v=>set('contactName',v)} placeholder="Enter full name"/><Field label="Enquiry Email" required type="email" value={form.enquiryEmail} onChange={v=>set('enquiryEmail',v)} placeholder="Enter email address"/><div className="res-full"><Field label="Phone Number" required type="tel" value={form.phoneNumber} onChange={v=>set('phoneNumber',v)} placeholder="Enter phone number"/></div></div><p className="res-info"><CircleHelp size={16}/>Guest enquiries will be sent to this email address once enquiry delivery is implemented.</p><Footer busy={busy} onBack={()=>go(5)} onNext={advance}/></section>}
    {step===7&&<section className="res-panel"><h2 className="res-house-heading">House rules</h2><div className="res-rules"><RadioRow label="Smoking Allowed?" value={form.smokingPolicy} options={[["YES","Yes"],["DESIGNATED_AREAS_ONLY","Designated areas only"],["NO","No"]]} onChange={v=>set('smokingPolicy',v)}/><RadioRow label="Pets Allowed?" value={form.petsPolicy} options={[["YES","Yes"],["ON_REQUEST","On Request"],["NO","No"]]} onChange={v=>set('petsPolicy',v)}/><RadioRow label="Alcohol Allowed?" value={form.alcoholPolicy} options={[["YES","Yes"],["NO","No"]]} onChange={v=>set('alcoholPolicy',v)}/></div><Field label="Additional rules (Optional)" value={form.additionalRules} textarea onChange={v=>set('additionalRules',v)} placeholder="Add any other information guests should know before coming"/><Footer busy={busy} onBack={()=>go(6)} onNext={advance}/></section>}
    {step===8&&<section className="res-panel res-review"><ReviewHeading title="About the Property" edit={()=>reviewEdit(1)}/><div className="res-profile-upload"><UploadTile compact label="Upload profile photo" image={imageOf('PROFILE')} onFile={f=>upload(f,'PROFILE')} onDelete={imageOf('PROFILE')?()=>deleteImage(imageOf('PROFILE').id):null} loading={uploading==='PROFILE:'}/><div><h2>Upload profile photo</h2><p>JPG, PNG or WebP, up to 5 MB.</p></div></div><div className="res-form-grid">{[['Resort Name',form.name],['Resort Rating',form.resortRating],['Website',form.websiteUrl],['Property Type',PROPERTY_TYPES.find(x=>x[0]===form.propertyType)?.[1]],['About Your Property',form.description]].map(([k,v])=><ReviewField key={k} label={k} value={v}/>)}</div><ReviewHeading title="Location & Address" edit={()=>reviewEdit(2)}/><div className="res-form-grid">{[['Country',form.country],['Address Line 1',form.addressLine1],['Address Line 2',form.addressLine2],['City / Town',form.city],['State / Region',form.stateRegion],['PIN / Postal Code',form.postalCode],['Google Maps Link',form.googleMapsUrl]].map(([k,v])=><ReviewField key={k} label={k} value={v}/>)}</div><ReviewHeading title="Amenities" edit={()=>reviewEdit(3)}/><div className="res-feature-list">{form.amenities.length?form.amenities.map(v=><span className="res-feature" key={v}>{v.replaceAll('_',' ').toLowerCase()}</span>):<p className="res-help">No amenities selected</p>}</div><ReviewHeading title="Show guests around your property" edit={()=>reviewEdit(4)}/><UploadTile cover label="Upload cover photo" image={imageOf('COVER')} onFile={f=>upload(f,'COVER')} loading={uploading==='COVER:'} onDelete={imageOf('COVER')?()=>deleteImage(imageOf('COVER').id):null}/><div className="res-property-grid">{[0,1,2,3].map(i=><UploadTile key={propertyPhotos[i]?.id||i} label="Add property photo" image={propertyPhotos[i]} onFile={f=>upload(f,'PROPERTY')} loading={uploading==='PROPERTY:'} onDelete={propertyPhotos[i]?()=>deleteImage(propertyPhotos[i].id):null}/>)}</div><ReviewHeading title="Set up your rooms" edit={()=>reviewEdit(5)}/><div className="res-room-list">{rooms.map(room=><RoomCard key={room.id} room={room} edit={()=>{go(5);beginRoom(room);}} remove={()=>removeRoom(room)}/>)}</div><ReviewHeading title="Contact & Enquiries" edit={()=>reviewEdit(6)}/><div className="res-form-grid">{[['Contact Person’s Name',form.contactName],['Enquiry Email',form.enquiryEmail],['Phone Number',form.phoneNumber]].map(([k,v])=><ReviewField key={k} label={k} value={v}/>)}</div><ReviewHeading title="House rules" edit={()=>reviewEdit(7)}/><div className="res-form-grid">{[['Smoking Allowed?',form.smokingPolicy],['Pets Allowed?',form.petsPolicy],['Alcohol Allowed?',form.alcoholPolicy],['Additional rules',form.additionalRules]].map(([k,v])=><ReviewField key={k} label={k} value={v?.replaceAll('_',' ').toLowerCase()}/>)}</div>{review?.missingFields?.length>0&&<div className="res-alert">Before publishing: {review.missingFields.join(', ')}</div>}<label className="res-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>I confirm that the information is accurate and I’m authorised to list this property.</label><div className="res-footer"><button className="res-back" type="button" onClick={()=>go(7)}><ArrowLeft size={16}/>Back</button><button disabled={busy||published||!confirmed} type="button" className="res-primary" onClick={publish}>{busy?'Publishing…':published?'Published':'Publish listing'}</button></div>{published&&<p className="res-success"><Check size={20}/> Your resort is published and can appear on the public resort marketplace.</p>}</section>}
  </div></main>;
}
function Footer({busy,onBack,onNext,first=false,nextLabel='Continue',backLabel='Back'}) {return <div className="res-footer">{!first&&<button className="res-back" type="button" onClick={onBack}><ArrowLeft size={16}/>{backLabel}</button>}{first&&<span/>}<button disabled={busy} className="res-primary" type="button" onClick={onNext}>{busy?<><LoaderCircle className="res-spin" size={17}/>Saving…</>:nextLabel}</button></div>}
function ReviewHeading({title,edit}) {return <div className="res-review-heading"><h2>{title}</h2><button type="button" className="res-outline" onClick={edit}><Edit3 size={15}/>Edit</button></div>}
function ReviewField({label,value}) {return <div className="res-field res-review-field"><span>{label}</span><div>{value || '—'}</div></div>}
