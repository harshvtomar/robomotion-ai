#!/usr/bin/env node
/** Local, dependency-free bundle audit. Never claims a size reduction without dist output. */
import { readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, relative, join } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const dist=join(root,'dist');
const strict=process.argv.includes('--require-build');
async function walk(folder){const result=[];for(const ent of await readdir(folder,{withFileTypes:true})){const name=join(folder,ent.name);if(ent.isDirectory())result.push(...await walk(name));else if(ent.isFile()){const s=await stat(name);result.push({file:relative(dist,name),bytes:s.size});}}return result;}
let files=[];
try{files=await walk(dist);}catch(err){if(err?.code!=='ENOENT')throw err;console.log('BUNDLE REPORT: NOT MEASURED (dist missing; run npm run build on Mac)');if(strict)process.exitCode=1;}
if(files.length){
const baseline=1254140; // Stage 7 screenshot: largest JS bundle was 1,254.14 kB (approximate byte comparison only).
const js=files.filter(x=>extname(x.file)==='.js').sort((a,b)=>b.bytes-a.bytes);
const report={schema:'robomotion.bundle.v1',status:'measured',baseline:{stage7LargestJsApproxBytes:baseline,source:'user-provided Stage 7 Mac Vite build screenshot'},totals:{jsFiles:js.length,jsBytes:js.reduce((a,b)=>a+b.bytes,0),largestJsBytes:js[0]?.bytes??0},assets:files.sort((a,b)=>b.bytes-a.bytes),note:'Uncompressed asset sizes; runtime/network performance and WebGL rendering are not measured by this script.'};
console.log('BUNDLE REPORT (uncompressed, filesystem):');
for(const item of js)console.log(`${(item.bytes/1024).toFixed(1)} KiB  ${item.file}`);
console.log(`Largest JS: ${(report.totals.largestJsBytes/1024).toFixed(1)} KiB; baseline largest Stage7 JS ≈ ${(baseline/1024).toFixed(1)} KiB`);
await mkdir(join(root,'reports'),{recursive:true});await writeFile(join(root,'reports','bundle-report.json'),JSON.stringify(report,null,2)+'\n');
}
