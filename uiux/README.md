# Create Reat app

```shell
cd ../frontend
npm create vite@latest . -- --template react
```

# Here's how to set up Tailwind CSS 3 in your React + Vite project:

## 1. Install Tailwind and dependencies

```
npm install -D tailwindcss@3 postcss autoprefixer
```

## 2. Initialize Tailwind config

```
npx tailwindcss init -p
```

> This creates tailwind.config.js and postcss.config.js

## 3. Configure Tailwind

### Update `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

## 4. Add Tailwind directives to your CSS

### Create or update src/index.css:

```js
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 5. Import the CSS in your main entry file

### In src/main.jsx:

```js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Import Tailwind CSS

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

## 6. Test it

### Update src/App.jsx:

```js
function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600">Hello Tailwind!</h1>
    </div>
  );
}

export default App;
```

## 7. Run your dev server

```shell
npm run dev:client
```

# Tailwind 4 setup

## Create your project

> Start by creating a new Vite project if you don’t have one set up already. The most common approach is to use Create Vite.

```shell
npm create vite@latest my-project
cd my-project
```

## Install Tailwind CSS

> Install `tailwindcss` and `@tailwindcss/vite` via npm.

```shell
npm install tailwindcss @tailwindcss/vite
```

## Configure the Vite plugin

> Add the `@tailwindcss/vite` plugin to your Vite configuration.

`vite.config.ts`

```js
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
```

> copy paste this:

```js
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

## Import Tailwind CSS

> Add an `@import` to your CSS file that imports Tailwind CSS.

`index.css`

```css
@import "tailwindcss";
```

## Creat folders inside src

```
mkdir -p src/assets src/config src/constants src/data src/services/api src/services/auth src/services/context src/services/errors src/services/helpers src/services/hooks src/services/i18n src/services/providers/wrappers src/services/query src/services/store src/ui/components src/ui/containers src/ui/guards src/ui/hooks src/ui/modals src/ui/pages/SEO src/ui/styles src/ui/themes src/utils
```
