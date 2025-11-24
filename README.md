# Big Dawg Habit Tracker

A mobile-optimized habit tracking app with a dog mascot, editorial design, and LLM integration.

## Project Structure

- `client/`: React + Vite + Tailwind frontend
- `server/`: Node + Express + Prisma backend

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd big-dawg
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Update .env with your DATABASE_URL and OPENAI_API_KEY
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Access the App**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3000`

## Deployment (Render)

### Database (PostgreSQL)
1. Create a new PostgreSQL database on Render.
2. Copy the `Internal Database URL`.

### Backend (Web Service)
1. Create a new Web Service connected to your repo.
2. Root Directory: `server`
3. Build Command: `npm install && npx prisma generate && npm run build`
4. Start Command: `npm start`
5. Environment Variables:
   - `DATABASE_URL`: (Paste from above)
   - `JWT_SECRET`: (Generate a random string)
   - `OPENAI_API_KEY`: (Your OpenAI Key)

### Frontend (Static Site)
1. Create a new Static Site connected to your repo.
2. Root Directory: `client`
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Add Rewrite Rule:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

## Features
- **Auth**: Multi-user support with JWT.
- **Habits**: Create, track, and visualize habits.
- **Themes**: 4 dog-inspired themes (Golden, Dalmatian, Husky, Shiba).
- **Mascot**: Animated SVG dog that reacts to your progress.
- **AI**: Chat with your dog mascot for motivation.
