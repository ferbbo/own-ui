import { Flags } from "../types.ts";

const getThemeNameConfig = (theme: string): { name: string; flag: Flags } | null => {
  const [name, flag] = theme.split(' ');
  if (
    name && typeof flag === 'string' &&
    Object.values(Flags).includes(flag as Flags) &&
    theme.includes(flag)
  ) {
    return { name, flag: flag as Flags };
  }
  return null;
};

export default getThemeNameConfig;