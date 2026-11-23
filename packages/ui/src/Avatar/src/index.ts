// index.ts
export { default } from "./Avatar";
export { default as Avatar, AvatarGroup } from "./Avatar";
export { default as useAvatar, initialsFromName } from "./useAvatar";
export type { UseAvatarResult, AvatarContentKind } from "./useAvatar";
export { AvatarGroupContext, useAvatarGroupContext } from "./AvatarGroupContext";
export type {
  AvatarProps,
  AvatarBaseProps,
  AvatarGroupProps,
  AvatarGroupContextValue,
  AvatarTheme,
  AvatarShape,
  AvatarSize,
} from "./Avatar.types";
