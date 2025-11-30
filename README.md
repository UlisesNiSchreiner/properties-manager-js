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

# Contributing to config-manager-js

Thank you for your interest in contributing to **config-manager-js**.
Contributions are welcome and encouraged. This project follows a
**feature-based workflow** designed to keep `master` always stable and
production-ready.

---

## ✅ Development Workflow

All changes must go through a **Pull Request**. Direct pushes to
`master` are not allowed.

### 1. Fork & Clone

```bash
git clone https://github.com/UlisesNiSchreiner/config-manager-js.git
cd config-manager-js
npm install
```

---

### 2. Create a Feature Branch

All work must be done from a `feature/*` branch:

```bash
git checkout -b feature/my-feature
```

Branch naming convention:

    feature/<short-descriptive-name>

Examples: - `feature/add-yaml-support` -
`feature/improve-scope-resolution` - `feature/performance-optimizations`

---

### 3. Development Standards

Before opening a PR, make sure all checks pass:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

This project enforces:

- ESLint + Prettier
- Full TypeScript type safety
- High test coverage (Vitest)
- Conventional Commits

---

### 4. Commit Convention

Commits must follow **Conventional Commits**:

```bash
feat: add support for custom scope resolution
fix: prevent cache leak on scope switch
docs: update usage examples
chore: update dependencies
```

Husky + commitlint will block invalid commits automatically.

---

### 5. Open a Pull Request

Push your branch and open a PR targeting `master`:

```bash
git push origin feature/my-feature
```

In the Pull Request:

- Clearly describe **what was changed**
- Explain **why the change is needed**
- Reference related issues if applicable

All Pull Requests require **at least one approval** before being merged.

---

### 6. After Merge

Once merged into `master`, the change will be included in the next
release cycle according to the LibFlow process:

- Regular changes → included in the next `release/x.y` branch
- Urgent fixes → can be promoted via `hotfix/*`

---

## 🧠 Design Principles for Contributions

When contributing, please keep these principles in mind:

- Predictable configuration resolution
- Zero side effects between scopes
- Strong typing with explicit behavior
- No silent fallbacks unless explicitly defined
- Performance and memory safety first

---

---

## 📄 License

MIT © Ulises Schreiner
