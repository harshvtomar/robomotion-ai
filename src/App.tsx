import { useReducer, useState } from 'react';
import type { CSSProperties, Dispatch } from 'react';
import { SceneErrorBoundary } from './components/SceneErrorBoundary';
import { StarterScene } from './components/StarterScene';
import { Icon } from './components/Icons';
import { DEVELOPMENT_STAGES, INITIAL_SCENE, STAGE_TOTAL, WORKSPACE, sceneReducer } from './core/stage1';
import type { CameraPreset } from './core/stage1';
import { HOME_POSE, JOINT_KEYS, JOINT_SPECS, POSE_PRESETS, robotReducer } from './core/robot';
import type { RobotAction, RobotPose, PosePreset } from './core/robot';

const CAMERA_LABELS: Record<CameraPreset, string> = {
  isometric: 'Isometric',
  front: 'Front',
  top: 'Top',
};

function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      {mobileOpen && <button className="sidebar-scrim" type="button" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-symbol" aria-hidden="true"><span>R</span><span>M</span></div>
          <div><div className="brand-title">ROBO<span>MOTION</span></div><div className="brand-subtitle">ENGINEERING LAB <b>AI</b></div></div>
          <button type="button" className="mobile-close icon-btn" aria-label="Close menu" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="sidebar-tag"><span className="tiny-dot" /> PROJECT WORKSPACE <span className="tag-version">V0.2</span></div>
        <div className="nav-label">PROJECT</div>
        <nav aria-label="Project navigation" className="nav-list">
          <a href="#workspace" className="nav-item nav-active" onClick={onClose}><Icon name="cube" /> 3D Workspace <span className="nav-highlight" /></a>
          <a href="#joint-controls" className="nav-item" onClick={onClose}><Icon name="orbit" /> Joint Controls</a>
          <a href="#overview" className="nav-item" onClick={onClose}><Icon name="layers" /> Overview</a>
          <a href="#build-roadmap" className="nav-item" onClick={onClose}><Icon name="compass" /> Build Roadmap</a>
        </nav>
        <div className="nav-label nav-label-second">ENGINEERING</div>
        <div className="nav-list">
          <div className="nav-item nav-disabled" aria-disabled="true"><Icon name="orbit" /> Inverse Kinematics <span className="soon">S3</span></div>
          <div className="nav-item nav-disabled" aria-disabled="true"><Icon name="monitor" /> Gesture Control <span className="soon">S5</span></div>
          <div className="nav-item nav-disabled" aria-disabled="true"><Icon name="shield" /> Diagnostics <span className="soon">S7</span></div>
        </div>
        <div className="sidebar-bottom">
          <div className="side-progress">
            <div className="side-progress-top"><span>BUILD PROGRESS</span><strong>02 <em>/ 08</em></strong></div>
            <div className="progress-track"><span style={{ width: `${200 / STAGE_TOTAL}%` }} /></div>
            <p>Articulated arm · Manual control</p>
          </div>
          <div className="side-signature"><span className="signature-mark">◈</span><span>Designed to build real understanding.<br /><strong>One stage at a time.</strong></span></div>
        </div>
      </aside>
    </>
  );
}

function RobotControls({ pose, dispatch }: { pose: RobotPose; dispatch: Dispatch<RobotAction> }) {
  const activePreset = (Object.keys(POSE_PRESETS) as PosePreset[]).find(
    (key) => JOINT_KEYS.every((joint) => pose[joint] === POSE_PRESETS[key][joint]),
  );
  return (
    <section className="joint-section" id="joint-controls" aria-label="Manual robotic arm controls">
      <div className="joint-section-header">
        <div><div className="section-kicker">ARTICULATED ARM / MANUAL DRIVE</div><h2>Joint control console</h2><p>Move six independent channels. Commands stay within mechanical limits and animate smoothly in the 3D viewport.</p></div>
        <button type="button" className="pose-reset" onClick={() => dispatch({ type: 'RESET_POSE' })}><Icon name="reset" size={15}/> Reset pose</button>
      </div>
      <div className="preset-row" aria-label="Robot pose presets">
        <span>QUICK POSES</span>
        {(Object.keys(POSE_PRESETS) as PosePreset[]).map((preset) => (
          <button key={preset} type="button" aria-pressed={activePreset === preset} className={`preset-pill ${activePreset === preset ? 'preset-selected' : ''}`} onClick={() => dispatch({ type: 'APPLY_PRESET', preset })}>{preset}</button>
        ))}
      </div>
      <div className="joint-grid">
        {JOINT_KEYS.map((joint, index) => {
          const spec = JOINT_SPECS[joint];
          return (
            <div className="joint-card" key={joint}>
              <div className="joint-head"><span className="joint-number">J{String(index + 1).padStart(2, '0')}</span><label htmlFor={`joint-${joint}`}>{spec.label}</label><output htmlFor={`joint-${joint}`} className="joint-value">{pose[joint]}<span>{spec.unit}</span></output></div>
              <div className="joint-subtitle">{spec.description}</div>
              <div className="joint-input-row">
                <button type="button" className="nudge-button" aria-label={`Decrease ${spec.label}`} disabled={pose[joint] <= spec.min} onClick={() => dispatch({ type: 'NUDGE_JOINT', joint, direction: -1 })}>−</button>
                <input type="range" id={`joint-${joint}`} min={spec.min} max={spec.max} step={spec.step} value={pose[joint]} onChange={(event) => dispatch({ type: 'SET_JOINT', joint, value: Number(event.target.value) })} aria-valuetext={`${pose[joint]}${spec.unit}`} style={{ '--joint-fill': `${((pose[joint] - spec.min) / (spec.max - spec.min)) * 100}%` } as CSSProperties} />
                <button type="button" className="nudge-button" aria-label={`Increase ${spec.label}`} disabled={pose[joint] >= spec.max} onClick={() => dispatch({ type: 'NUDGE_JOINT', joint, direction: 1 })}>+</button>
              </div>
              <div className="joint-extents"><span>{spec.min}{spec.unit}</span><span>{spec.max}{spec.unit}</span></div>
            </div>
          );
        })}
      </div>
      <div className="joint-footnote"><Icon name="shield" size={15}/><span>Manual joint-space visualization only. No inverse kinematics, autonomous movement, collision avoidance, or real hardware control in Stage 2.</span></div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return <div className="metric"><span className="metric-label">{label}</span><div className="metric-value">{value}</div><div className="metric-sub">{sub}</div></div>;
}

export default function App() {
  const [settings, dispatch] = useReducer(sceneReducer, INITIAL_SCENE);
  const [robotPose, robotDispatch] = useReducer(robotReducer, HOME_POSE);
  const [sceneReady, setSceneReady] = useState(false);
  const [resetVersion, setResetVersion] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  function resetWorkspace() {
    dispatch({ type: 'RESET' });
    setResetVersion((version) => version + 1);
  }

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="main" id="workspace">
        <header className="topbar">
          <div className="topbar-left"><button type="button" className="mobile-menu icon-btn" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Icon name="menu" /></button><span>RoboMotion AI</span><span className="breadcrumb-slash">/</span><strong>Workspace</strong><span className="topbar-stage">STAGE 02</span></div>
          <div className="topbar-right"><span className="dot-status" /><span>ARM PROTOTYPE</span><span className="version-pill">v0.2.0</span></div>
        </header>

        <div className="page-content">
          <section className="intro" id="overview">
            <div className="eyebrow"><span className="eyebrow-line" /> ROBOTICS LABORATORY <span className="eyebrow-num">/ 002</span></div>
            <div className="intro-heading"><div><h1>The future is <em>built.</em></h1><p>Your interactive engineering workspace. Explore the 3D scene, establish the coordinate system, and manually operate a six-channel 3D robotic arm with precise joint limits, pose presets and smooth motion.</p></div><div className="intro-orbit" aria-hidden="true"><span className="orbit-ring orb-a" /><span className="orbit-ring orb-b" /><span className="orbit-center" /></div></div>
          </section>

          <section className="workspace-section" aria-label="3D engineering environment">
            <div className="section-line"><div><span className="section-number">01</span><h2>Simulation workspace</h2></div><span className="section-aside">EXPLORE · ROTATE · INSPECT</span></div>
            <div className="workspace-layout">
              <div className="viewport-card">
                <div className="viewport-top"><div className="viewport-title"><span className="live-ring" /> LIVE 3D VIEWPORT <span className="viewport-divider">/</span> <span className="view-soft">ARTICULATED ARM</span></div><div className="viewport-top-right"><span>WEBGL</span><span className="mini-separator">·</span><span>{sceneReady ? 'RENDERER READY' : 'INITIALIZING'}</span></div></div>
                <div className="scene-window">
                  <SceneErrorBoundary>
                    <StarterScene settings={settings} resetVersion={resetVersion} pose={robotPose} onReady={() => setSceneReady(true)} />
                  </SceneErrorBoundary>
                  <div className="scene-corner scene-top-left"><span className="scene-corner-title">ROBOT / RM-02</span><span>6 manual channels · Procedural 3D model</span></div>
                  <div className="scene-corner scene-bottom-left"><span className="scene-led" /> <span>{settings.animateBeacon ? 'BEACON ACTIVE' : 'BEACON PAUSED'}</span></div>
                  <div className="scene-corner scene-bottom-right"><span>DRAG TO ROTATE</span><span className="zoom-help">SCROLL TO ZOOM</span></div>
                </div>
                <div className="viewport-toolbar" aria-label="Scene tools">
                  <div className="toolbar-group">
                    <button className={`tool-button ${settings.showGrid ? 'tool-active' : ''}`} type="button" aria-pressed={settings.showGrid} onClick={() => dispatch({ type: 'TOGGLE_GRID' })} title="Toggle reference grid"><Icon name="grid" size={16} /> Grid</button>
                    <button className={`tool-button ${settings.showAxes ? 'tool-active' : ''}`} type="button" aria-pressed={settings.showAxes} onClick={() => dispatch({ type: 'TOGGLE_AXES' })} title="Toggle coordinate axes"><Icon name="axis" size={16} /> Axes</button>
                    <span className="tool-divider" />
                    <button className="tool-button" type="button" aria-pressed={settings.animateBeacon} onClick={() => dispatch({ type: 'TOGGLE_MOTION' })}><Icon name={settings.animateBeacon ? 'pause' : 'play'} size={16} /> {settings.animateBeacon ? 'Pause beacon' : 'Play beacon'}</button>
                  </div>
                  <button className="tool-button reset-btn" type="button" onClick={resetWorkspace}><Icon name="reset" size={16} /> Reset view</button>
                </div>
              </div>

              <aside className="inspector" aria-label="Scene inspector">
                <div className="inspector-heading"><div><span className="inspector-kicker">INSPECTOR PANEL</span><h3>Scene controls</h3></div><Icon name="layers" size={20} /></div>
                <div className="inspector-body">
                  <label className="control-label" htmlFor="camera-preset">CAMERA PRESET</label>
                  <div className="select-wrap"><select id="camera-preset" value={settings.camera} onChange={(event) => dispatch({ type: 'SET_CAMERA', preset: event.target.value as CameraPreset })}>
                    {Object.entries(CAMERA_LABELS).map(([value, name]) => <option key={value} value={value}>{name} view</option>)}
                  </select><Icon name="compass" size={17} /></div>
                  <div className="inspector-rule" />
                  <span className="control-label">SCENE INFORMATION</span>
                  <dl className="property-list"><div><dt>Coordinate system</dt><dd>Right-handed</dd></div><div><dt>Up axis</dt><dd>+Y</dd></div><div><dt>Workspace size</dt><dd>{WORKSPACE.width} × {WORKSPACE.depth} m</dd></div><div><dt>Grid divisions</dt><dd>{WORKSPACE.gridDivisions}</dd></div><div><dt>Camera</dt><dd>{CAMERA_LABELS[settings.camera]}</dd></div><div><dt>Manual channels</dt><dd>6</dd></div></dl>
                  <div className="inspector-rule" />
                  <div className="foundation-callout"><span className="callout-symbol"><Icon name="spark" size={17}/></span><div><strong>Stage 2 · Arm online</strong><p>Control base, shoulder, elbow, wrist and gripper below. Stage 3 inverse kinematics is not implemented.</p></div></div>
                </div>
                <div className="inspector-footer"><span className="footer-led"/>STAGE 02 / 08 <span className="footer-right">MANUAL ROBOT</span></div>
              </aside>
            </div>
          </section>

          <RobotControls pose={robotPose} dispatch={robotDispatch} />

          <section className="metrics-section" aria-label="Project engineering indicators">
            <Stat label="DEVELOPMENT STAGE" value="02 / 08" sub="Articulated arm" />
            <Stat label="SCENE RENDERER" value="Three.js" sub="WebGL · React Three Fiber" />
            <Stat label="REFERENCE AXES" value="X · Y · Z" sub="Right-handed coordinate system" />
            <Stat label="ROBOT CONTROL" value="6 joints" sub="Manual sliders + presets" />
          </section>

          <section className="roadmap" id="build-roadmap">
            <div className="section-line roadmap-line"><div><span className="section-number">03</span><h2>The build roadmap</h2></div><span className="section-aside">8 DEVELOPMENT STAGES</span></div>
            <div className="roadmap-list">
              {DEVELOPMENT_STAGES.map((stage, index) => (
                <div className={`roadmap-item ${index === 1 ? 'roadmap-current' : ''}`} key={stage}>
                  <span className="roadmap-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="roadmap-title">{stage}</span>
                  <span className={`roadmap-status ${index === 1 ? 'current-status' : ''}`}>{index === 0 ? 'COMPLETE' : index === 1 ? 'CURRENT STAGE' : 'UPCOMING'}</span>
                  <span className="roadmap-indicator">{index <= 1 ? <Icon name="check" size={15}/> : <Icon name="arrow" size={16}/>}</span>
                </div>
              ))}
            </div>
          </section>
          <footer className="page-footer"><span>ROBOMOTION AI <b>·</b> ENGINEERING FIRST</span><span>Stage 2 articulated arm · Manual joint control</span></footer>
        </div>
      </main>
    </div>
  );
}
