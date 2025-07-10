import { PluginOptions } from "src/types.ts"

export const plugin = {
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