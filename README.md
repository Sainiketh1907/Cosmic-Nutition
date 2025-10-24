# cosmic-nutrition

![Cosmic Nutrition logo](./client/src/assets/cosmic_logo.png)

Cosmic Nutrition is a small MERN (MongoDB, Express, React, Node) application for tracking meals and daily nutrition. The project is split into two main pieces:

- `client/` — React (Vite) frontend, Tailwind CSS for styling.
- `server/` — Express API with MongoDB models for users and meals.

This README provides a quick start, environment variables, project structure, and tips for development.

## Quick start

1. Clone the repo (or if already on machine, skip):

```bash
git clone <your-repo-url>
cd cosmic-nutrition
```

2. Install dependencies and run locally.

Client (frontend):

```bash
cd client
npm install
npm run dev
# open http://localhost:5173 (or the port Vite shows)
```

Server (backend):

```bash
cd server
npm install
# set environment variables (see "Environment variables" below)
npm start
# or: node server.js (depending on package.json scripts)
```

Run both in parallel (two terminals) during development.

## Environment variables

You may need to provide the following environment variables for the server (create a `.env` in `server/`):

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret used for signing authentication tokens
- `PORT` — optional, defaults to 5000 if not provided

For the client, check `client/src/auth_config.js` or `client/.env` for any auth/provider-specific variables (Auth0, etc.).

## Project structure (top-level)

```
client/
	├─ src/                 # React source
	├─ package.json
server/
	├─ models/              # Mongoose models (user, meal)
	├─ routes/              # Express routes (users, meals)
	├─ server.js
README.md
.gitignore
```

## Assets

The project logo is included at `client/src/assets/cosmic_logo.png`. When publishing to GitHub, the image path in this README is relative and should display on the repo page.

## Development notes

- The frontend is built with Vite + React and uses Tailwind CSS.
- The backend uses Express and Mongoose. Check `server/models` for schemas and `server/routes` for endpoints.
- Protected API routes require a valid JWT — see `server/middleware/auth.js`.

## Contributing

Feel free to open issues or PRs. For local contributions:

1. Create a feature branch: `git checkout -b feat/some-feature`
2. Make your changes and include tests if applicable
3. Commit and push your branch, then open a PR

## License

This project does not include a license file. Add a `LICENSE` if you want an open-source license.

----
If you want, I can also:

- Add a small `LICENSE` file (MIT by default).
- Create a GitHub repo and push the current repo for you (need remote URL or `gh` authenticated here).
