import { getAvatarPosition } from "../utils/avatarPosition";

export default function UserAvatar({ user, name, size = "md", className = "" }) {
  const displayName = name || user?.name || "?";
  const avatar = user?.avatar;
  const position = getAvatarPosition(user);
  const sizes = {
    sm: "h-9 w-9 text-sm",
    md: "h-14 w-14 text-xl",
    lg: "h-20 w-20 text-2xl",
  };
  const sizeClass = sizes[size] || sizes.md;

  if (avatar) {
    return (
      <div
        className={`${sizeClass} relative shrink-0 overflow-hidden rounded-full ring-2 ring-indigo-100 ${className}`}
      >
        <img
          src={avatar}
          alt={displayName}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            objectPosition: `${position.x}% ${position.y}%`,
            transform: `scale(${position.scale})`,
            transformOrigin: `${position.x}% ${position.y}%`,
          }}
        />
      </div>
    );
  }

  return (
    <span
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 ${className}`}
    >
      {displayName.charAt(0).toUpperCase()}
    </span>
  );
}
