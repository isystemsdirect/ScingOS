export const AVATAR_DIAMETER_UNITS = 1.0
export const AVATAR_RADIUS_UNITS = AVATAR_DIAMETER_UNITS / 2
// Stage 2 hover theory (locked): hover clearance ≈ 0.33 * radius
export const AVATAR_HOVER_UNITS = 0.33 * AVATAR_RADIUS_UNITS

export const FLOOR_Y = 0
// Center sits at radius + hover clearance above the floor plane.
export const AVATAR_CENTER_Y = FLOOR_Y + AVATAR_RADIUS_UNITS + AVATAR_HOVER_UNITS

// Camera tuned for a 1.0-unit avatar and deep zoom-out via OrbitControls
export const CAMERA_Z = 3.2
