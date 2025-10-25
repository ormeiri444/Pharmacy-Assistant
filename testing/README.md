
# 🧪 Pharmacy Assistant AI - Testing System

מערכת בדיקה אוטומטית לעוזר הרוקח AI שמשתמשת ב-LLM נוסף כדי להעריך את איכות התשובות.

## 📋 תוכן עניינים

- [סקירה כללית](#סקירה-כללית)
- [התקנה](#התקנה)
- [שימוש](#שימוש)
- [מבנה הקבצים](#מבנה-הקבצים)
- [הוספת בדיקות חדשות](#הוספת-בדיקות-חדשות)
- [הבנת התוצאות](#הבנת-התוצאות)

## 🎯 סקירה כללית

מערכת הבדיקה כוללת:

1. **Test Evaluator LLM** - LLM מומחה שמעריך תשובות לפי קריטריונים מוגדרים
2. **Test Runner** - מריץ בדיקות ומנהל את התהליך
3. **Test Definitions** - הגדרות בדיקות מבוססות על `conversation-test-suite.md`
4. **Scoring System** - מערכת ניקוד 0-1 עם ניתוח סמנטי

### איך זה עובד?

```
┌─────────────────┐
│  User Message   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Pharmacy AI     │ ◄── Your LLM being tested
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Response +     │
│  Tool Calls     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Test Evaluator  │ ◄── Evaluator LLM
│      LLM        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Score (0-1) +   │
│ Detailed Report │
└─────────────────┘
```

## 🔧 התקנה

1. וודא שיש לך Python 3.8+ מותקן
2. התקן את הדרישות:
```bash
pip install -r requirements.txt
```

3. הגדר את ה-API key:
```bash
export OPENAI_API_KEY='your-api-key-here'
```

או צור קובץ `.env`:
```
OPENAI_API_KEY=your-api-key-here
```

## 🚀 שימוש

### הרצת בדיקה בודדת

```bash
cd testing
python3 test_runner.py
```

זה ירוץ את הבדיקה לדוגמה (Test 1.1) ויציג תוצאות מפורטות.

### הרצת כל הבדיקות

```bash
cd testing
python3 run_all_tests.py
```

זה ירוץ את כל הבדיקות מ-`test_definitions.py` ויצור דוח מקיף.

### הרצת בדיקה ספציפית

```python
from test_runner import TestRunner
from test_definitions import TEST_1_1

runner = TestRunner()
result = runner.run_test(
    test_name=TEST_1_1['name'],
    user_message=TEST_1_1['user_message'],
    expected_result=TEST_1_1['expected_result'],
    checks=TEST_1_1['checks']
)
```

## 📁 מבנה הקבצים

```
testing/
├── README.md                          # מסמך זה
├── conversation-test-suite.md         # מסמך הבדיקות המקורי
├── test_evaluator_prompt.txt          # System prompt למעריך
├── test_runner.py                     # מנוע הרצת הבדיקות
├── test_definitions.py                # הגדרות הבדיקות
├── run_all_tests.py                   # סקריפט להרצת כל הבדיקות
├── test_results.json                  # תוצאות בדיקה בודדת
└── full_test_results.json             # תוצאות כל הבדיקות
```

### test_evaluator_prompt.txt

System prompt שמגדיר איך ה-LLM המעריך צריך להעריך תשובות. כולל:
- קריטריונים להערכה
- מערכת ניקוד
- פורמט פלט JSON
- דוגמאות

### test_runner.py

מכיל שני מחלקות עיקריות:
- `TestEvaluator` - מנהל את ה-LLM המעריך
- `TestRunner` - מריץ בדיקות ומנהל תוצאות

### test_definitions.py

מכיל הגדרות בדיקות מבוססות על `conversation-test-suite.md`:
- `TEST_1_1`, `TEST_1_2` וכו' - בדיקות בודדות
- `ALL_TESTS` - מאורגן לפי קטגוריות
- `ALL_TESTS_LIST` - רשימה שטוחה של כל הבדיקות

## ➕ הוספת בדיקות חדשות

### 1. הוסף הגדרת בדיקה ל-`test_definitions.py`

```python
TEST_NEW = {
    'name': 'Test X.Y: שם הבדיקה',
    'category': 'קטגוריה',
    'user_message': 'מה המשתמש אומר',
    'expected_result': {
        'tool_calls': ['get_medication_by_name'],  # או [] אם לא צריך
        'parameters': {'name': 'נורופן'},
        'response_should_include': [
            'מילה1',
            'מילה2'
        ],
        'should_not_include': ['מילה אסורה']
    },
    'checks': [
        {
            'name': 'שם הבדיקה',
            'type': 'tool_call',  # או 'content', 'behavior', 'language'
            'expected': '✅',  # או '❌'
            'description': 'מה צריך לקרות'
        }
    ]
}
```

### 2. הוסף לרשימת הבדיקות

```python
ALL_TESTS_LIST.append(TEST_NEW)
```

### 3. הרץ את הבדיקה

```bash
python3 run_all_tests.py
```

## 📊 הבנת התוצאות

### מבנה תוצאה

כל בדיקה מחזירה JSON עם:

```json
{
  "test_name": "שם הבדיקה",
  "overall_score": 0.85,
  "checks": [
    {
      "name": "קריאה לכלי נכון",
      "expected": "✅",
      "actual": "✅",
      "passed": true,
      "score": 1.0,
      "details": "פירוט"
    }
  ],
  "semantic_analysis": {
    "coverage": 0.9,
    "accuracy": 0.85,
    "completeness": 0.8,
    "explanation": "הסבר"
  },
  "summary": "סיכום התוצאה",
  "recommendations": ["המלצה 1", "המלצה 2"]
}
```

### מערכת הניקוד

- **1.0** = מושלם ✅
- **0.75-0.99** = טוב מאוד ⭐
- **0.5-0.74** = סביר ⚠️
- **0.25-0.49** = חלש ⚠️
- **0.0-0.24** = כשל ❌

### ניתוח סמנטי

המערכת בודקת:
- **Coverage** - כיסוי של כל הנקודות הנדרשות
- **Accuracy** - דיוק המידע
- **Completeness** - שלמות התשובה

## 🎯 דוגמה מלאה

### קוד

```python
from test_runner import TestRunner

runner = TestRunner()

result = runner.run_test(
    test_name="Test 1.1: שאלה פשוטה - מידע על תרופה",
    user_message="ספר לי על נורופן",
    expected_result={
        'tool_calls': ['get_medication_by_name'],
        'response_should_include': [
            'איבופרופן',
            '200/400 מ"ג',
            'כל 6-8 שעות'
        ]
    },
    checks=[
        {
            'name': 'קריאה לכלי נכון',
            'type': 'tool_call',
            'expected': '✅'
        }
    ]
)

print(f"Score: {result['evaluation']['overall_score']}")
```

### פלט

```
============================================================
Running: Test 1.1: שאלה פשוטה - מידע על תרופה
============================================================
User: ספר לי על נורופן