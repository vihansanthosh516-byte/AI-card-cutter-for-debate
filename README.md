# iClusion Card Cutter ⚡

An elite, professional AI debate card cutter featuring a split-pane workspace, automatic citation scraper, dynamic color themes, local history persistence, and a Microsoft Word / Verbatim compatible formatting copy engine.

## Project Structure

```text
ai-debate-card-cutter/
├── backend/               # Node.js Express server
│   ├── .env               # Server environment variables
│   ├── server.js          # Core Express runtime & scraping logic
│   └── package.json       # Backend dependencies (express, cheerio, openai, etc.)
└── frontend/              # Vite + React + Tailwind CSS v4 client
    ├── index.html         # Main entry point with Google Fonts (Outfit, Playfair Display)
    ├── vite.config.js     # Vite dev server and plugin loading
    ├── package.json       # React, Lucide Icons, and Tailwind dev dependencies
    └── src/
        ├── main.jsx       # React bootstrap
        ├── App.jsx        # Navigation, modal key controls, and rich clipboard logic
        ├── index.css      # Core styles & MS Word background-color overrides
        └── components/
            ├── Workspace.jsx # Input forms, metric counters, and live preview pane
            └── History.jsx   # Browser localStorage cache and log retriever
```

---

## Quick Start Guide

### Step 1: Open the Project in your IDE
Open your terminal or IDE and set the active workspace to this folder:
`C:\Users\vihan\.gemini\antigravity-ide\scratch\ai-debate-card-cutter`

### Step 2: Configure your API Key
Open `backend/.env` and replace `nvapi-YOUR_KEY_HERE` with your actual NVIDIA NGC API key:
```env
PORT=5000
NVIDIA_NGC_API_KEY=nvapi-XXXXXX
```
*Note: You can also dynamically paste your key directly in the web app UI by clicking the "Configure Key" widget in the top right. This stores the key in your browser's session.*

### Step 3: Run the Backend Server
Open a terminal, navigate to the `backend` folder, install the modules, and boot:
```bash
cd backend
npm install
npm start
```
The server will start listening on `http://localhost:5000`.

### Step 4: Run the Frontend Client
Open a second terminal window, navigate to the `frontend` folder, install the modules, and boot the development server:
```bash
cd ../frontend
npm install
npm run dev
```
The client server will spin up and run on `http://localhost:3000`. Open this address in your browser!

---

## Advanced Features Implemented

1. **Exact Character Retention:** The LLM prompt is engineered to process evidence using a 0.1 low-temperature Llama 3.1 70B NIM model. It wraps relevant text in `<u>` (underline) and key words in `<mark>` (highlight) tags without changing a single punctuation or spelling character.
2. **Metadata Scraper:** When you enter a Source URL, the backend fetches the site and uses `cheerio` to extract the `og:title`, authors, site name, and published date, generating a citation block instantly: `[Author, Date, "Title", Site, URL, accessed AccessDate]//clusion`.
3. **Microsoft Word / Verbatim Copying:** The copy button uses the modern Clipboard API to compile a styled document wrapper. It converts CSS highlight rules into inline CSS background colors and sizes, preserving underlines, highlights (green/blue/yellow), and fonts when pasted into Microsoft Word.
4. **Local History Persistence:** Uses browser `localStorage` to save all card cuts locally so they remain cached across browser sessions.
