export async function fetchJSON(path){const response=await fetch(path,{cache:'no-cache'});if(!response.ok)throw new Error(`${path}:HTTP${response.status}`);return response.json();}
export function emptyManifest(){return {assets:[]};}
