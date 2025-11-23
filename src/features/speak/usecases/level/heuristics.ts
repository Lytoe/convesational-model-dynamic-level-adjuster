export const normalize = (s:string)=> s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}\s']/gu,' ').replace(/\s+/g,' ').trim();
export const tokenCount = (s:string)=> normalize(s).split(' ').filter(Boolean).length;
export const p90 = (arr:number[])=> arr.length? arr.slice().sort((a,b)=>a-b)[Math.floor(0.9*(arr.length-1))] : Infinity;
export const expectedBand = (lvl:string):[number,number]=>{
  switch(lvl){case'A1':return[3,8];case'A2':return[5,12];case'B1':return[8,20];case'B2':return[12,30];case'C1':return[15,40];default:return[20,60];}
};
// simple approx contains (levenshtein-lite via common-substring)
export function containsApprox(hay:string, needle:string){ 
  hay=normalize(hay); needle=normalize(needle);
  if (!needle) return false;
  if (hay.includes(needle)) return true;
  // fallback: require 80% of tokens present
  const nt=needle.split(' ').filter(Boolean); const hset=new Set(hay.split(' '));
  const hit=nt.filter(t=>hset.has(t)).length;
  return hit/nt.length>=0.8;
}
export function usedAnyKeyPhrase(prev:{responseA:string;responseB:string}|null, userText:string){
  if(!prev) return false;
  return containsApprox(userText, prev.responseA)||containsApprox(userText, prev.responseB);
}
