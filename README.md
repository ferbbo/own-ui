# Own UI

A React component library built with TypeScript, Emotion, and Vite.

## Features

- 🚀 Built with React and TypeScript
- 💅 Styled with Emotion
- 📦 Bundled with Vite
- 📚 Documented with Storybook
- ✅ Tested with Jest and React Testing Library
- 🧹 Code quality with ESLint and Prettier
- 🔄 Automated releases with semantic-release

## Installation

```bash
# npm
npm install own-ui

# yarn
yarn add own-ui

# pnpm
pnpm add own-ui
```

## Usage

```jsx
import React from "react";
import { Button } from "own-ui";

function App() {
  return (
    <div>
      <Button variant="primary">Click me</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
    </div>
  );
}
```

## Available Components

### Button

A customizable button component with different variants and sizes.

```jsx
<Button
  variant="primary" // 'primary', 'secondary', or 'tertiary'
  size="medium" // 'small', 'medium', or 'large'
  disabled={false} // true or false
  onClick={() => console.log("Button clicked")}
>
  Button Text
</Button>
```

## Development

### Prerequisites

- Node.js (v14 or higher)
- pnpm

### Setup

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/own-ui.git
   cd own-ui
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Start Storybook
   ```bash
   pnpm storybook
   ```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build the library
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm lint` - Lint the code
- `pnpm lint:fix` - Lint and fix the code
- `pnpm format` - Format the code with Prettier
- `pnpm storybook` - Start Storybook
- `pnpm build-storybook` - Build Storybook

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
