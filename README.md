# properties-manager-js

A professional, type-safe **configuration manager for Node + TypeScript**.

✔ Scoped environment files (`.env`, `.env.dev`, `.env.prod`, etc.)  
✔ Strongly typed getters (`getString`, `getNumber`, `getBoolean`, `getJSON`)  
✔ Config cascading & fallbacks  
✔ In-memory caching + Singleton architecture  
✔ ESM + CJS + Types  
✔ Vitest + Coverage  
✔ CI/CD + LibFlow + standard-version  
✔ Husky + lint-staged + commitlint  
✔ npm publishing ready

---

# 🚀 Installation

```bash
npm i properties-manager-js
```

---

# 📦 Usage

```ts
import { ConfigManager } from "properties-manager-js";

const config = ConfigManager.getInstance();

config.load({ scope: "dev" });

const port = config.getNumber("SERVER_PORT");
const mode = config.getString("MODE");
const flags = config.getBoolean("FEATURE_ENABLED");
```

---

# 🧱 Project Structure

```
.
├── src/
│   ├── loader/
│   ├── parsers/
│   ├── core/
│   └── index.ts
├── test/
├── dist/
├── .github/workflows/
├── .husky/
└── README.md
```

---

# 🔧 Supported File Format

This library uses **`.env`-style files**, the most widely adopted configuration format in Node.js:

```
PORT=3000
DB_HOST=localhost
FEATURE_ENABLED=true
ALLOWED=["a","b","c"]
```

---

# 🔀 LibFlow — Workflow

Same as your template:

- `master` → stable branch
- `feature/*` → new features
- `release/x.y` → RC & stabilization
- `hotfix/*` → emergency fixes

---

# 🧪 Typed API

### `getString(key: string): string`

### `getNumber(key: string): number`

### `getBoolean(key: string): boolean`

### `getJSON<T>(key: string): T`

---

# 🛠 First-Time Setup

```bash
npm ci
npm run build
npm run test
```

---

# 📄 License

MIT © Ulises Schreiner
