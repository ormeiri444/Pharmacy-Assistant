# Pharmacy Assistant Agent

An AI-powered pharmacist assistant web application built for retail pharmacy chains, demonstrating advanced agent engineering with OpenAI's Realtime API and comprehensive LLM-based testing.

## Overview

This project implements an intelligent pharmacy assistant that helps customers get factual information about medications through voice interactions. The assistant is designed with strict safety policies to ensure it provides helpful information while never crossing the line into medical advice or diagnosis.

**Key Highlights:**
- Built using OpenAI's Realtime API for ultra-low latency voice interactions
- Implements 8 specialized tools for medication information and personal medical data
- Features a comprehensive LLM-based testing framework with automated evaluation
- Supports Hebrew language with proper RTL handling
- Demonstrates multi-step conversation flows with function calling

## Project Structure

```
pharmacy-assistant/
├── src/
│   ├── backend/              # Python backend server
│   │   ├── api/
│   │   │   └── server.py     # Flask server with WebRTC session handling
│   │   ├── config/
│   │   │   └── prompts/
│   │   │       ├── system-prompt.txt          # Agent system prompt
│   │   │       └── function-definitions.json  # Tool definitions
│   │   └── services/
│   │       ├── realtime_service.py    # OpenAI Realtime API integration
│   │       └── pharmacy_service.py    # Mock medication database & functions
│   └── frontend/             # Web interface
│       ├── public/
│       │   └── unified-realtime.html  # Voice interface
│       └── assets/
│           └── js/           # WebRTC client implementation
├── tests/                    # Automated testing framework
│   ├── test_runner.py        # Test execution engine
│   ├── judges/
│   │   └── llm_judge.py      # LLM-based evaluation system
│   ├── scenarios/
│   │   └── pharmacy_test_scenarios.json  # 20+ test scenarios
│   ├── config/
│   │   └── evaluation_config.json        # Evaluation criteria
│   ├── report_generator.py  # HTML report generation
│   └── run_tests.py         # Main test orchestrator
├── run.py                   # Application launcher
└── requirements.txt         # Python dependencies
```

## Core Components

### 1. System Prompt Design

The system prompt ([system-prompt.txt](src/backend/config/prompts/system-prompt.txt)) defines the agent's role, capabilities, and strict boundaries:

**What the Agent CAN do:**
- Provide factual information about medications
- Explain dosage and usage instructions
- Confirm prescription requirements
- Check availability in stock
- Identify active ingredients
- Access personal medical information (with ID verification)

**What the Agent CANNOT do:**
- Give medical advice or diagnosis
- Encourage purchases
- Recommend specific treatments
- Access personal data without verification

The prompt is entirely in Hebrew and includes specific scripts for redirecting out-of-scope requests to healthcare professionals.

### 2. Function (Tool) Design

Eight specialized functions provide the agent with access to medication information and personal medical data:

#### Medication Information Tools

1. **`get_medication_by_name`**
   - Retrieves comprehensive medication details by name (Hebrew or English)
   - Returns: active ingredient, dosage instructions, stock status, prescription requirement
   - Example: `{"name": "נורופן", "strength_mg": 400}`

2. **`search_medications_by_ingredient`**
   - Finds all medications containing a specific active ingredient
   - Useful for finding alternatives or generic options
   - Example: `{"ingredient": "איבופרופן"}`

3. **`check_prescription_requirement`**
   - Determines if a medication requires a prescription
   - Returns legal category and prescription status
   - Example: `{"name": "ונטולין"}`

4. **`get_alternative_medications`**
   - Suggests alternative medications with the same active ingredient
   - Critical for out-of-stock situations
   - Example: `{"name": "אופטלגין"}`

#### Personal Medical Information Tools (Privacy-Protected)

5. **`verify_user_id`**
   - Authenticates user identity via 9-digit ID number
   - **Required** before accessing any personal medical information
   - Example: `{"user_id": "123456789"}`

6. **`get_user_prescriptions`**
   - Retrieves active prescriptions after verification
   - Shows medication, dosage, doctor, and refills remaining
   - Example: `{"user_id": "123456789"}`

7. **`get_user_drug_history`**
   - Accesses historical medication usage
   - Requires prior verification
   - Example: `{"user_id": "123456789"}`

8. **`get_user_allergies`**
   - Returns list of known allergies
   - Critical for safety checking
   - Example: `{"user_id": "123456789"}`

All function definitions are in [function-definitions.json](src/backend/config/prompts/function-definitions.json) with Hebrew descriptions optimized for the agent.

### 3. Multi-Step Conversation Flows

The system handles three main conversation flows:

#### Flow 1: Medication Information Query
```
User: "שלום, אני צריך מידע על נורופן"
Agent: [Calls get_medication_by_name("נורופן")]
Agent: "נורופן זמין במלאי. זו תרופה ללא מרשם המכילה איבופרופן..."
```

#### Flow 2: Stock Check with Alternatives
```
User: "יש לכם אופטלגין?"
Agent: [Calls get_medication_by_name("אופטלגין")]
Agent: "מצטער, אופטלגין לא זמין כרגע במלאי..."
Agent: [Calls get_alternative_medications("אופטלגין")]
Agent: "יש לי תרופות חלופיות: נורופן, אדביל..."
```

#### Flow 3: Personal Medical Information Access
```
User: "מה המרשמים שלי?"
Agent: "כדי לגשת למידע רפואי אישי, אני צריך לאמת את זהותך..."
User: "123456789"
Agent: [Calls verify_user_id("123456789")]
Agent: [Calls get_user_prescriptions("123456789")]
Agent: "שלום יוסי כהן! יש לך 2 מרשמים פעילים: 1. ונטולין..."
```

### 4. Mock Pharmacy Database

The [pharmacy_service.py](src/backend/services/pharmacy_service.py) implements a realistic mock database with:
- 4+ medications (Nurofen, Acamol, Ventolin, Optalgin)
- Detailed information: active ingredients, dosage, warnings, stock status
- Mock user database with prescriptions, drug history, and allergies
- Full Hebrew language support

### 5. Realtime API Integration

The [realtime_service.py](src/backend/services/realtime_service.py) handles WebRTC session creation with OpenAI:
- Establishes low-latency voice connection
- Configures Hebrew language recognition
- Implements server-side voice activity detection (VAD)
- Registers all 8 tools for function calling
- Manages audio streaming (PCM16 format)

## Testing Framework

### Architecture

The testing system is a comprehensive LLM-based evaluation framework designed to assess agent behavior across multiple dimensions:

```
Test Execution Flow:
┌─────────────────────┐
│  Test Scenarios     │ (20+ predefined scenarios in JSON)
│  - Medication info  │
│  - Stock checks     │
│  - Personal data    │
│  - Policy tests     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Test Runner       │ (Executes scenarios, collects responses)
│  - Manages OpenAI   │
│  - Simulates tools  │
│  - Logs full conv.  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│    LLM Judge        │ (GPT-4 evaluates each response)
│  - Factual accuracy │ Scores: 0.0 - 1.0
│  - Policy adherence │
│  - Response quality │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Report Generator   │ (Creates detailed HTML reports)
│  - Overall metrics  │
│  - Per-scenario     │
│  - Failure analysis │
└─────────────────────┘
```

### Test Runner ([test_runner.py](tests/test_runner.py))

The `PharmacyTestRunner` class:
- Loads system prompt and function definitions
- Executes conversation scenarios with the agent
- Simulates tool responses from the mock database
- Maintains full conversation history
- Records all tool calls made during each scenario

### LLM Judge ([llm_judge.py](tests/judges/llm_judge.py))

The `PharmacyResponseJudge` uses GPT-4 to evaluate responses on three criteria:

1. **Factual Accuracy** (0.0-1.0)
   - Is the medication information correct?
   - Are dosages and warnings accurate?
   - Does it properly reflect tool responses?

2. **Policy Adherence** (0.0-1.0)
   - Does it avoid medical advice/diagnosis?
   - Does it refuse to encourage purchases?
   - Does it redirect appropriately when necessary?

3. **Response Quality** (0.0-1.0)
   - Is the response clear and helpful?
   - Is it appropriate for the modality (voice/chat)?
   - Does it answer the user's question?

Each evaluation includes:
- Numerical scores for each criterion
- Reasoning for the scores
- Specific feedback and suggestions
- Pass/fail determination based on thresholds

### Test Scenarios ([pharmacy_test_scenarios.json](tests/scenarios/pharmacy_test_scenarios.json))

20+ carefully designed test scenarios covering:
- **Basic queries**: Medication information, stock checks
- **Multi-step flows**: Authentication, prescription access
- **Edge cases**: Medications not found, ambiguous queries
- **Policy tests**: Medical advice requests, diagnosis attempts
- **Personal data**: Prescription access, allergy queries, drug history

Each scenario includes:
- User messages (in Hebrew)
- Expected behaviors
- Evaluation criteria weights
- Flow classification

### Report Generation ([report_generator.py](tests/report_generator.py))

Generates comprehensive HTML reports with:
- Overall pass rate and average scores
- Detailed results for each scenario
- Full conversation transcripts
- Tool call logs
- Judge feedback and reasoning
- Failure analysis and recommendations

## Setup Instructions

### Prerequisites

- Python 3.8+
- OpenAI API key with Realtime API access
- Modern web browser with WebRTC support

### Installation

1. **Clone the repository:**
   ```bash
   cd pharmacy-assistant
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure OpenAI API key:**
   ```bash
   # Create .env file
   echo "OPENAI_API_KEY=your_api_key_here" > .env
   ```

### Running the Application

**Start the server:**
```bash
python run.py
```

The application will be available at:
- **Voice Interface**: http://localhost:8080/

The interface provides:
- Real-time voice interaction
- Visual transcription of user speech
- Function call visibility (developer mode)
- Session management and reconnection

### Running Tests

**Execute the full test suite:**
```bash
python tests/run_tests.py
```

This will:
1. Load all 20+ test scenarios
2. Execute each scenario against the agent
3. Evaluate responses using the LLM judge
4. Generate a detailed HTML report in `tests/results/reports/`

**View test results:**
```bash
open tests/results/reports/test_report_[timestamp].html
```

## Technical Decisions & Rationale

### Why Realtime API?

The OpenAI Realtime API provides:
- **Ultra-low latency**: Sub-second response times for natural conversations
- **Native function calling**: Seamless integration with our 8 pharmacy tools
- **WebRTC streaming**: Direct audio streaming without intermediate servers
- **Built-in VAD**: Server-side voice activity detection for turn-taking

### System Prompt Engineering

The Hebrew-language system prompt includes:
- **Clear role definition**: Sets expectations for agent behavior
- **Explicit constraints**: Uses ✅/❌ symbols for visual clarity
- **Redirection scripts**: Provides exact wording for out-of-scope requests
- **Example conversations**: Shows proper handling of various scenarios
- **Automatic workflows**: Guides the agent through multi-step processes (ID verification → data access)



## Example Conversations

### Example 1: Simple Medication Query
```
User: "יש לכם נורופן במלאי?"
Agent: [Calls get_medication_by_name("נורופן")]
Agent: "כן, נורופן זמין במלאי. זו תרופה ללא מרשם למשכך כאבים
       המכילה איבופרופן. המינון הרגיל הוא 200-400 מ״ג כל 4-6 שעות."
```

### Example 2: Medical Advice Redirection
```
User: "כואב לי הראש, מה לקחת?"
Agent: "אני מצטער, אבל אני לא יכול לתת ייעוץ רפואי או להמליץ על
       תרופה ספציפית. אני ממליץ לך להתייעץ עם רוקח או רופא.
       אם יש לך שם תרופה ספציפית שאתה רוצה לדעת עליה,
       אני יכול לספק מידע עובדתי."
```

### Example 3: Personal Prescription Access
```
User: "מה המרשמים שלי?"
Agent: "כדי לגשת למידע רפואי אישי, אני צריך לאמת את זהותך.
       אנא ספק את מספר תעודת הזהות שלך (9 ספרות)."
User: "123456789"
Agent: [Calls verify_user_id("123456789")]
Agent: [Calls get_user_prescriptions("123456789")]
Agent: "שלום יוסי כהן! יש לך מרשם פעיל אחד:
       ונטולין 100 מק״ג - 2 שאיפות לפי הצורך
       נרשם על ידי ד״ר שרה לוי ב-15/01/2024
       נותרו 2 מילויים חוזרים"
```

## Test Results Summary

Recent test runs show:
- **Pass Rate**: 85-95% across all scenarios
- **Policy Adherence**: 100% (never gives medical advice)
- **Tool Usage**: Correct function calls in 90%+ of scenarios
- **Hebrew Support**: Full RTL and language support working correctly

---

**Built with:** OpenAI Realtime API, Python Flask, WebRTC, GPT-4
**Language:** Hebrew (primary), with English fallback
**Purpose:** Demonstrate agent engineering, prompt design, and testing methodology
