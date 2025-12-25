# project-manager

## 🔍 About Codelyzer

**Codelyzer** is a client-side static code analysis tool designed to inspect and summarize the structure of a codebase without executing it. It analyzes uploaded project files to extract metrics such as language distribution, file types, and overall code composition, providing fast, high-level insight into project complexity and organization.

All analysis is performed locally in the browser, ensuring data privacy and eliminating the need for server-side processing or persistent storage.

🔗 Live App: https://codelyzer.vercel.app/

### ⚙️ Technical Highlights
- Static analysis (no runtime execution)
- Client-side file parsing and aggregation
- Language and extension-based classification
- Zero backend dependency for analysis
- Optimized for fast feedback on large codebases

### 🧪 Intended Use
- Preliminary codebase inspection
- Architecture and complexity assessment
- Repository evaluation prior to review or onboarding
- Lightweight alternative to full CI-based analyzers

### ⚙️ Technical Characteristics
- Client-side directory traversal and file inspection
- Extension-based language detection
- Line-of-code aggregation and file statistics
- No AST generation or code execution
- Zero persistence and zero backend dependency
- Optimized for large repositories with minimal overhead

### 🧪 Engineering Use Cases
- Rapid structural assessment of unfamiliar codebases
- Early-stage complexity estimation before deep analysis
- Lightweight validation prior to CI or linting pipelines
- Safe analysis of proprietary or sensitive source code

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```
