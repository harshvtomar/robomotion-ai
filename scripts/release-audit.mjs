#!/usr/bin/env node
/** Validate release structure and safety contracts without browser/npm dependencies. */
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=f=>readFileSync(resolve(root,f),'utf8');
const errors=[];
function check(ok,label){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)errors.push(label)}
const pkg=JSON.parse(read('package.json'));
check(pkg.version==='0.8.0','Final version is v0.8.0');
check(pkg.scripts.test&&pkg.scripts.typecheck&&pkg.scripts.build,'Tests, TS, and build scripts preserved');
const app=read('src/App.tsx');
for(const token of ['<StarterScene','<RobotControls','<TargetControls','<ManipulationControls','<GestureLab','<GestureControlPanel','<EngineeringDashboard'])check(app.includes(token),`Preserve ${token}`);
for(const token of ['emergencyStop','expireTracking','disableTeleop','checkTrajectory','gesturePoseStep'])check(app.includes(token),`Safety invariant ${token}`);
check(app.includes('lazy(() => import('),'Renderer split from entry chunk');
check(read('src/vision/mediapipe.ts').includes("await import('@mediapipe/tasks-vision')"),'MediaPipe remains on-demand');
const telemetry=read('src/core/diagnostics.ts');
check(!/(getUserMedia|detectForVideo|WebSocket|XMLHttpRequest|fetch\(|localStorage|sessionStorage)/.test(telemetry),'Diagnostics module has no capture or network interface');
for(const file of ['README.md','LICENSE','docs/RELEASE_QA_CHECKLIST.md','docs/DEPLOYMENT.md','docs/PORTFOLIO_CASE_STUDY.md','docs/DEMO_SCRIPT.md','docs/RESUME_BULLETS.md','docs/PRIVACY_AND_LIMITATIONS.md','STAGE_8_COMPLETION_REPORT.md','.github/workflows/ci.yml','.github/workflows/pages.yml'])check(existsSync(resolve(root,file)),`Release artifact ${file}`);
const docs=read('STAGE_8_COMPLETION_REPORT.md');
check(/pending/i.test(docs)&&/not verified/i.test(docs),'Report openly discloses pending and unverified steps');
if(errors.length){console.error(`Release audit failed: ${errors.length} checks`);process.exitCode=1;}else console.log('Release audit passed. Browser/WebGL QA remains a separate Mac activity.');
