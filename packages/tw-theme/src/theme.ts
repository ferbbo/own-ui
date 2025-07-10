import { getBuiltInTheme } from "./themes";
import { PluginOptions, ThemeColors } from "./types";
import { semanticColorNames } from "./utilities";

const processThemes = (options: PluginOptions): Record<string, ThemeColors> | undefined => {
  const processedThemes: Record<string, ThemeColors> = {};
  const getCustomTheme = (options: PluginOptions): Record<string, string>  => {
    return semanticColorNames.reduce((acc, colorName) => {
      if (colorName in options) {
        acc[colorName] = options[colorName]
      }
       return acc
    }, {})
  }
  // If no themes are provided, use the default light theme
  if (Object.keys(options).length == 0) return; 
  
  if (options.name) {
    const themeName = options.name
    processedThemes[themeName] = {
      ...getBuiltInTheme(themeName),
      ...getCustomTheme(options)

    }
  }
  return processedThemes;
};