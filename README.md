# rsrcx

Discover active, time‑sensitive opportunities for tech students and developers. Find startup programs, grants, funding, hackathons, and application‑based opportunities with deadlines – all in one place.


## Introduction

**rsrcx** is a Next.js web application that aggregates time‑limited opportunities such as hackathons, grants, and accelerator programs for technology‑focused students and developers. The platform provides a public browsing experience and an admin interface for reviewing user‑submitted opportunities.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Language:** TypeScript (with optional JavaScript files)
- **Styling:** Tailwind 
- **Backend / DB:** Convex  
- **State & hooks:** Convex client hooks  
- **Deployment:** Vercel 

## Prerequisites / Requirements

- **Node.js** version 18 or later
- **npm** (comes with Node) or **yarn**

## Installation

```bash
# Clone the repository
git clone https://github.com/krishn404/rsrcx.git
cd rsrcx

# Install dependencies
npm install
```

## Usage

```bash
# Start the development server
npm run dev
```

Open your browser and navigate to `http://localhost:3000`. The main site shows the curated list of opportunities. 

## Project Structure

```
rsrcx/
├─ app/
│  ├─ api/
│  │  ├─ auth/
│  │  │  ├─ login/route.ts
│  │  │  ├─ logout/route.ts
│  │  │  └─ verify/route.ts
│  │  └─ submit-opportunity/route.ts
│  ├─ admin/
│  │  └─ layout.tsx
│  └─ ... (page components)
├─ components/
│  └─ ... (React components, Radix UI wrappers)
├─ scripts/
│  └─ sync-data.js   # data import/export utilities
├─ public/
├─ styles/
│  └─ globals.css    # Tailwind imports
├─ next.config.mjs
├─ package.json
├─ tsconfig.json
└─ README.md
```

## Features

- **Opportunity aggregation** – central list of hackathons, grants, accelerators, etc.
- **Admin authentication** – simple token‑based login for managing submissions.
- **Submission endpoint** – users can propose new opportunities; admin reviews before publishing.
- **Responsive UI** – built with Tailwind CSS and Radix UI primitives.
- **Data sync scripts** – `npm run sync:export` and `npm run sync:import` for future Convex integration.

## Development

```bash
# Lint the codebase
npm run lint

# Build for production
npm run build

# Start the production server
npm start
```

The project is configured to ignore TypeScript build errors (`ignoreBuildErrors: true`) to allow rapid iteration during early development.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Make your changes and ensure they pass linting (`npm run lint`).
4. Open a pull request describing the changes.

Please adhere to the existing coding style and include relevant tests if applicable.
