import type { ReactNode } from 'react';

type IconName = 'orbit' | 'layers' | 'cube' | 'grid' | 'axis' | 'play' | 'pause' | 'reset' | 'arrow' | 'check' | 'menu' | 'close' | 'compass' | 'code' | 'monitor' | 'shield' | 'spark';

const DRAWINGS: Record<IconName, ReactNode> = {
  orbit: <><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-32 12 12)"/></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
  cube: <><path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z"/><path d="m3 7 9 5 9-5M12 12v10"/></>,
  grid: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></>,
  axis: <><path d="M12 20V4m-4 4 4-4 4 4M4 18l8 2 8-2"/><path d="m4 18 3-4m13 4-3-4"/></>,
  play: <path d="m8 5 11 7-11 7V5Z"/>,
  pause: <><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></>,
  reset: <><path d="M3 11a9 9 0 1 1 2.8 7M3 4v7h7"/></>,
  arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
  check: <path d="m4 12 5 5L20 6"/>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  close: <path d="m5 5 14 14M19 5 5 19"/>,
  compass: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/></>,
  code: <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-16-2 20"/>,
  monitor: <><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 22h8m-4-4v4"/></>,
  shield: <><path d="m12 2 9 4v6c0 5-3.7 8.3-9 10-5.3-1.7-9-5-9-10V6l9-4Z"/><path d="m8 12 3 3 5-6"/></>,
  spark: <><path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/></>,
};

export function Icon({ name, size = 18, className = '' }: { name: IconName; size?: number; className?: string }) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{DRAWINGS[name]}</svg>;
}
