import { PluginOptions } from "src/types.ts"

/**
 * Provides a utility to create Tailwind plugins with options.
 *
 * @param pluginFunction - The main plugin function.
 * @param configFunction - Optional configuration function for the plugin.
 * @returns A function that combines the plugin handler and configuration.
 */
const plugin = {
  withOptions: (pluginFunction: (options: PluginOptions) => void, configFunction: (options: PluginOptions) => void = (options) => ({})) => {
    const optionsFunction = (options: PluginOptions) => {
      const handler = pluginFunction(options)
      const config = configFunction(options)
      return { handler, config }
    }
    optionsFunction.__isOptionsFunction = true
    return optionsFunction
  },
}

export default plugin;