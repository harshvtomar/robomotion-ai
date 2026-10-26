/** A deterministic, aspect-aware orbit-camera framing policy.
 * All distances are visual-only. These values do not alter robot geometry.
 */
export function cameraDistanceScale(aspect: number, focusRobot: boolean): number {
  const base = focusRobot ? 0.66 : 1;
  if (!Number.isFinite(aspect) || aspect <= 0) return base;
  // Increase viewing distance on portrait/narrow canvases, avoiding cropped joints.
  const narrowness = Math.max(0, Math.min(1, (1.15 - aspect) / 0.8));
  return base * (1 + narrowness * 0.55);
}
export function cameraTargetHeight(focusRobot: boolean): number {
  return focusRobot ? 1.8 : 1.35;
}
