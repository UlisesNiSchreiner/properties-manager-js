# typescript-lib-template

A Template for building **TypeScript libraries** :  
✔ ESM + CJS + type definitions  
✔ Tests + Coverage (Vitest)  
✔ CI/CD  
✔ LibFlow (branching model for libraries)  
✔ Manual versioning with standard-version  
✔ Husky + lint-staged + commitlint  
✔ npm publishing

![CI](https://img.shields.io/github/actions/workflow/status/UlisesNiSchreiner/typescript-lib-template/ci.yml?label=CI)
![npm version](https://img.shields.io/npm/v/uns-typescript-lib-template)
![npm downloads](https://img.shields.io/npm/dm/uns-typescript-lib-template)
[![Coverage](https://codecov.io/gh/UlisesNiSchreiner/typescript-lib-template/branch/master/graph/badge.svg)](https://codecov.io/gh/UlisesNiSchreiner/typescript-lib-template)
![license](https://img.shields.io/badge/License-MIT-green)
![typescript](https://img.shields.io/badge/TypeScript-5.x-blue)

---

# 🚀 Installation

```bash
npm i uns-typescript-lib-template
```

---

# 📦 Usage

```ts
import { sum } from "uns-typescript-lib-template";

console.log(sum(2, 3)); // -> 5
```

---

# 🧱 Project Structure

```
.
├── src/                 # Source code (TS)
├── test/                # Tests (Vitest)
├── dist/                # Final build (ESM, CJS, .d.ts)
├── .husky/              # Git hooks (lint + commitlint)
├── .github/workflows/   # CI/CD
└── README.md
```

---

# 🧩 Initializing a New Project from This Template

When creating a new repository from this template, the default library name is:

```
uns_typescript-lib-template
```

You can automatically rename it by running:

```bash
npm run init-template <your-library-name>
```

Example:

```bash
npm run init-template my-awesome-lib
```

This will:

- Update `package.json` with the new package name
- Update README installation/import examples
- Update npm version/download badges

---

# 🔀 LibFlow — Workflow for Libraries

This project uses **LibFlow**, a GitFlow variant optimized specifically for library development.

### 🌿 Main Branches

- **master** → stable / production branch
- **feature/\*** → new features and fixes
- **release/x.y** → release preparation + RC
- **hotfix/\*** → urgent patches on `master`

### 🔄 Full Flow

1. Create a feature branch:
   ```bash
   git checkout -b feature/my-feature
   ```
2. Open PR → merge into `master`
3. Start a release:
   ```bash
   git checkout -b release/1.2
   ```
4. Publish RC:
   ```bash
   npm run release:rc
   ```
5. Validate RC
6. Merge release → master
7. Publish stable version:
   ```bash
   npm run release:patch   # or :minor / :major
   ```

---

# 🏷 Versioning & Releases

Powered by **standard-version**.

| Action            | Script                        |
| ----------------- | ----------------------------- |
| Patch release     | `npm run release:patch`       |
| Minor release     | `npm run release:minor`       |
| Major release     | `npm run release:major`       |
| Release candidate | `npm run release:rc`          |
| Finalize RC patch | `npm run release:final:patch` |
| Finalize RC minor | `npm run release:final:minor` |
| Finalize RC major | `npm run release:final:major` |

Each command updates:

- `CHANGELOG.md`
- package version
- Git tag
- npm publish (requires `NPM_TOKEN`)

---

# 🧪 Main Scripts

| Script                  | Description                    |
| ----------------------- | ------------------------------ |
| `npm run dev`           | Watch build (tsup)             |
| `npm run build`         | Compile ESM + CJS + types      |
| `npm run test`          | Run tests                      |
| `npm run test:coverage` | Coverage with V8               |
| `npm run typecheck`     | TS check without emitting      |
| `npm run docs`          | Generate Typedoc documentation |

---

# 🛠 First-Time Setup

```bash
npm ci
npm run build
npm run test

git add .
git commit -m "feat: initial setup"
```

---

# 📘 API

### **`sum(a: number, b: number): number`**

Adds two numbers and validates they are finite.

---

# 📄 License

MIT © Ulises Schreiner
