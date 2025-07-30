# 🧰 Portfolio Builder

A full-stack application designed to help developers generate and showcase personalized portfolios. Built with a modular architecture that includes a TypeScript-powered frontend, a Node.js backend, and CI/CD integration via Netlify.

---

## 🚀 Features

- ✨ Dynamic portfolio generation
- 🧪 Unit test suite integrated into CI pipeline
- 🌐 Frontend and backend separation for scalability
- 📦 Netlify deployment configuration
- 📄 Resume and parser tools included for content extraction

---

## 🗂️ Project Structure

```text
📁 Portfolio-Builder/
├── 📦 portfolio-frontend/             — React-based frontend (TypeScript, HTML, CSS)
├── 🧩 portfolio-backend/              — Node.js backend API
├── 🛠️ scripts/                        — Utility scripts for parsing and automation
├── ⚙️ .github/workflows/              — CI/CD pipeline configuration
├── 📝 netlify.toml                    — Netlify deployment settings
├── 📄 Stephen_Blanchard-Resume.pdf    — Resume document
├── 🔍 extract-text.js                 — Text extraction utility
├── 🧠 full-extract.js                 — Full resume parser
├── 📚 generic-parser-design.md        — Parser architecture notes
└── 🚀 DEPLOYMENT_GUIDE.md             — Deployment instructions
```


---

## 🛠️ Technologies Used

- **Frontend**: TypeScript, React, HTML, CSS
- **Backend**: Node.js, Express
- **CI/CD**: GitHub Actions, Netlify
- **Testing**: Jest (configured in CI)
- **Parsing**: Custom JavaScript utilities for resume analysis

---

## 📦 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm or yarn

### Installation

```bash
git clone https://github.com/blanchardsw/Portfolio-Builder.git
cd Portfolio-Builder
npm install
```

# Start frontend
```cd portfolio-frontend
npm start
```

# Start backend
```cd ../portfolio-backend
npm run dev
```

🧪 Testing
```
npm test
```
