// Preserve exact raw bytes before any replacement; no migration erases the original.
export const BACKUP_KEY='fugata.save-backups.v1';
export function backupBeforeWrite(storage,key,next) {
 const raw=storage.getItem(key);
 if(raw===null||raw===next)return;
 const entries=JSON.parse(storage.getItem(BACKUP_KEY)||'[]');
 // Keep distinct originals, including unsupported historical character settings.
 if(!entries.some(e=>e.key===key&&e.raw===raw)) {
  entries.push({key,raw,createdAt:new Date().toISOString()});
  storage.setItem(BACKUP_KEY,JSON.stringify(entries));
 }
}
export function restoreBackup(storage,index) {
 const entries=JSON.parse(storage.getItem(BACKUP_KEY)||'[]'),entry=entries[index];
 if(!entry||!['logic-code.character.v1','fugata.progress.v1'].includes(entry.key))throw Error('備份無效');
 backupBeforeWrite(storage,entry.key,entry.raw);
 storage.setItem(entry.key,entry.raw);
}
