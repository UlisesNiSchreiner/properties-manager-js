# config-manager-js

A lightweight **configuration manager for JS
Designed to handle **scoped configuration files\*\*, environment overrides
and strongly-typed access with predictable resolution rules.

It provides a clean alternative to accessing `process.env` directly,
enforcing structure, validation and consistency across environments.

### Key features

✔ Scoped configuration files (`config.dev`, `config.prod`, etc.)\
✔ Automatic scope detection via `SCOPE` environment variable\
✔ Runtime scope override (`config.load()`)\
✔ Strongly typed getters (`getString`, `getNumber`, `getBoolean`,
`getJson`)\
✔ Deterministic resolution & fallbacks\
✔ In-memory caching + singleton architecture\
✔ ESM + CJS + TypeScript declarations\
✔ Full test coverage with Vitest\
✔ CI/CD + LibFlow + standard-version\
✔ Husky + lint-staged + commitlint\
✔ npm publishing ready

---

## 🚀 Installation

```bash
npm install config-manager-js
```

---

## 📦 Usage

The library loads configuration from files located at:

    ./config/config.<scope>

Where `<scope>` is resolved automatically or overridden at runtime.

---

### ✅ Default behavior (no setup required)

If **no `SCOPE` environment variable is set** and you **don't call
`config.load()`**, the library falls back to:

    ./config/config.dev

```ts
import { config } from "config-manager-js";

const port = config.getNumber("PORT");
const mode = config.getString("MODE");
const enabled = config.getBoolean("FEATURE_ENABLED");
```

---

### ✅ Using `SCOPE` from environment variables

You can define the active scope using an environment variable or `.env`:

```env
SCOPE=prod
```

This automatically loads:

    ./config/config.prod

```ts
const port = config.getNumber("PORT"); // from config.prod
```

---

### ✅ Forcing a scope at runtime

```ts
config.load("qa"); // loads ./config/config.qa

const port = config.getNumber("PORT");
```

Reset override:

```ts
config.load();
```

---

### ✅ Overriding scope per call

```ts
const devPort = config.getNumber("PORT", { scope: "dev" });
const prodPort = config.getNumber("PORT", { scope: "prod" });
```

---

### 📌 Scope resolution order

1.  `options.scope`
2.  `config.load(scope)`
3.  `SCOPE` env var
4.  Default `"dev"`

---

### 📌 Value resolution order

1.  `process.env` with prefix\
2.  `process.env`\
3.  `config.<scope>`\
4.  `config.dev`

---

## 🧪 Typed API

### `getString`

### `getNumber`

### `getBoolean`

### `getJson<T>`

---

## 🧱 Project Structure

    .
    ├── src/
    │   ├── core/
    │   ├── parsers/
    │   ├── loader/
    │   └── index.ts
    ├── test/
    ├── dist/
    ├── .github/workflows/
    ├── .husky/
    └── README.md

---

## 🔧 Supported File Format

    PORT=3000
    DB_HOST=localhost
    FEATURE_ENABLED=true
    ALLOWED=["a","b","c"]

---

## 🔀 LibFlow --- Workflow

- master → stable
- feature/\* → development
- release/x.y → RC
- hotfix/\* → patches

---

## 🛠 First-Time Setup

```bash
npm ci
npm run build
npm run test
```

---

## 📄 License

MIT © Ulises Schreiner
