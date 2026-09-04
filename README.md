# MEMORA — Digital Memory Sanctuary 🌌✨

MEMORA is a full-stack digital memory platform where people can privately preserve their personal memories and diary entries, as well as share memories, timelines, letters, commitments, agreements, and interactive memory games with loved ones and friends in an aesthetic, emotional, midnight-violet sanctuary.

---

## 🌟 Features Overview

1. **Authentication & Identity**
   - Secure registration & login with Bcrypt password hashing and JWT authentication.
   - Profile management with custom avatar upload, personal biography, and lifetime archive statistics.
   - Password updating and secure account deletion with full cascade cleanup.

2. **Cherished Memories**
   - Create, view, edit, and delete memories with title, story description, date, time, location, and mood tags.
   - Upload multiple photographs per memory (Cloudinary storage with automatic local disk fallback).
   - Filter by mood, tag, search query, date range, or privacy status (Private vs. Shared Space).

3. **Private Diary & Journal**
   - Intimate uncensored diary pages strictly private and encrypted to your account.
   - Dual view modes: **Rich List View** and **Interactive Monthly Calendar View**.
   - Attach photos, mood indicators, and tags to journal entries.

4. **Visual Milestone Timeline**
   - Chronological vertical timeline with glowing connection nodes.
   - Connect important personal life milestones or collaborative shared trips.

5. **Letters & Future Time Capsules**
   - **Letter to Myself**: Intimate personal reminders and thoughts to your future self.
   - **Letter to Another User**: Send direct letters to any registered MEMORA user with instant notification.
   - **Future Time Capsule**: Lock a letter until a specified future date. The backend strictly protects the content so it remains unread until the exact unlock date arrives!

6. **Commitments, Promises & Agreements**
   - Forge pacts, shared goals, or romantic promises between two or more registered users.
   - Full digital signature flow: Creator signs immediately, invitees can **Accept & Sign** or **Decline**.
   - Automatic activation: The commitment turns **ACTIVE** only when all participants have signed!
   - Mark commitments as fulfilled and honored.

7. **Shared Spaces**
   - Create collaborative private circles (e.g. Couples, Families, Travel Groups, Close Friends).
   - Invite registered users by username/email; invitees receive pending invitations to accept or decline.
   - Space members can post shared memories, shared timeline milestones, view member roles, and play games together.

8. **Memory Games & Trivia Vault**
   - **Game 1: How Well Do You Know Me?**: Custom and preset trivia questions with instant score tallying.
   - **Game 2: Memory Flashback Quiz**: Auto-generates quizzes dynamically from the dates, locations, and moods of your actual memories!
   - **Game 3: This or That (Memory Edition)**: Aesthetic pairwise preference dilemmas to compare sentimental tastes.
   - **Game 4: Spin the Memory Reel**: Random roulette that draws a memory from your archive and presents a thought-provoking reflection prompt.

9. **Notifications & Activity Feed**
   - Real-time notification badge and dropdown drawer for space invitations, commitment requests, and letters.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM v6, Axios, Lucide React icons, Canvas Confetti.
- **Backend**: Node.js, Express.js, Prisma ORM, JSON Web Tokens (JWT), Bcryptjs, Multer, Cloudinary SDK, CORS, Dotenv.
- **Database**: PostgreSQL (Prisma ORM, localhost port 5432).

---

## 📁 Project Structure

```
memora/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Button, Input, Modal, Badge, EmptyState, ProtectedRoute
│   │   │   └── layout/         # AppLayout, Navbar, Sidebar
│   │   ├── pages/
│   │   │   ├── auth/           # LoginPage, SignupPage
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── MemoriesPage.jsx
│   │   │   ├── DiaryPage.jsx
│   │   │   ├── TimelinePage.jsx
│   │   │   ├── LettersPage.jsx
│   │   │   ├── CommitmentsPage.jsx
│   │   │   ├── SharedSpacesPage.jsx
│   │   │   ├── GamesPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── context/            # AuthContext, NotificationContext
│   │   ├── services/           # Axios API client with auth interceptors
│   │   ├── utils/              # Date formatting, mood metadata, colors
│   │   ├── App.jsx             # Route definitions
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind & glassmorphism directives
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── .env
│
├── backend/
│   ├── controllers/            # auth, memory, diary, timeline, letter, commitment, space, game, notification, user
│   ├── routes/                 # Express REST route handlers
│   ├── middleware/             # authMiddleware, uploadMiddleware (multer), errorMiddleware
│   ├── services/               # cloudinaryService (with local uploads fallback)
│   ├── utils/                  # prisma singleton client, jwt helpers
│   ├── prisma/
│   │   └── schema.prisma       # Complete PostgreSQL relational schema
│   ├── uploads/                # Local uploaded assets directory
│   ├── server.js               # Express entrypoint
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher (tested on Node v24).
- **PostgreSQL**: Running locally on port 5432 with database `memora`.

---

### Step 1: Configure Environment Variables

#### Backend (`backend/.env`):

Create `backend/.env` (copy from `backend/.env.example`):

```env
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/memora?schema=public"

JWT_SECRET=memora_super_secret_jwt_key_98374982374982374982374
PORT=5000
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary credentials (If not configured, images safely save to backend/uploads/)
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

*Replace `YOUR_POSTGRES_PASSWORD` with your local PostgreSQL password for user `postgres`.*

#### Frontend (`frontend/.env`):

Create `frontend/.env` (copy from `frontend/.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

---

### Step 2: Backend Setup & Database Migration

Open a terminal in `backend/`:

```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

*The backend server will start on `http://localhost:5000`.*

---

### Step 3: Frontend Setup & Launch

Open a separate terminal in `frontend/`:

```powershell
cd frontend
npm install
npm run dev
```

*The Vite development server will start on `http://localhost:5173`.*

---

## 🔒 Security & Privacy Architecture

- **Bcrypt Password Hashing**: Passwords are never stored in plaintext.
- **JWT Authorization**: All private resources (`/api/memories`, `/api/diary`, `/api/letters`, etc.) require a valid Bearer token.
- **Data Isolation**: A user can never read, modify, or delete another user's private diary entries or private memories.
- **Time Capsule Sealing**: For future letters (`unlockDate > now()`), the backend redacts the letter content before sending it across the wire.
- **Digital Signatures**: Commitments store cryptographic timestamps and user references for every signer.
