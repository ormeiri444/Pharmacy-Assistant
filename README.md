# 🏥 Pharmacy Assistant AI - עוזר רוקח AI

עוזר רוקח AI מבוסס בינה מלאכותית לרשת בתי מרקחת. המערכת מספקת מידע עובדתי על תרופות דרך ממשק מאוחד הכולל אפשרויות צ'אט וקול.

## 📋 תוכן עניינים

- [סקירה כללית](#סקירה-כללית)
- [תכונות](#תכונות)
- [ארכיטקטורה](#ארכיטקטורה)
- [התקנה](#התקנה)
- [הרצה](#הרצה)
- [שימוש](#שימוש)

## 🎯 סקירה כללית

עוזר רוקח AI הוא אפליקציית ווב המספקת מידע עובדתי על תרופות דרך ממשק מאוחד:
- **ממשק מאוחד (Unified)**: ממשק גמיש - כתוב או דבר, קבל תשובות בטקסט ובקול תמיד ✨

### מה המערכת יכולה לעשות ✅

- לספק מידע עובדתי על תרופות
- להסביר הוראות מינון ושימוש
- לאשר דרישות מרשם
- לבדוק זמינות במלאי
- לזהות מרכיבים פעילים
- להציע תחליפים זמינים

### מה המערכת לא עושה ❌

- לא נותנת ייעוץ רפואי
- לא מעודדת רכישה
- לא מבצעת אבחון
- לא ממליצה על טיפול רפואי

## 🚀 תכונות

### ממשק מאוחד ⭐
- **קלט גמיש**: כתוב או דבר - בחר מה שנוח לך
- **פלט כפול**: תשובות מוצגות תמיד בטקסט ונשמעות בקול
- **הצגת פונקציות**: כל קריאות הפונקציות מוצגות inline עם Input/Output מפורט
- **מצב מפתח**: הצגה מפורטת של כל השיחה הטכנית עם ה-AI
- **שליטה באודיו**: כפתור להשתקה/הפעלה של הקראת הקול
- **זיהוי דיבור**: שימוש ב-Web Speech API לזיהוי דיבור בעברית
- **סינתזת דיבור**: הקראת תשובות בקול בעברית באמצעות Web Speech Synthesis

### כלים (Tools/Functions)

1. **get_medication_by_name** - קבלת מידע מלא על תרופה
2. **search_medications_by_ingredient** - חיפוש תרופות לפי מרכיב פעיל
3. **check_prescription_requirement** - בדיקת דרישת מרשם
4. **get_alternative_medications** - מציאת תחליפים זמינים

## 🏗️ ארכיטקטורה

```
pharmacy-assistant/
├── src/
│   ├── backend/                      # Python Backend
│   │   ├── api/                      # API Layer
│   │   │   ├── __init__.py
│   │   │   └── server.py             # Flask server (main entry point)
│   │   ├── services/                 # Business Logic
│   │   │   ├── __init__.py
│   │   │   ├── openai_service.py     # OpenAI API integration
│   │   │   └── pharmacy_service.py   # Pharmacy database & tools
│   │   ├── config/                   # Configuration
│   │   │   ├── __init__.py
│   │   │   └── prompts/              # AI prompts & function definitions
│   │   │       ├── system-prompt.txt
│   │   │       └── function-definitions.json
│   │   └── __init__.py
│   └── frontend/                     # Frontend
│       ├── public/                   # HTML pages
│       │   ├── index.html            # Landing page
│       │   └── unified.html          # Main unified interface
│       └── assets/                   # Static assets
│           ├── js/                   # JavaScript files
│           │   ├── unified-client.js # Client logic for unified interface
│           │   └── mock-api.js       # Frontend medication database
│           └── css/                  # Stylesheets
│               └── styles.css        # Main styles (RTL-aware)
├── run.py                            # Application launcher script
├── requirements.txt                  # Python dependencies
├── .env                              # Environment variables (git-ignored)
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
└── README.md                         # This file
```

### ארכיטקטורת Backend

```
┌─────────────────────────────┐
│      API Layer (api/)       │
│  - server.py (Flask routes) │
│  - Handles HTTP requests    │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Services Layer (services/) │
│  - openai_service.py        │
│  - pharmacy_service.py      │
│  - Business logic           │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│   Config Layer (config/)    │
│  - System prompts           │
│  - Function definitions     │
└─────────────────────────────┘
```

### ארכיטקטורת Frontend

```
┌─────────────────────────────┐
│    Public Pages (public/)   │
│  - index.html (landing)     │
│  - unified.html (main app)  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│    Assets (assets/)         │
│  - JavaScript (js/)         │
│  - Stylesheets (css/)       │
└─────────────────────────────┘
```

## 📦 התקנה

### דרישות מקדימות

- Python 3.8+
- OpenAI API Key
- דפדפן מודרני (Chrome, Firefox, Safari, Edge) עם תמיכה ב-Web Speech API

### שלבי התקנה

1. **Clone הפרויקט:**
```bash
git clone <repository-url>
cd pharmacy-assistant
```

2. **צור סביבה וירטואלית:**
```bash
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# או
.venv\Scripts\activate  # Windows
```

3. **התקן תלויות:**
```bash
pip install -r requirements.txt
```

4. **הגדר משתני סביבה:**
```bash
cp .env.example .env
```
ערוך את הקובץ `.env` והכנס את ה-API key שלך:
```
OPENAI_API_KEY=sk-your-api-key-here
```

## 🚀 הרצה

### התחלה מהירה

פשוט הרץ את סקריפט ההפעלה:

```bash
python3 run.py
```

השרת יעלה ויהיה זמין בכתובות הבאות:
- **דף הבית**: http://localhost:8080/
- **ממשק מאוחד**: http://localhost:8080/unified.html
- **Health Check**: http://localhost:8080/health

### הרצה ידנית (אופציונלי)

אם אתה רוצה להריץ את השרת ידנית:

```bash
cd src/backend
python3 -m api.server
```

### עצירת השרת

לחץ `Ctrl+C` בטרמינל כדי לעצור את השרת.

## 💡 שימוש

### ממשק מאוחד (Unified Interface)

1. פתח את הדפדפן בכתובת: http://localhost:8080/unified.html
2. בחר את אופן התקשורת:
   - **כתיבה**: הקלד שאלה בשדה הטקסט ולחץ "שלח"
   - **דיבור**: לחץ על כפתור המיקרופון 🎤 ודבר בעברית
3. התגובה תוצג בטקסט ותושמע בקול
4. כפתורי שליטה:
   - 🔧 **מצב מפתח**: הצגת פרטים טכניים
   - 🔊/🔇 **אודיו**: השתקה/הפעלה של הקראת קול
   - 🗑️ **ניקוי**: מחיקת השיחה והתחלה מחדש

### דוגמאות לשאלות

#### מידע על תרופה
```
"מה זה נורופן?"
"ספר לי על אקמול"
```

#### בדיקת מלאי
```
"יש לכם נורופן במלאי?"
"נורופן 400 זמין?"
```

#### חיפוש לפי מרכיב
```
"אילו תרופות יש עם איבופרופן?"
"מה יש עם פרצטמול?"
```

#### דרישת מרשם
```
"האם ונטולין דורש מרשם?"
"נורופן צריך מרשם?"
```

#### חיפוש תחליפים
```
"מה התחליף לאופטלגין?"
"יש תחליף לנורופן?"
```

## 🔧 API Endpoints

### POST /chat
שליחת הודעות צ'אט ל-AI

**Request Body:**
```json
{
  "messages": [
    {"role": "user", "content": "יש לכם נורופן?"}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "כן, נורופן זמין במלאי שלנו...",
  "tool_calls": [
    {
      "name": "get_medication_by_name",
      "arguments": {"name": "נורופן"},
      "result": {...}
    }
  ]
}
```

### GET /health
בדיקת תקינות השרת

**Response:**
```json
{
  "status": "ok"
}
```

### GET /api
מידע על ה-API

**Response:**
```json
{
  "name": "Pharmacy Assistant Chat API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {...}
}
```

## 🧪 פיתוח

### מבנה קוד מומלץ

- **Backend Services**: כל לוגיקה עסקית ב-`src/backend/services/`
- **API Routes**: נתיבי HTTP ב-`src/backend/api/`
- **Config**: הגדרות ופרומפטים ב-`src/backend/config/`
- **Frontend**: HTML, CSS, JS ב-`src/frontend/`

### הוספת תרופה חדשה

ערוך את `src/backend/services/pharmacy_service.py` והוסף אובייקט ל-`MEDICATIONS_DB`:

```python
{
    "name_he": "שם התרופה בעברית",
    "name_en": "English Name",
    "active_ingredient": "מרכיב פעיל",
    "strength_mg": [100, 200],
    "instructions_dosage": "הוראות שימוש...",
    "in_stock": True,
    "requires_prescription": False,
    "category": "קטגוריה",
    "warnings": "אזהרות..."
}
```

### שינוי התנהגות AI

ערוך את `src/backend/config/prompts/system-prompt.txt` לשינוי ההתנהגות והטון של ה-AI.

## 📝 רישיון

פרויקט זה הוא לצרכי הדגמה בלבד. אין להשתמש בו לצורך ייעוץ רפואי אמיתי ללא אישור מקצועי.

## ⚠️ אזהרות חשובות

- המערכת מספקת **מידע עובדתי בלבד** ואינה מחליפה ייעוץ רפואי מקצועי
- לייעוץ רפואי פנה תמיד לרוקח או רופא מוסמך
- מאגר התרופות הוא mock (הדגמה) ואינו מייצג מלאי אמיתי
- אין להשתמש במערכת זו לקבלת החלטות רפואיות

## 🙋 תמיכה

לשאלות או בעיות, פתח Issue בריפוזיטורי או צור קשר עם מפתח הפרויקט.

---

**Built with ❤️ using Flask, OpenAI API, and Web Speech API**
