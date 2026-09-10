export const DEVICE_RESET_KEY='backtrack.device-reset';
type StoragePort=Pick<Storage,'length'|'key'|'removeItem'|'setItem'>;
export function clearBacktrackActivity(storage:StoragePort,now:number){
  const keys=Array.from({length:storage.length},(_,i)=>storage.key(i)).filter((k):k is string=>!!k&&k.startsWith('backtrack.'));
  for(const key of keys)storage.removeItem(key);
  storage.setItem(DEVICE_RESET_KEY,String(now));
  return keys.length;
}
