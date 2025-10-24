"""
Mock Pharmacy API - simulates pharmacy database
"""

MEDICATIONS_DB = [
    {
        "name_he": "נורופן",
        "name_en": "Nurofen",
        "active_ingredient": "איבופרופן",
        "strength_mg": [200, 400],
        "instructions_dosage": "למבוגרים: טבליה אחת (200-400 מ\"ג) כל 6-8 שעות. ניתן לקחת עם או בלי אוכל. לא לעבור 1200 מ\"ג ביום.",
        "in_stock": True,
        "requires_prescription": False,
        "category": "משככי כאבים ונוגדי דלקת",
        "warnings": "לא לשימוש עם אלכוהול. להימנע בהיריון ובהנקה ללא ייעוץ רפואי."
    },
    {
        "name_he": "אקמול",
        "name_en": "Acamol",
        "active_ingredient": "פרצטמול",
        "strength_mg": [500, 1000],
        "instructions_dosage": "למבוגרים: 1-2 טבליות (500-1000 מ\"ג) כל 4-6 שעות. לא לעבור 4000 מ\"ג ביום.",
        "in_stock": True,
        "requires_prescription": False,
        "category": "משככי כאבים ומורידי חום",
        "warnings": "זהירות במחלות כבד. אין לשלב עם תרופות המכילות פרצטמול."
    },
    {
        "name_he": "אופטלגין",
        "name_en": "Optalgin",
        "active_ingredient": "דיפירון (מטמיזול)",
        "strength_mg": [500],
        "instructions_dosage": "למבוגרים: 1-2 טבליות (500-1000 מ\"ג) עד 3 פעמים ביום. לקחת עם אוכל.",
        "in_stock": False,
        "requires_prescription": False,
        "category": "משככי כאבים ומורידי חום",
        "warnings": "עלול לגרום לאגרנולוציטוזיס נדיר. להפסיק אם מופיע חום או דלקת גרון."
    },
    {
        "name_he": "ונטולין",
        "name_en": "Ventolin",
        "active_ingredient": "סלבוטמול",
        "strength_mg": [100],
        "instructions_dosage": "שאיפה: 1-2 שאיפות לפי הצורך. רווח של 4 שעות בין מנות. לא יותר מ-8 שאיפות ביום.",
        "in_stock": True,
        "requires_prescription": True,
        "category": "מרחיבי סימפונות",
        "warnings": "דורש מרשם רופא. עלול לגרום לרעד קל. להימנע משימוש מופרז."
    }
]

# User medical records database (simulated)
# In production, this should be stored in a secure database with proper encryption
USER_MEDICAL_RECORDS = {
    "123456789": {  # Example user ID
        "name": "יוסי כהן",
        "verified": False,  # Will be set to True after ID verification
        "prescriptions": [
            {
                "medication": "ונטולין",
                "dosage": "100 מק\"ג",
                "frequency": "2 שאיפות לפי הצורך",
                "prescribed_date": "2024-01-15",
                "doctor": "ד\"ר שרה לוי",
                "active": True
            },
            {
                "medication": "ליפיטור",
                "dosage": "20 מ\"ג",
                "frequency": "פעם ביום בערב",
                "prescribed_date": "2023-11-20",
                "doctor": "ד\"ר דוד כהן",
                "active": True
            }
        ],
        "drug_history": [
            {
                "medication": "אקמול",
                "date": "2024-02-10",
                "reason": "כאב ראש",
                "duration": "3 ימים"
            },
            {
                "medication": "נורופן",
                "date": "2024-01-25",
                "reason": "כאבי שרירים",
                "duration": "5 ימים"
            },
            {
                "medication": "אנטיביוטיקה (אמוקסיצילין)",
                "date": "2023-12-05",
                "reason": "דלקת גרון",
                "duration": "7 ימים"
            }
        ],
        "allergies": [
            {
                "substance": "פניצילין",
                "severity": "בינונית",
                "reaction": "פריחה בעור",
                "diagnosed_date": "2015-06-10"
            },
            {
                "substance": "אספירין",
                "severity": "קלה",
                "reaction": "גירוי קיבה",
                "diagnosed_date": "2018-03-15"
            }
        ]
    },
    "987654321": {  # Another example user
        "name": "מרים לוי",
        "verified": False,
        "prescriptions": [
            {
                "medication": "גלוקופאג'",
                "dosage": "850 מ\"ג",
                "frequency": "פעמיים ביום",
                "prescribed_date": "2023-08-10",
                "doctor": "ד\"ר משה אברהם",
                "active": True
            }
        ],
        "drug_history": [
            {
                "medication": "אופטלגין",
                "date": "2024-01-05",
                "reason": "מיגרנה",
                "duration": "2 ימים"
            }
        ],
        "allergies": [
            {
                "substance": "לקטוז",
                "severity": "קלה",
                "reaction": "אי נוחות במערכת העיכול",
                "diagnosed_date": "2010-05-20"
            }
        ]
    }
}


def get_medication_by_name(name, strength_mg=None):
    """Get medication information by name"""
    search_term = name.lower().strip()
    
    matches = [med for med in MEDICATIONS_DB 
               if search_term in med['name_he'].lower() or 
                  search_term in med['name_en'].lower()]
    
    if not matches:
        return {
            "success": False,
            "error": "medication_not_found",
            "message": f"לא נמצאה תרופה בשם \"{name}\" במאגר שלנו."
        }
    
    medication = matches[0]
    selected_strength = medication['strength_mg'][0]
    
    if strength_mg and strength_mg in medication['strength_mg']:
        selected_strength = strength_mg
    
    return {
        "success": True,
        "name": medication['name_he'],
        "name_en": medication['name_en'],
        "active_ingredient": medication['active_ingredient'],
        "strength_mg": selected_strength,
        "available_strengths": medication['strength_mg'],
        "instructions_dosage": medication['instructions_dosage'],
        "in_stock": medication['in_stock'],
        "requires_prescription": medication['requires_prescription'],
        "category": medication['category'],
        "warnings": medication['warnings']
    }


def search_medications_by_ingredient(ingredient):
    """Search medications by active ingredient"""
    search_term = ingredient.lower().strip()
    
    matches = [med for med in MEDICATIONS_DB 
               if search_term in med['active_ingredient'].lower()]
    
    if not matches:
        return {
            "success": False,
            "error": "ingredient_not_found",
            "message": f"לא נמצאו תרופות המכילות את המרכיב \"{ingredient}\"."
        }
    
    return {
        "success": True,
        "ingredient": ingredient,
        "medications": [{
            "name": med['name_he'],
            "name_en": med['name_en'],
            "strength_mg": med['strength_mg'],
            "in_stock": med['in_stock'],
            "requires_prescription": med['requires_prescription'],
            "category": med['category']
        } for med in matches]
    }


def check_prescription_requirement(name):
    """Check if medication requires prescription"""
    search_term = name.lower().strip()
    
    medication = next((med for med in MEDICATIONS_DB 
                      if search_term in med['name_he'].lower() or 
                         search_term in med['name_en'].lower()), None)
    
    if not medication:
        return {
            "success": False,
            "error": "medication_not_found",
            "message": f"לא נמצאה תרופה בשם \"{name}\" במאגר."
        }
    
    return {
        "success": True,
        "name": medication['name_he'],
        "requires_prescription": medication['requires_prescription'],
        "legal_category": "תרופה במרשם בלבד" if medication['requires_prescription'] else "תרופה ללא מרשם (OTC)",
        "message": "תרופה זו דורשת מרשם רופא ואינה זמינה ללא מרשם." if medication['requires_prescription'] 
                  else "תרופה זו אינה דורשת מרשם ואפשר לרכוש אותה ללא מרשם רופא."
    }


def get_alternative_medications(name):
    """Get alternative medications"""
    search_term = name.lower().strip()
    
    original_med = next((med for med in MEDICATIONS_DB 
                        if search_term in med['name_he'].lower() or 
                           search_term in med['name_en'].lower()), None)
    
    if not original_med:
        return {
            "success": False,
            "error": "medication_not_found",
            "message": f"לא נמצאה תרופה בשם \"{name}\"."
        }
    
    # Find alternatives with same active ingredient
    alternatives = [med for med in MEDICATIONS_DB 
                   if med['active_ingredient'] == original_med['active_ingredient'] and
                      med['name_he'] != original_med['name_he'] and
                      med['in_stock']]
    
    if not alternatives:
        # Try same category
        alternatives = [med for med in MEDICATIONS_DB 
                       if med['category'] == original_med['category'] and
                          med['name_he'] != original_med['name_he'] and
                          med['in_stock']]
    
    return {
        "success": True,
        "original_medication": original_med['name_he'],
        "alternatives": [{
            "name": med['name_he'],
            "name_en": med['name_en'],
            "active_ingredient": med['active_ingredient'],
            "strength_mg": med['strength_mg'],
            "requires_prescription": med['requires_prescription']
        } for med in alternatives]
    }


def verify_user_id(user_id):
    """
    Verify user ID and mark user as verified.
    In production, this would involve proper authentication (OTP, biometrics, etc.)
    """
    user_id = str(user_id).strip()

    if user_id not in USER_MEDICAL_RECORDS:
        return {
            "success": False,
            "error": "user_not_found",
            "message": "תעודת הזהות לא נמצאה במערכת. אנא פנה לרוקח.",
            "verified": False
        }

    # Mark user as verified
    USER_MEDICAL_RECORDS[user_id]["verified"] = True

    return {
        "success": True,
        "verified": True,
        "user_name": USER_MEDICAL_RECORDS[user_id]["name"],
        "message": f"שלום {USER_MEDICAL_RECORDS[user_id]['name']}, זיהינו אותך בהצלחה."
    }


def get_user_prescriptions(user_id):
    """
    Get user's active prescriptions.
    Requires prior verification via verify_user_id.
    """
    user_id = str(user_id).strip()

    if user_id not in USER_MEDICAL_RECORDS:
        return {
            "success": False,
            "error": "user_not_found",
            "message": "משתמש לא נמצא במערכת."
        }

    user_record = USER_MEDICAL_RECORDS[user_id]

    if not user_record.get("verified", False):
        return {
            "success": False,
            "error": "not_verified",
            "message": "יש לאמת זהות לפני צפייה במידע רפואי אישי.",
            "requires_verification": True
        }

    active_prescriptions = [p for p in user_record["prescriptions"] if p.get("active", True)]

    if not active_prescriptions:
        return {
            "success": True,
            "prescriptions": [],
            "message": "אין מרשמים פעילים כרגע."
        }

    return {
        "success": True,
        "user_name": user_record["name"],
        "prescriptions": active_prescriptions,
        "count": len(active_prescriptions)
    }


def get_user_drug_history(user_id):
    """
    Get user's drug usage history.
    Requires prior verification via verify_user_id.
    """
    user_id = str(user_id).strip()

    if user_id not in USER_MEDICAL_RECORDS:
        return {
            "success": False,
            "error": "user_not_found",
            "message": "משתמש לא נמצא במערכת."
        }

    user_record = USER_MEDICAL_RECORDS[user_id]

    if not user_record.get("verified", False):
        return {
            "success": False,
            "error": "not_verified",
            "message": "יש לאמת זהות לפני צפייה במידע רפואי אישי.",
            "requires_verification": True
        }

    drug_history = user_record.get("drug_history", [])

    if not drug_history:
        return {
            "success": True,
            "drug_history": [],
            "message": "אין היסטוריית שימוש בתרופות במערכת."
        }

    return {
        "success": True,
        "user_name": user_record["name"],
        "drug_history": drug_history,
        "count": len(drug_history)
    }


def get_user_allergies(user_id):
    """
    Get user's known allergies.
    Requires prior verification via verify_user_id.
    """
    user_id = str(user_id).strip()

    if user_id not in USER_MEDICAL_RECORDS:
        return {
            "success": False,
            "error": "user_not_found",
            "message": "משתמש לא נמצא במערכת."
        }

    user_record = USER_MEDICAL_RECORDS[user_id]

    if not user_record.get("verified", False):
        return {
            "success": False,
            "error": "not_verified",
            "message": "יש לאמת זהות לפני צפייה במידע רפואי אישי.",
            "requires_verification": True
        }

    allergies = user_record.get("allergies", [])

    if not allergies:
        return {
            "success": True,
            "allergies": [],
            "message": "אין אלרגיות ידועות במערכת."
        }

    return {
        "success": True,
        "user_name": user_record["name"],
        "allergies": allergies,
        "count": len(allergies)
    }


def execute_function(function_name, arguments):
    """Execute a function call"""
    if function_name == 'get_medication_by_name':
        return get_medication_by_name(arguments.get('name'), arguments.get('strength_mg'))
    elif function_name == 'search_medications_by_ingredient':
        return search_medications_by_ingredient(arguments['ingredient'])
    elif function_name == 'check_prescription_requirement':
        return check_prescription_requirement(arguments['name'])
    elif function_name == 'get_alternative_medications':
        return get_alternative_medications(arguments['name'])
    elif function_name == 'verify_user_id':
        return verify_user_id(arguments['user_id'])
    elif function_name == 'get_user_prescriptions':
        return get_user_prescriptions(arguments['user_id'])
    elif function_name == 'get_user_drug_history':
        return get_user_drug_history(arguments['user_id'])
    elif function_name == 'get_user_allergies':
        return get_user_allergies(arguments['user_id'])
    else:
        return {"success": False, "error": "unknown_function"}