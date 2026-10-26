#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const major = Number(process.versions.node.split('.')[0]);
const eligible = major >= 22;
const installed = existsSync(new URL('../node_modules', import.meta.url));
console.log(`RoboMotion AI · Stage 1 preflight`);
console.log(`Node: ${process.version} ${eligible ? 'OK' : 'UPDATE RECOMMENDED (Node 22+)'} `);
console.log(`Platform: ${process.platform} (${process.arch})`);
console.log(`Dependencies installed: ${installed ? 'YES' : 'NO'}`);
try { console.log(`npm: ${execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim()}`); }
catch { console.log('npm: unavailable'); }
console.log('Commands: npm install | npm test | npm run typecheck | npm run build | npm run dev');
if (!installed) console.log('Run npm install when connected to the internet. Source-only tests require no installation.');
if (!eligible) process.exitCode = 1;
