// Import the plugin creator function
import createPlugin from './plugin.ts';

// Create the plugin
const tailwindPlugin = createPlugin();

// Export the plugin as default
export default tailwindPlugin;

// Re-export types
export * from './types.ts';
