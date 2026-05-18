const DEFAULT_POSITION = { x: 50, y: 50, scale: 1 };

export function getAvatarPosition(user) {
  const pos = user?.avatarPosition;
  if (!pos) return DEFAULT_POSITION;
  return {
    x: Number(pos.x) || 50,
    y: Number(pos.y) || 50,
    scale: Number(pos.scale) || 1,
  };
}
