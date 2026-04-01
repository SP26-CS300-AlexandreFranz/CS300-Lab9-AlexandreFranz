# CS300 Lab 9 — Express API demo (SQLite + Sequelize)

This lab uses **Express**, **Sequelize** (ORM), **SQLite**, **bcrypt**, **JWT**, and **apidoc**. Follow the steps in order.

---

## Part A — Run the project (step by step)

### Step 1 — Install Node dependencies

From the project folder (`CS300-Lab9-DEMO`):

```bash
npm install
```

You need **Node.js 18+** (`node -v` to check).

---

### Step 2 — Create your `.env` file

Copy the example file:

**Windows (PowerShell or Command Prompt):**

```bash
copy .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Edit **`.env`** so it contains at least:

```env
PORT=3000
JWT_SECRET=replace-with-a-long-random-string-at-least-32-chars
JWT_EXPIRES_IN=8h
```

- **`JWT_SECRET`** signs login tokens. Use a long random string (not the word `password`). If you skip this, the server uses a weak default only for local testing and prints a warning.
- **`PORT`** is optional (defaults to `3000`).

---

### Step 3 — Start the API

```bash
npm start
```

You should see something like: `API listening on http://localhost:3000`

Optional — auto-restart on file changes (Node 18+):

```bash
npm run dev
```

---

### Step 4 — Test the API with HTTP requests

Base URL: **`http://localhost:3000`**

#### 4a — Register a new user

**curl** (one line; works in Git Bash, macOS, Linux):

```bash
curl -s -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"student@example.com\",\"password\":\"mypass123\"}"
```

**Windows Command Prompt** — same URL and JSON; if quoting fails, use PowerShell below or Postman.

**PowerShell (`Invoke-RestMethod`):**

```powershell
$body = '{"email":"student@example.com","password":"mypass123"}'
Invoke-RestMethod -Uri http://localhost:3000/api/auth/register -Method POST -Body $body -ContentType "application/json"
```

Expected: **`201`** with JSON like `{ "user": { "id": ..., "email": "..." } }`.

---

#### 4b — Log in and get a JWT

**curl:**

```bash
curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"student@example.com\",\"password\":\"mypass123\"}"
```

**PowerShell:**

```powershell
$body = '{"email":"student@example.com","password":"mypass123"}'
$r = Invoke-RestMethod -Uri http://localhost:3000/api/auth/login -Method POST -Body $body -ContentType "application/json"
$r.token
```

Expected: **`200`** with **`token`** and **`user`**. Copy the **`token`** string for the next step.

---

#### 4c — List entries (protected — needs Bearer token)

Replace **`YOUR_JWT_HERE`** with the token from login.

**curl:**

```bash
curl -s http://localhost:3000/api/entries -H "Authorization: Bearer YOUR_JWT_HERE"
```

**PowerShell:**

```powershell
$token = "YOUR_JWT_HERE"
Invoke-RestMethod -Uri http://localhost:3000/api/entries -Headers @{ Authorization = "Bearer $token" }
```

Expected: **`200`** with `{ "entries": [ ... ] }`. Without a valid token you get **`401`**.

---

#### 4d — Demo accounts (if the DB was seeded)

On first run with an **empty** database, `src/server.js` creates seed users:

| Email             | Password      |
|-------------------|---------------|
| `alice@lab.local` | `password123` |
| `bob@lab.local`   | `password123` |

Use **`POST /api/auth/login`** with those credentials the same way as in **4b**. Each user only sees **their own** rows from **`GET /api/entries`**.

To reset the database: stop the server, delete **`database.sqlite`** in the project root, start again (you will lose local data).

---

### Step 5 — Generate API documentation (HTML)

```bash
npm run apidoc
```

Open **`docs/apidoc/index.html`** in a browser. After you add or change **`@api`** comments in `src/`, run this command again.

---

## Part B — What you implement (with code to start from)

The routes already work. Your job is to **finish apidoc comments** and **add a second middleware**, as marked by **`TODO`** in the repo.

---

### Task 1 — Document errors for `POST /api/auth/register` and `POST /api/auth/login`

**File:** `src/routes/auth.js`

There is a **`TODO`** near the top. **Above** each `router.post(...)` handler (or inside the existing `/** ... */` block, as your instructor prefers), add **`@apiError`** and **`@apiErrorExample`** lines that match what the code actually returns.

The handlers return JSON like:

- **400** — `{ "error": "email and password are required" }` (missing fields)
- **401** — `{ "error": "Invalid credentials" }` (login only)
- **409** — `{ "error": "Email already registered" }` (register, duplicate email)

**Example pattern you can copy and adapt** (register — add under the existing `@apiSuccessExample` in the register block, before the closing ` */`):

```js
 * @apiError (400) {Object} body Missing email or password.
 * @apiErrorExample {json} Validation
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "email and password are required"
 *     }
 *
 * @apiError (409) {Object} body Email already exists.
 * @apiErrorExample {json} Duplicate
 *     HTTP/1.1 409 Conflict
 *     {
 *       "error": "Email already registered"
 *     }
```

**Login** — similar blocks for **400** and **401** (`Invalid credentials`).

Then run:

```bash
npm run apidoc
```

and refresh **`docs/apidoc/index.html`**.

---

### Task 2 — Full apidoc for `GET /api/entries`

**File:** `src/routes/entries.js`

Replace the **`TODO`** comment with a full **`/** ... */`** block **immediately above** `router.get("/", ...)`.

**Starter template** (adjust names/descriptions to match your course):

```js
/**
 * @api {get} /api/entries List my entries
 * @apiName ListEntries
 * @apiGroup Entries
 * @apiDescription Returns journal entries for the authenticated user. Requires a valid JWT from POST /api/auth/login.
 *
 * @apiHeader {String} Authorization Bearer access token (format: `Bearer <jwt>`).
 *
 * @apiSuccess {Object[]} entries List of entry objects.
 * @apiSuccess {Number} entries.id
 * @apiSuccess {String} entries.title
 * @apiSuccess {String} entries.body
 * @apiSuccess {String} entries.createdAt ISO timestamp.
 * @apiSuccessExample {json} Success
 *     HTTP/1.1 200 OK
 *     {
 *       "entries": [
 *         { "id": 1, "title": "Note", "body": "Text", "createdAt": "..." }
 *       ]
 *     }
 *
 * @apiError (401) {Object} body Missing, invalid, or expired token.
 * @apiErrorExample {json} Unauthorized
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "Missing or invalid Authorization header"
 *     }
 */
```

Run **`npm run apidoc`** again.

---

### Task 3 — Add a second middleware and wire it in `app.js`

**File:** `src/middleware/requestLogger.js` — read the **`TODO`**: implement **another** middleware (separate function), e.g. add a **`X-Request-Id`** header on every response.

**Example new file** `src/middleware/requestId.js`:

```js
const { randomUUID } = require("crypto");

function requestId(req, res, next) {
  const id = randomUUID();
  res.setHeader("X-Request-Id", id);
  req.id = id;
  next();
}

module.exports = { requestId };
```

**File:** `src/app.js` — import it and run it **after** `requestLogger` (order matters):

```js
const { requestLogger } = require("./middleware/requestLogger");
const { requestId } = require("./middleware/requestId");

// ...

app.use(requestLogger);
app.use(requestId);
```

You may use a different idea (rate limiting, security headers, etc.) as long as you **`export`** a function `(req, res, next)` and call **`next()`** when the request should continue.

---

## Part C — How the files relate (reference)

```
CS300-Lab9-DEMO/
├── apidoc.json              # apidoc title / version / base URL
├── .env                     # You create this (secrets — not committed)
├── database.sqlite          # SQLite file (created when you run the server)
├── docs/apidoc/             # Generated HTML (after `npm run apidoc`)
└── src/
    ├── server.js            # Starts DB sync, seed, HTTP server
    ├── app.js               # Global middleware + mounts routes
    ├── config/database.js   # Sequelize + SQLite path
    ├── models/index.js      # User, Entry, associations
    ├── middleware/auth.js   # requireAuth (JWT)
    ├── middleware/requestLogger.js
    ├── routes/auth.js       # POST /register, POST /login
    └── routes/entries.js    # GET /  → GET /api/entries
```

**Request flow:**

1. **`server.js`** → loads **`app.js`**, **`sequelize.sync()`**, seed, **`listen`**.
2. Request hits **`app.js`** → **`express.json()`** → **`requestLogger`** → (your second middleware) → router.
3. **`/api/entries`** → **`requireAuth`** reads **`Authorization: Bearer ...`**, sets **`req.userId`**, then handler queries **`Entry`** for that user.

---

## Scripts

| Command        | What it does                    |
|----------------|---------------------------------|
| `npm start`    | Run `src/server.js`             |
| `npm run dev`  | Same with `node --watch`       |
| `npm run apidoc` | Build `docs/apidoc/` from `src/` |

---

## Troubleshooting

| Issue | What to try |
|--------|-------------|
| `JWT_SECRET` warning | Add **`JWT_SECRET`** to **`.env`**. |
| Port in use | Change **`PORT`** in **`.env`** or stop the other process. |
| apidoc missing routes | **`@api`** blocks must sit **directly above** `router.get` / `router.post`. Re-run **`npm run apidoc`**. |
| Wrong or old data | Delete **`database.sqlite`**, restart (resets seed). |

---

## Summary checklist

1. **`npm install`** → **`.env`** from **`.env.example`** → **`npm start`**
2. Test **register → login → GET /api/entries** with Bearer token
3. **`npm run apidoc`** → open **`docs/apidoc/index.html`**
4. Complete **apidoc** in **`auth.js`** (errors) and **`entries.js`** (full GET doc)
5. Add **second middleware** + **`app.use`** in **`app.js`**

Submit per your course instructions.
