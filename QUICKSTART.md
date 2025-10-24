# Quick Start Guide - התחלה מהירה

## English

### 1. Install Dependencies
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Set up API Key
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### 3. Run the Application
```bash
python3 run.py
```

### 4. Open in Browser
Navigate to: http://localhost:8080/unified.html

---

## עברית

### 1. התקן תלויות
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. הגדר API Key
```bash
cp .env.example .env
# ערוך את קובץ .env והוסף את ה-OpenAI API key שלך
```

### 3. הרץ את האפליקציה
```bash
python3 run.py
```

### 4. פתח בדפדפן
נווט לכתובת: http://localhost:8080/unified.html

---

## Project Structure

```
pharmacy-assistant/
├── src/
│   ├── backend/              # Python Backend
│   │   ├── api/             # Flask API routes
│   │   ├── services/        # Business logic
│   │   └── config/          # Configuration & prompts
│   └── frontend/            # Frontend assets
│       ├── public/          # HTML pages
│       └── assets/          # JS, CSS files
├── run.py                   # Main launcher
└── requirements.txt         # Python dependencies
```

## Key Files

- **run.py** - Start the application
- **src/backend/api/server.py** - Flask server with all routes
- **src/backend/services/pharmacy_service.py** - Medication database (16 medications)
- **src/backend/services/openai_service.py** - OpenAI API integration
- **src/frontend/public/unified.html** - Main user interface
- **src/frontend/assets/js/unified-client.js** - Frontend logic

## API Endpoints

- `GET /` - Landing page
- `GET /unified.html` - Main unified interface
- `POST /chat` - Chat with AI
- `GET /health` - Health check
- `GET /api` - API information

## Development Tips

1. **Add new medication**: Edit `src/backend/services/pharmacy_service.py`
2. **Change AI behavior**: Edit `src/backend/config/prompts/system-prompt.txt`
3. **Modify UI**: Edit `src/frontend/public/unified.html` and `src/frontend/assets/css/styles.css`
4. **Change frontend logic**: Edit `src/frontend/assets/js/unified-client.js`

## Troubleshooting

**Port 8080 already in use?**
```bash
lsof -ti:8080 | xargs kill -9
```

**Module not found errors?**
```bash
# Make sure you're in the project root directory
# and virtual environment is activated
source .venv/bin/activate
```

**OpenAI API errors?**
- Check that `.env` file exists and has valid `OPENAI_API_KEY`
- Ensure you have credits in your OpenAI account

---

**Need Help?** Check the full [README.md](README.md) for detailed documentation.
