module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {
      // Add any framework-specific options here
    },
  },
  features: {
    storyStoreV7: true,
  },
  docs: {
    autodocs: true,
  },
  // Add Vite-specific configuration
  async viteFinal(config) {
    // Add any custom Vite configuration here
    return config;
  },
};
