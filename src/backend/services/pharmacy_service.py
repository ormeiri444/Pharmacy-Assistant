"""
Pharmacy Service - Mock medication database and function execution
Provides medication information for the Realtime API
"""

# Mock medication database
MEDICATIONS_DB = [
    {
        "name_he": "נורופן",
        "name_en": "Nurofen",
        "active_ingredient": "איבופרופן",
        "strength_mg": [200, 400],
        "instructions_dosage": "למבוגרים: 200-400 מ\"ג כל 4-6 שעות. מקסימום 1200 מ\"ג ביום.",
        "in_stock": True,
        "requires_prescription": False,
        "category": "משככי כאבים",
        "warnings": "אין ליטול על קיבה ריקה. אין לשלב עם אספירין."
    },
    {
        "name_he": "אקמול",
        "name_en": "Acamol",
        "active_ingredient": "פרצטמול",
        "strength_mg": [500, 1000],
        "instructions_dosage": "למבוגרים: 500-1000 מ\"ג כל 4-6 שעות. מקסימום 4000 מ\"ג ביום.",
        "in_stock": True,
        "requires_prescription": False,
        "category": "משככי כאבים",
        "warnings": "שימוש יתר עלול לגרום לנזק כבד. אין לשלב עם אלכוהול."
    },
    {
        "name_he": "ונטולין",
        "name_en": "Ventolin",
        "active_ingredient": "סלבוטמול",
        "strength_mg": [100],
        "instructions_dosage": "1-2 שאיפות לפי הצורך. מקסימום 8 שאיפות ביום.",
        "in_stock": True,
        "requires_prescription": True,
        "category": "תרופות נשימה",
        "warnings": "דורש מרשם רופא. לשימוש בהתקף אסתמה."
    },
    {
        "name_he": "אופטלגין",
        "name_en": "Optalgin",
        "active_ingredient": "מטמיזול",
        "strength_mg": [500],
        "instructions_dosage": "למבוגרים: 500 מ\"ג כל 6-8 שעות. מקסימום 2000 מ\"ג ביום.",
        "in_stock": False,
        "requires_prescription": True,
        "category": "משככי כאבים",
        "warnings": "דורש מרשם רופא. עלול לגרום לירידה בלחץ דם."
    }
]

# Mock user database
USERS_DB = {
    "123456789": {
        "name": "יוסי כהן",
        "verified": False,
        "prescriptions": [
            {
                "medication": "ונטולין",
                "dosage": "100 מק\"ג",
                "frequency": "לפי הצורך",
                "doctor": "ד\"ר שרה לוי",
                "date": "2024-01-15",
                "refills_remaining": 2
            }
        ],
        "drug_history": [
            {
                "medication": "אקמול",
                "date": "2024-01-10",
                "reason": "כאב ראש"
            },
            {
                "medication": "נורופן",
                "date": "2023-12-20",
                "reason": "כאבי שרירים"
            }
        ],
        "allergies": ["פניצילין", "אספירין"]
    }
}


def get_medication_by_name(name, strength_mg=None):
    """Get medication information by name"""
    name_lower = name.lower()
    
    for med in MEDICATIONS_DB:
        if (name_lower in med["name_he"].lower() or 
            name_lower in med["name_en"].lower()):
            
            result = med.copy()
            
            # Filter by strength if specified
            if strength_mg and strength_mg in med["strength_mg"]:
                result["strength_mg"] = [strength_mg]
            
            return {
                "success": True,
                "medication": result
            }
    
    return {
        "success": False,
        "error": f"לא נמצאה תרופה בשם '{name}'"
    }


def search_medications_by_ingredient(ingredient):
    """Search medications by active ingredient"""
    ingredient_lower = ingredient.lower()
    results = []
    
    for med in MEDICATIONS_DB:
        if ingredient_lower in med["active_ingredient"].lower():
            results.append({
                "name_he": med["name_he"],
                "name_en": med["name_en"],
                "strength_mg": med["strength_mg"],
                "in_stock": med["in_stock"],
                "requires_prescription": med["requires_prescription"]
            })
    
    if results:
        return {
            "success": True,
            "medications": results,
            "count": len(results)
        }
    
    return {
        "success": False,
        "error": f"לא נמצאו תרופות עם מרכיב פעיל '{ingredient}'"
    }


def check_prescription_requirement(name):
    """Check if medication requires prescription"""
    result = get_medication_by_name(name)
    
    if result["success"]:
        med = result["medication"]
        return {
            "success": True,
            "medication_name": med["name_he"],
            "requires_prescription": med["requires_prescription"],
            "category": med["category"]
        }
    
    return result


def get_alternative_medications(name):
    """Find alternative medications"""
    original = get_medication_by_name(name)
    
    if not original["success"]:
        return original
    
    ingredient = original["medication"]["active_ingredient"]
    alternatives = []
    
    for med in MEDICATIONS_DB:
        if (med["active_ingredient"] == ingredient and 
            med["name_he"] != original["medication"]["name_he"]):
            alternatives.append({
                "name_he": med["name_he"],
                "name_en": med["name_en"],
                "strength_mg": med["strength_mg"],
                "in_stock": med["in_stock"],
                "requires_prescription": med["requires_prescription"]
            })
    
    return {
        "success": True,
        "original_medication": original["medication"]["name_he"],
        "active_ingredient": ingredient,
        "alternatives": alternatives,
        "count": len(alternatives)
    }


def verify_user_id(user_id):
    """Verify user identity"""
    if user_id in USERS_DB:
        USERS_DB[user_id]["verified"] = True
        return {
            "success": True,
            "verified": True,
            "user_name": USERS_DB[user_id]["name"],
            "message": "זהות אומתה בהצלחה"
        }
    
    return {
        "success": False,
        "verified": False,
        "error": "מספר תעודת זהות לא נמצא במערכת"
    }


def get_user_prescriptions(user_id):
    """Get user's active prescriptions"""
    if user_id not in USERS_DB:
        return {
            "success": False,
            "error": "משתמש לא נמצא"
        }
    
    if not USERS_DB[user_id]["verified"]:
        return {
            "success": False,
            "error": "נדרש אימות זהות. אנא השתמש ב-verify_user_id תחילה"
        }
    
    return {
        "success": True,
        "user_name": USERS_DB[user_id]["name"],
        "prescriptions": USERS_DB[user_id]["prescriptions"]
    }


def get_user_drug_history(user_id):
    """Get user's drug usage history"""
    if user_id not in USERS_DB:
        return {
            "success": False,
            "error": "משתמש לא נמצא"
        }
    
    if not USERS_DB[user_id]["verified"]:
        return {
            "success": False,
            "error": "נדרש אימות זהות. אנא השתמש ב-verify_user_id תחילה"
        }
    
    return {
        "success": True,
        "user_name": USERS_DB[user_id]["name"],
        "drug_history": USERS_DB[user_id]["drug_history"]
    }


def get_user_allergies(user_id):
    """Get user's known allergies"""
    if user_id not in USERS_DB:
        return {
            "success": False,
            "error": "משתמש לא נמצא"
        }
    
    if not USERS_DB[user_id]["verified"]:
        return {
            "success": False,
            "error": "נדרש אימות זהות. אנא השתמש ב-verify_user_id תחילה"
        }
    
    return {
        "success": True,
        "user_name": USERS_DB[user_id]["name"],
        "allergies": USERS_DB[user_id]["allergies"]
    }


# Function registry
FUNCTIONS = {
    "get_medication_by_name": get_medication_by_name,
    "search_medications_by_ingredient": search_medications_by_ingredient,
    "check_prescription_requirement": check_prescription_requirement,
    "get_alternative_medications": get_alternative_medications,
    "verify_user_id": verify_user_id,
    "get_user_prescriptions": get_user_prescriptions,
    "get_user_drug_history": get_user_drug_history,
    "get_user_allergies": get_user_allergies
}


def execute_function(function_name, arguments):
    """Execute a pharmacy function by name"""
    if function_name not in FUNCTIONS:
        return {
            "success": False,
            "error": f"Function '{function_name}' not found"
        }
    
    try:
        func = FUNCTIONS[function_name]
        result = func(**arguments)
        return result
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }