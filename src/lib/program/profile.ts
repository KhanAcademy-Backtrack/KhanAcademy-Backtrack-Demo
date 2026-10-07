/** The optional Home name is device-local and separate from learning records. */
export const PROFILE_KEY='backtrack.profile.v1';
export const DEFAULT_PROFILE_NAME='Khanpanion';
export const PROFILE_NAME_LIMIT=60;

export function normalizeProfileName(value:unknown):string{
 if(typeof value!=='string')return DEFAULT_PROFILE_NAME;
 return value.replace(/\s+/g,' ').replace(/[\u0000-\u001f\u007f-\u009f]/g,'').trim().slice(0,PROFILE_NAME_LIMIT).trim()||DEFAULT_PROFILE_NAME;
}

export function loadProfileName(storage:Pick<Storage,'getItem'>):string{
 try{const raw=storage.getItem(PROFILE_KEY),saved=raw?JSON.parse(raw):null;return saved?.version===1?normalizeProfileName(saved.name):DEFAULT_PROFILE_NAME;}catch{return DEFAULT_PROFILE_NAME;}
}

export function saveProfileName(storage:Pick<Storage,'setItem'>,value:string):string{
 const name=normalizeProfileName(value);
 storage.setItem(PROFILE_KEY,JSON.stringify({version:1,name}));
 return name;
}
