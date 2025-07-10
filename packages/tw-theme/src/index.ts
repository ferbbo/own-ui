// Import the plugin creator function
import createPlugin from './plugin.ts';

// Create the plugin
const tailwindPlugin = createPlugin();

// Export the plugin as default
export default tailwindPlugin;

// Export plugin for @plugin directive
// export const pluginTailwindSemantic = {
//   handler: tailwindPlugin,
//   config: {
//     theme: {
//       extend: {},
//     },
//   },
// };

// Re-export types
export * from './types.ts';
