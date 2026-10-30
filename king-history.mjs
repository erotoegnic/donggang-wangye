import {carrierHistory} from './carrier-history.mjs';
const surnames=['吳','譚','盧','徐','楚','封','盧','趙','楚','宋','盧','趙','吳','封','齊','余','吳','封','齊','羅','耿','封','盧','封','鄭',null];
export const kingHistory=carrierHistory.map((r,i)=>({...r,surname:surnames[i],carrier:Object.entries(r.assignments).find(([,a])=>a.role==='大千歲')[0]}));
