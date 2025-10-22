// Mock Pharmacy API
// Simulates a pharmacy backend with realistic Hebrew medication data

const medicationsDB = [
  {
    name_he: "נורופן",
    name_en: "Nurofen",
    active_ingredient: "איבופרופן",
    strength_mg: [200, 400],
    instructions_dosage: "למבוגרים: טבליה אחת (200-400 מ\"ג) כל 6-8 שעות. ניתן לקחת עם או בלי אוכל. לא לעבור 1200 מ\"ג ביום.",
    in_stock: true,
    requires_prescription: false,
    category: "משככי כאבים ונוגדי דלקת",
    warnings: "לא לשימוש עם אלכוהול. להימנע בהיריון ובהנקה ללא ייעוץ רפואי."
  },
  {
    name_he: "אקמול",
    name_en: "Acamol",
    active_ingredient: "פרצטמול",
    strength_mg: [500, 1000],
    instructions_dosage: "למבוגרים: 1-2 טבליות (500-1000 מ\"ג) כל 4-6 שעות. לא לעבור 4000 מ\"ג ביום.",
    in_stock: true,
    requires_prescription: false,
    category: "משככי כאבים ומורידי חום",
    warnings: "זהירות במחלות כבד. אין לשלב עם תרופות המכילות פרצטמול."
  },
  {
    name_he: "אספירין",
    name_en: "Aspirin",
    active_ingredient: "חומצה אצטילסליצילית",
    strength_mg: [100, 300],
    instructions_dosage: "למניעת קרישי דם: 100 מ\"ג פעם ביום. למבוגרים כמשכך כאבים: 300-900 מ\"ג כל 4-6 שעות.",
    in_stock: true,
    requires_prescription: false,
    category: "נוגדי קרישה ומשככי כאבים",
    warnings: "לא לילדים מתחת לגיל 16. עלול לגרום לדימום. להימנע לפני ניתוחים."
  },
  {
    name_he: "אופטלגין",
    name_en: "Optalgin",
    active_ingredient: "דיפירון (מטמיזול)",
    strength_mg: [500],
    instructions_dosage: "למבוגרים: 1-2 טבליות (500-1000 מ\"ג) עד 3 פעמים ביום. לקחת עם אוכל.",
    in_stock: false,
    requires_prescription: false,
    category: "משככי כאבים ומורידי חום",
    warnings: "עלול לגרום לאגרנולוציטוזיס נדיר. להפסיק אם מופיע חום או דלקת גרון."
  },
  {
    name_he: "טלפסט",
    name_en: "Telfast",
    active_ingredient: "פקסופנדין",
    strength_mg: [120, 180],
    instructions_dosage: "למבוגרים: טבליה אחת (120 או 180 מ\"ג) פעם ביום. לקחת עם מים לפני האוכל.",
    in_stock: true,
    requires_prescription: false,
    category: "אנטיהיסטמינים",
    warnings: "עלול לגרום לסחרחורת קלה. זהירות בהפעלת מכונות."
  },
  {
    name_he: "אומז",
    name_en: "Omez",
    active_ingredient: "אומפרזול",
    strength_mg: [20, 40],
    instructions_dosage: "למבוגרים: 20 מ\"ג פעם ביום בבוקר על קיבה ריקה. לבלוע את הקפסולה שלמה.",
    in_stock: true,
    requires_prescription: false,
    category: "מעכבי משאבת פרוטונים",
    warnings: "לא להשתמש יותר מ-14 ימים ללא פיקוח רפואי. עלול לגרום לכאבי ראש."
  },
  {
    name_he: "ונטולין",
    name_en: "Ventolin",
    active_ingredient: "סלבוטמול",
    strength_mg: [100],
    instructions_dosage: "שאיפה: 1-2 שאיפות לפי הצורך. רווח של 4 שעות בין מנות. לא יותר מ-8 שאיפות ביום.",
    in_stock: true,
    requires_prescription: true,
    category: "מרחיבי סימפונות",
    warnings: "דורש מרשם רופא. עלול לגרום לרעד קל. להימנע משימוש מופרז."
  },
  {
    name_he: "קונקור",
    name_en: "Concor",
    active_ingredient: "ביזופרולול",
    strength_mg: [5, 10],
    instructions_dosage: "למבוגרים: 5-10 מ\"ג פעם ביום בבוקר. לקחת עם מים, עם או בלי אוכל.",
    in_stock: true,
    requires_prescription: true,
    category: "חוסמי בטא",
    warnings: "דורש מרשם רופא. אין להפסיק פתאום. עלול לגרום לעייפות בתחילת הטיפול."
  },
  {
    name_he: "סינטרום",
    name_en: "Sintrom",
    active_ingredient: "אצנוקומרול",
    strength_mg: [1, 4],
    instructions_dosage: "המינון מותאם אישית לפי בדיקות INR. לקחת באותה שעה מדי יום.",
    in_stock: true,
    requires_prescription: true,
    category: "נוגדי קרישה",
    warnings: "דורש מרשם ומעקב רפואי הדוק. סיכון דימומים. להימנע מאלכוהול ושינויים בתזונה."
  },
  {
    name_he: "אוגמנטין",
    name_en: "Augmentin",
    active_ingredient: "אמוקסיצילין + חומצה קלבולנית",
    strength_mg: [875],
    instructions_dosage: "למבוגרים: טבליה אחת (875 מ\"ג) פעמיים ביום. לסיים את כל המנות גם אם יש שיפור.",
    in_stock: true,
    requires_prescription: true,
    category: "אנטיביוטיקה",
    warnings: "דורש מרשם רופא. עלול לגרום לשלשולים. לא לחולים עם אלרגיה לפניצילין."
  },
  {
    name_he: "לופרסור",
    name_en: "Lopressor",
    active_ingredient: "מטופרולול",
    strength_mg: [50, 100],
    instructions_dosage: "למבוגרים: 50-100 מ\"ג פעם עד פעמיים ביום. לקחת עם או אחרי אוכל.",
    in_stock: false,
    requires_prescription: true,
    category: "חוסמי בטא",
    warnings: "דורש מרשם רופא. אין להפסיק פתאום. זהירות בסוכרת ואסטמה."
  },
  {
    name_he: "קסילין",
    name_en: "Xylin",
    active_ingredient: "קסילומטזולין",
    strength_mg: [0.1],
    instructions_dosage: "2-3 טיפות או רססים בכל נחיר עד 3 פעמים ביום. לא יותר מ-7 ימים.",
    in_stock: true,
    requires_prescription: false,
    category: "תרסיס אף",
    warnings: "שימוש ממושך יוצר תלות. להפסיק לאחר 5-7 ימים."
  },
  {
    name_he: "ויטמין D3",
    name_en: "Vitamin D3",
    active_ingredient: "כולקלציפרול",
    strength_mg: [1000, 2000],
    instructions_dosage: "למבוגרים: 1000-2000 יחידות בינלאומיות ביום. מומלץ לקחת עם ארוחה שומנית.",
    in_stock: true,
    requires_prescription: false,
    category: "תוספי תזונה",
    warnings: "מינון גבוה דורש פיקוח רפואי. עודף עלול לגרום לבעיות כליה."
  },
  {
    name_he: "זולמיג",
    name_en: "Zolmig",
    active_ingredient: "זולמיטריפטן",
    strength_mg: [2.5],
    instructions_dosage: "למבוגרים: טבליה אחת (2.5 מ\"ג) עם תחילת מיגרנה. ניתן לחזור אחרי שעתיים אם נדרש.",
    in_stock: true,
    requires_prescription: true,
    category: "טיפול במיגרנה",
    warnings: "דורש מרשם רופא. לא יותר מ-10 מ\"ג ביום. זהירות במחלות לב."
  },
  {
    name_he: "רניטידין",
    name_en: "Ranitidine",
    active_ingredient: "רניטידין",
    strength_mg: [150, 300],
    instructions_dosage: "למבוגרים: 150 מ\"ג פעמיים ביום או 300 מ\"ג לפני השינה.",
    in_stock: false,
    requires_prescription: false,
    category: "חוסמי H2",
    warnings: "כיום נדיר בשימוש עקב אזהרות בטיחות. אומפרזול עדיף."
  }
];

// Helper function to normalize Hebrew/English name searches
function normalizeSearchTerm(term) {
  return term.toLowerCase().trim();
}

// Tool 1: get_medication_by_name
function getMedicationByName(name, strength_mg = null) {
  const searchTerm = normalizeSearchTerm(name);

  // Search by Hebrew or English name
  let matches = medicationsDB.filter(med =>
    normalizeSearchTerm(med.name_he).includes(searchTerm) ||
    normalizeSearchTerm(med.name_en).includes(searchTerm)
  );

  if (matches.length === 0) {
    return {
      success: false,
      error: "medication_not_found",
      message: `לא נמצאה תרופה בשם "${name}" במאגר שלנו.`
    };
  }

  // If multiple matches and no strength specified, return ambiguous error
  if (matches.length > 1 && !strength_mg) {
    return {
      success: false,
      error: "ambiguous_name",
      message: `נמצאו מספר תרופות עם השם "${name}". אנא ציין חוזק/ריכוז.`,
      options: matches.map(m => ({
        name: m.name_he,
        strengths: m.strength_mg
      }))
    };
  }

  // Select first match (or could filter by strength)
  const medication = matches[0];

  // Filter by strength if specified
  let selectedStrength = medication.strength_mg[0];
  if (strength_mg && medication.strength_mg.includes(strength_mg)) {
    selectedStrength = strength_mg;
  }

  return {
    success: true,
    name: medication.name_he,
    name_en: medication.name_en,
    active_ingredient: medication.active_ingredient,
    strength_mg: selectedStrength,
    available_strengths: medication.strength_mg,
    instructions_dosage: medication.instructions_dosage,
    in_stock: medication.in_stock,
    requires_prescription: medication.requires_prescription,
    category: medication.category,
    warnings: medication.warnings
  };
}

// Tool 2: search_medications_by_ingredient
function searchMedicationsByIngredient(ingredient) {
  const searchTerm = normalizeSearchTerm(ingredient);

  const matches = medicationsDB.filter(med =>
    normalizeSearchTerm(med.active_ingredient).includes(searchTerm)
  );

  if (matches.length === 0) {
    return {
      success: false,
      error: "ingredient_not_found",
      message: `לא נמצאו תרופות המכילות את המרכיב "${ingredient}".`
    };
  }

  return {
    success: true,
    ingredient: ingredient,
    medications: matches.map(med => ({
      name: med.name_he,
      name_en: med.name_en,
      strength_mg: med.strength_mg,
      in_stock: med.in_stock,
      requires_prescription: med.requires_prescription,
      category: med.category
    }))
  };
}

// Tool 3: check_prescription_requirement
function checkPrescriptionRequirement(name) {
  const searchTerm = normalizeSearchTerm(name);

  const medication = medicationsDB.find(med =>
    normalizeSearchTerm(med.name_he).includes(searchTerm) ||
    normalizeSearchTerm(med.name_en).includes(searchTerm)
  );

  if (!medication) {
    return {
      success: false,
      error: "medication_not_found",
      message: `לא נמצאה תרופה בשם "${name}" במאגר.`
    };
  }

  return {
    success: true,
    name: medication.name_he,
    requires_prescription: medication.requires_prescription,
    legal_category: medication.requires_prescription ? "תרופה במרשם בלבד" : "תרופה ללא מרשם (OTC)",
    message: medication.requires_prescription
      ? "תרופה זו דורשת מרשם רופא ואינה זמינה ללא מרשם."
      : "תרופה זו אינה דורשת מרשם ואפשר לרכוש אותה ללא מרשם רופא."
  };
}

// Tool 4: get_alternative_medications (bonus)
function getAlternativeMedications(name) {
  const searchTerm = normalizeSearchTerm(name);

  const originalMed = medicationsDB.find(med =>
    normalizeSearchTerm(med.name_he).includes(searchTerm) ||
    normalizeSearchTerm(med.name_en).includes(searchTerm)
  );

  if (!originalMed) {
    return {
      success: false,
      error: "medication_not_found",
      message: `לא נמצאה תרופה בשם "${name}".`
    };
  }

  // Find alternatives with same active ingredient
  const alternatives = medicationsDB.filter(med =>
    med.active_ingredient === originalMed.active_ingredient &&
    normalizeSearchTerm(med.name_he) !== searchTerm &&
    med.in_stock === true
  );

  if (alternatives.length === 0) {
    // Try same category
    const categoryAlternatives = medicationsDB.filter(med =>
      med.category === originalMed.category &&
      normalizeSearchTerm(med.name_he) !== searchTerm &&
      med.in_stock === true
    );

    return {
      success: true,
      original_medication: originalMed.name_he,
      alternatives: categoryAlternatives.map(med => ({
        name: med.name_he,
        name_en: med.name_en,
        active_ingredient: med.active_ingredient,
        strength_mg: med.strength_mg,
        requires_prescription: med.requires_prescription,
        note: "תרופה אלטרנטיבית מאותה קטגוריה"
      })),
      note: "לא נמצאו תרופות עם אותו מרכיב פעיל. מוצגות תרופות מאותה קטגוריה."
    };
  }

  return {
    success: true,
    original_medication: originalMed.name_he,
    alternatives: alternatives.map(med => ({
      name: med.name_he,
      name_en: med.name_en,
      active_ingredient: med.active_ingredient,
      strength_mg: med.strength_mg,
      requires_prescription: med.requires_prescription,
      note: "תרופה עם אותו מרכיב פעיל"
    }))
  };
}

// Execute tool call (used by both chat and voice clients)
function executeToolCall(toolName, parameters) {
  console.log(`TOOL CALL: ${toolName}`, parameters);

  let result;
  switch(toolName) {
    case 'get_medication_by_name':
      result = getMedicationByName(parameters.name, parameters.strength_mg);
      break;
    case 'search_medications_by_ingredient':
      result = searchMedicationsByIngredient(parameters.ingredient);
      break;
    case 'check_prescription_requirement':
      result = checkPrescriptionRequirement(parameters.name);
      break;
    case 'get_alternative_medications':
      result = getAlternativeMedications(parameters.name);
      break;
    default:
      result = {
        success: false,
        error: "unknown_tool",
        message: `כלי "${toolName}" לא קיים.`
      };
  }

  console.log(`TOOL RESPONSE: ${toolName}`, result);
  return result;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    medicationsDB,
    getMedicationByName,
    searchMedicationsByIngredient,
    checkPrescriptionRequirement,
    getAlternativeMedications,
    executeToolCall
  };
}
