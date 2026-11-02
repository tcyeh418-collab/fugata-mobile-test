// A private in-memory copy: never write through to the real browser storage.
export function isolatedStorage(source, fresh = false) {
 const data = new Map();
 if (!fresh) for (const key of ['logic-code.character.v1','fugata.progress.v1']) {
  const value = source.getItem(key); if (value !== null) data.set(key,value);
 }
 return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};
}

// Explicit save-compatibility lab: durable only inside this tab's session namespace.
export function isolatedSessionStorage(source) {
 const prefix='fugata.test-save.';
 return {getItem:k=>source.getItem(prefix+k),setItem:(k,v)=>source.setItem(prefix+k,String(v)),removeItem:k=>source.removeItem(prefix+k)};
}
