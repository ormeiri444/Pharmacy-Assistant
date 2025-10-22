# 🏥 Pharmacy Assistant AI - עוזר רוקח AI

עוזר רוקח AI מבוסס בינה מלאכותית לרשת בתי מרקחת. המערכת מספקת מידע עובדתי על תרופות דרך ממשקי צ'אט וקול.

## 📋 תוכן עניינים

- [סקירה כללית](#סקירה-כללית)
- [תכונות](#תכונות)
- [ארכיטקטורה](#ארכיטקטורה)
- [התקנה](#התקנה)
- [הרצה](#הרצה)
- [שימוש](#שימוש)
- [תיעוד](#תיעוד)
- [בדיקות](#בדיקות)

## 🎯 סקירה כללית

עוזר רוקח AI הוא אפליקציית ווב המספקת מידע עובדתי על תרופות דרך שני ערוצים:
- **צ'אט (Chat)**: ממשק טקסט מפורט עם OpenAI API
- **קולי (Voice)**: ממשק קולי טבעי עם OpenAI Realtime API

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

### ערוץ צ'אט
- תשובות מפורטות ומובנות
- מצב מפתח (Developer Mode) להצגת קריאות כלים
- היסטוריית שיחה
- תמיכה מלאה ב-RTL ועברית

### ערוץ קולי
- שיחה טבעית עם AI
- תמלול בזמן אמת
- תשובות תמציתיות ושיחתיות
- תמיכה בעברית

### כלים (Tools/Functions)

1. **get_medication_by_name** - קבלת מידע מלא על תרופה
2. **search_medications_by_ingredient** - חיפוש תרופות לפי מרכיב פעיל
3. **check_prescription_requirement** - בדיקת דרישת מרשם
4. **get_alternative_medications** - מציאת תחליפים זמינים

## 🏗️ ארכיטקטורה

```
pharmacy-assistant/
├── backend/                    # Python backend
│   ├── chat_server.py         # Flask server לצ'אט
│   ├── openai_client.py       # לקוח OpenAI API
│   └── mock_pharmacy_api.py   # Mock API של בית המרקחת
├── frontend/                   # Frontend
│   ├── index.html             # דף נחיתה
│   ├── chat.html              # ממשק צ'אט
│   ├── voice.html             # ממשק קולי
│   ├── css/
│   │   └── styles.css         # עיצוב
│   └── js/
│       ├── mock-api.js        # Mock API (JavaScript)
│       ├── chat-client.js     # לקוח צ'אט
│       └── voice-client.js    # לקוח קולי
├── prompts/                    # הגדרות AI
│   ├── system-prompt.txt      # System prompt
│   └── function-definitions.json  # הגדרות כלים
├── flows/                      # תיעוד תרחישים
│   ├── flow1-medication-info.md
│   ├── flow2-stock-check.md
│   └── flow3-ingredient-search.md
├── testing/                    # בדיקות
│   └── test-plan.md           # תוכנית בדיקות
└── requirements.txt            # תלויות Python
```

## 📦 התקנה

### דרישות מקדימות

- Python 3.8+
- pip
- מפתח API של OpenAI

### שלבי התקנה

1. **שכפול הפרויקט**
```bash
cd pharmacy-assistant
```

2. **התקנת תלויות Python**
```bash
pip install -r requirements.txt
```

3. **הגדרת מפתח API**
```bash
export OPENAI_API_KEY='your-api-key-here'
```

או צור קובץ `.env`:
```
OPENAI_API_KEY=your-api-key-here
```

## 🎮 הרצה

### הפעלת השרת

```bash
cd backend
python chat_server.py
```

השרת יעלה על `http://localhost:5001`

### פתיחת הממשק

פתח את `frontend/index.html` בדפדפן, או השתמש בשרת HTTP פשוט:

```bash
cd frontend
python -m http.server 8000
```

גש ל-`http://localhost:8000`

## 💡 שימוש

### ממשק צ'אט

1. פתח את `chat.html`
2. הקלד שאלה על תרופה
3. לחץ "שלח" או Enter
4. קבל תשובה מפורטת

**דוגמאות לשאלות:**
- "יש לכם נורופן במלאי?"
- "מה המרכיב הפעיל באקמול?"
- "אילו תרופות יש עם איבופרופן?"

### ממשק קולי

1. פתח את `voice.html`
2. לחץ "התחל שיחה"
3. דבר בבירור
4. קבל תשובה קולית

**טיפים:**
- דבר בבירור ובקצב נורמלי
- שאל שאלות ספציפיות
- המתן לתשובה לפני שאלה נוספת

### מצב מפתח (Developer Mode)

לחץ על 🔧 כדי לראות:
- קריאות כלים (TOOL CALL)
- תשובות כלים (TOOL RESPONSE)
- JSON מפורט

## 📚 תיעוד

### System Prompt

ה-System Prompt מגדיר את התנהגות ה-AI:
- תפקיד: עוזר רוקח
- מגבלות: ללא ייעוץ רפואי
- פרוטוקול שימוש בכלים
- התאמה לערוץ (Voice/Chat)

ראה: [`prompts/system-prompt.txt`](prompts/system-prompt.txt)

### הגדרות כלים

כל כלי מוגדר עם:
- שם ותיאור
- פרמטרים נדרשים ואופציונליים
- סכמת JSON

ראה: [`prompts/function-definitions.json`](prompts/function-definitions.json)

### תרחישי שימוש (Flows)

תיעוד מפורט של 3 תרחישים עיקריים:

1. **Flow 1**: שאלות מידע על תרופות
   - [`flows/flow1-medication-info.md`](flows/flow1-medication-info.md)

2. **Flow 2**: בדיקת מלאי והצעת תחליפים
   - [`flows/flow2-stock-check.md`](flows/flow2-stock-check.md)

3. **Flow 3**: חיפוש לפי מרכיב פעיל
   - [`flows/flow3-ingredient-search.md`](flows/flow3-ingredient-search.md)

## 🧪 בדיקות

### הרצת בדיקות Mock API

פתח את `test-mock-api.html` בדפדפן לבדיקת ה-Mock API.

### תוכנית בדיקות מקיפה

ראה [`testing/test-plan.md`](testing/test-plan.md) לתוכנית בדיקות מלאה עם:
- 40+ מקרי בדיקה
- בדיקות חיוביות ושליליות
- בדיקות Voice vs Chat
- בדיקות אבטחה ומדיניות

### מקרי בדיקה קריטיים

**חובה לעבור:**
- ✅ הפניה נכונה לייעוץ רפואי
- ✅ זיהוי תרופות
- ✅ הצעת תחליפים
- ✅ הבדל Voice/Chat

## 🔒 אבטחה ומדיניות

### עקרונות בטיחות

1. **אין ייעוץ רפואי** - המערכת מפנה תמיד לרופא/רוקח
2. **מידע עובדתי בלבד** - רק עובדות על תרופות
3. **שקיפות** - אם לא יודע, אומר זאת
4. **פרטיות** - לא מבקש מידע רפואי אישי

### דוגמאות להפניה

**שאלה:** "כואב לי הראש, מה לקחת?"
**תשובה:** "אני מצטער, אבל אני לא יכול להמליץ על תרופה ספציפית. זה דורש ייעוץ רפואי..."

## 🛠️ פיתוח

### הוספת תרופות חדשות

ערוך את `backend/mock_pharmacy_api.py`:

```python
{
    "name_he": "שם התרופה",
    "name_en": "Medication Name",
    "active_ingredient": "מרכיב פעיל",
    "strength_mg": [100, 200],
    "instructions_dosage": "הוראות...",
    "in_stock": True,
    "requires_prescription": False,
    "category": "קטגוריה",
    "warnings": "אזהרות..."
}
```

### שינוי System Prompt

ערוך את `prompts/system-prompt.txt` לשינוי התנהגות ה-AI.

### הוספת כלי חדש

1. הוסף פונקציה ב-`backend/mock_pharmacy_api.py`
2. הוסף הגדרה ב-`prompts/function-definitions.json`
3. עדכן את `execute_function()` ב-`mock_pharmacy_api.py`

## 📝 הערות חשובות

### Mock API

המערכת משתמשת ב-Mock API לצורכי הדגמה. בסביבת ייצור, יש להחליף ב-API אמיתי של בית המרקחת.

### OpenAI Realtime API

ממשק הקול דורש:
- מפתח API של OpenAI
- ספריית `@openai/agents` (JavaScript)
- תמיכה בדפדפן למיקרופון

### עברית ו-RTL

המערכת תומכת מלאה בעברית:
- כל הטקסטים בעברית
- כיוון RTL
- פונטים תומכי עברית

## 🤝 תרומה

זהו פרויקט הדגמה למשרת Agent Engineering Team Lead.

## 📄 רישיון

פרויקט הדגמה - כל הזכויות שמורות.

## 📞 יצירת קשר

לשאלות או הערות, אנא פנה למפתח הפרויקט.

---

**זכור:** מערכת זו מספקת מידע עובדתי בלבד ואינה מחליפה ייעוץ רפואי מקצועי.