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
    else:
        return {"success": False, "error": "unknown_function"}