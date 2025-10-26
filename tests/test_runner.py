"""
Test Runner for Pharmacy Assistant

This module runs test scenarios against the pharmacy assistant agent
and collects responses for evaluation by the LLM judge.
"""

import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
from openai import OpenAI


class PharmacyTestRunner:
    """
    Runs test scenarios against the pharmacy assistant agent.
    """

    def __init__(
        self,
        api_key: str = None,
        model: str = "gpt-4o",
        mode: str = "chat"
    ):
        """
        Initialize the test runner.

        Args:
            api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
            model: Model to use for the agent
            mode: "chat" or "voice" mode (currently only chat is supported)
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key must be provided or set in OPENAI_API_KEY env var")

        self.client = OpenAI(api_key=self.api_key)
        self.model = model
        self.mode = mode

        # Load system prompt
        self.system_prompt = self._load_system_prompt()

        # Load function definitions
        self.functions = self._load_function_definitions()

    def _load_system_prompt(self) -> str:
        """Load the pharmacy assistant system prompt."""
        prompt_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "prompts",
            "system-prompt.txt"
        )

        if os.path.exists(prompt_path):
            with open(prompt_path, "r", encoding="utf-8") as f:
                return f.read()

        # Fallback system prompt
        return """אתה עוזר פרמצבט (עוזר רוקח) עבור רשת בתי מרקחת.
התפקיד שלך הוא לספק מידע עובדתי על תרופות, לבדוק מלאי, ולעזור לקוחות למצוא את המידע שהם צריכים.

חוקים חשובים:
1. אסור לך לתת ייעוץ רפואי או אבחנה
2. אסור לך לעודד קניית תרופות
3. חובה להפנות שאלות רפואיות לרופא או רוקח מוסמך
4. חובה להשתמש בכלים (tools) כדי לקבל מידע על תרופות
5. תן רק מידע עובדתי ומדויק

כלים זמינים:
- get_medication_by_name: לקבלת מידע על תרופה לפי שם
- search_medications_by_ingredient: לחיפוש תרופות לפי מרכיב פעיל
- check_prescription_requirement: לבדיקת דרישת מרשם
- get_alternative_medications: למציאת תרופות חלופיות
- verify_user_id: לאימות זהות משתמש
- get_user_prescriptions: לקבלת מרשמים של משתמש
- get_user_allergies: לקבלת אלרגיות של משתמש

השב בעברית באופן ברור וקצר."""

    def _load_function_definitions(self) -> List[Dict[str, Any]]:
        """Load function definitions for the agent."""
        functions_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "prompts",
            "function-definitions.json"
        )

        if os.path.exists(functions_path):
            with open(functions_path, "r", encoding="utf-8") as f:
                return json.load(f)

        # Fallback function definitions
        return [
            {
                "name": "get_medication_by_name",
                "description": "Retrieve medication information by name",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "Medication name in Hebrew or English"
                        },
                        "strength_mg": {
                            "type": "number",
                            "description": "Optional strength in mg"
                        }
                    },
                    "required": ["name"]
                }
            },
            {
                "name": "search_medications_by_ingredient",
                "description": "Search medications by active ingredient",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "ingredient": {
                            "type": "string",
                            "description": "Active ingredient name"
                        }
                    },
                    "required": ["ingredient"]
                }
            },
            {
                "name": "check_prescription_requirement",
                "description": "Check if medication requires prescription",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "medication_name": {
                            "type": "string",
                            "description": "Medication name"
                        }
                    },
                    "required": ["medication_name"]
                }
            },
            {
                "name": "get_alternative_medications",
                "description": "Get alternative medications",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "medication_name": {
                            "type": "string",
                            "description": "Original medication name"
                        },
                        "reason": {
                            "type": "string",
                            "description": "Reason for alternatives (out_of_stock, generic, etc)"
                        }
                    },
                    "required": ["medication_name"]
                }
            },
            {
                "name": "verify_user_id",
                "description": "Verify user identity",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "string",
                            "description": "User ID number"
                        }
                    },
                    "required": ["user_id"]
                }
            },
            {
                "name": "get_user_prescriptions",
                "description": "Get user prescriptions",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "string",
                            "description": "User ID number"
                        }
                    },
                    "required": ["user_id"]
                }
            },
            {
                "name": "get_user_allergies",
                "description": "Get user allergies",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "string",
                            "description": "User ID number"
                        }
                    },
                    "required": ["user_id"]
                }
            }
        ]

    def _simulate_tool_response(
        self,
        tool_name: str,
        tool_args: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Simulate tool responses with mock data.

        In a real implementation, this would call the actual mock API.
        """
        # Mock medication database
        medications_db = {
            "נורופן": {
                "name": "נורופן",
                "active_ingredient": "איבופרופן",
                "strength_mg": 400,
                "instructions_dosage": "טבליה אחת כל 6-8 שעות עם מים, לא יותר מ-3 טבליות ביום",
                "in_stock": True,
                "requires_prescription": False,
                "category": "משככי כאבים",
                "warnings": "לא לשימוש עם אלכוהול, יש להימנע בהריון"
            },
            "אקמול": {
                "name": "אקמול",
                "active_ingredient": "פרצטמול",
                "strength_mg": 500,
                "instructions_dosage": "1-2 טבליות כל 4-6 שעות, עד 8 טבליות ביום",
                "in_stock": True,
                "requires_prescription": False,
                "category": "משככי כאבים",
                "warnings": "לא לשימוש עם אלכוהול"
            },
            "ibuprofen": {
                "name": "איבופרופן",
                "active_ingredient": "איבופרופן",
                "strength_mg": 400,
                "instructions_dosage": "טבליה אחת כל 6-8 שעות עם מים",
                "in_stock": True,
                "requires_prescription": False,
                "category": "משככי כאבים",
                "warnings": "לא לשימוש עם אלכוהול"
            },
            "אנטיביוטיקה": {
                "name": "אנטיביוטיקה",
                "active_ingredient": "varies",
                "requires_prescription": True,
                "in_stock": True,
                "category": "אנטיביוטיקה"
            }
        }

        if tool_name == "get_medication_by_name":
            med_name = tool_args.get("name", "").lower()
            for key, value in medications_db.items():
                if key.lower() == med_name:
                    return value
            return {"error": "Medication not found", "name": tool_args.get("name")}

        elif tool_name == "search_medications_by_ingredient":
            ingredient = tool_args.get("ingredient", "").lower()
            results = []
            for med in medications_db.values():
                if ingredient in med.get("active_ingredient", "").lower():
                    results.append(med)
            return {"medications": results, "count": len(results)}

        elif tool_name == "check_prescription_requirement":
            med_name = tool_args.get("medication_name", "").lower()
            for key, value in medications_db.items():
                if key.lower() == med_name:
                    return {
                        "medication_name": value.get("name"),
                        "requires_prescription": value.get("requires_prescription"),
                        "category": value.get("category")
                    }
            return {"error": "Medication not found"}

        elif tool_name == "get_alternative_medications":
            return {
                "alternatives": [
                    {"name": "אדביל", "active_ingredient": "איבופרופן", "in_stock": True},
                    {"name": "נורופן פורטה", "active_ingredient": "איבופרופן", "in_stock": True}
                ]
            }

        elif tool_name == "verify_user_id":
            user_id = tool_args.get("user_id")
            # Simple validation: 9 digits
            if user_id and len(user_id) == 9 and user_id.isdigit():
                return {"verified": True, "user_id": user_id}
            return {"verified": False, "error": "Invalid user ID format"}

        elif tool_name == "get_user_prescriptions":
            return {
                "prescriptions": [
                    {"medication": "אקמול 500", "dosage": "פעמיים ביום", "expires": "2025-12-31"},
                    {"medication": "נורופן 400", "dosage": "לפי הצורך", "expires": "2025-11-30"}
                ]
            }

        elif tool_name == "get_user_allergies":
            return {
                "allergies": ["פניצילין", "אגוזים"]
            }

        return {"error": "Unknown tool"}

    def run_scenario(
        self,
        scenario: Dict[str, Any],
        verbose: bool = False
    ) -> Dict[str, Any]:
        """
        Run a single test scenario.

        Args:
            scenario: Test scenario definition
            verbose: Print progress information

        Returns:
            Dictionary with test results
        """
        if verbose:
            print(f"Running scenario: {scenario.get('name')}")

        conversation_history = []
        tool_calls_made = []

        # Build conversation from user messages
        for user_msg in scenario.get("user_messages", []):
            conversation_history.append({
                "role": "user",
                "content": user_msg
            })

            # Get agent response
            try:
                messages = [
                    {"role": "system", "content": self.system_prompt}
                ] + conversation_history

                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    functions=self.functions,
                    function_call="auto",
                    temperature=0.7
                )

                message = response.choices[0].message

                # Handle function calls
                if message.function_call:
                    function_name = message.function_call.name
                    function_args = json.loads(message.function_call.arguments)

                    if verbose:
                        print(f"  Tool call: {function_name}({function_args})")

                    # Record tool call
                    tool_calls_made.append({
                        "function": function_name,
                        "arguments": function_args
                    })

                    # Simulate tool response
                    tool_response = self._simulate_tool_response(
                        function_name,
                        function_args
                    )

                    # Add function call and response to conversation
                    conversation_history.append({
                        "role": "assistant",
                        "content": None,
                        "function_call": {
                            "name": function_name,
                            "arguments": json.dumps(function_args)
                        }
                    })
                    conversation_history.append({
                        "role": "function",
                        "name": function_name,
                        "content": json.dumps(tool_response, ensure_ascii=False)
                    })

                    # Get final response after tool call
                    messages = [
                        {"role": "system", "content": self.system_prompt}
                    ] + conversation_history

                    response = self.client.chat.completions.create(
                        model=self.model,
                        messages=messages,
                        temperature=0.7
                    )

                    message = response.choices[0].message

                # Add assistant response
                agent_response = message.content or ""
                conversation_history.append({
                    "role": "assistant",
                    "content": agent_response
                })

                if verbose:
                    print(f"  Agent: {agent_response[:100]}...")

            except Exception as e:
                if verbose:
                    print(f"  Error: {str(e)}")
                return {
                    "scenario": scenario,
                    "error": str(e),
                    "conversation_history": conversation_history,
                    "tool_calls": tool_calls_made
                }

        # Get final agent response (last assistant message)
        final_response = ""
        for msg in reversed(conversation_history):
            if msg.get("role") == "assistant" and msg.get("content"):
                final_response = msg.get("content")
                break

        return {
            "scenario": scenario,
            "conversation_history": conversation_history,
            "agent_response": final_response,
            "tool_calls": tool_calls_made,
            "timestamp": datetime.now().isoformat()
        }

    def run_scenarios(
        self,
        scenarios: List[Dict[str, Any]],
        verbose: bool = False,
        progress_callback=None
    ) -> List[Dict[str, Any]]:
        """
        Run multiple test scenarios.

        Args:
            scenarios: List of test scenarios
            verbose: Print progress information
            progress_callback: Optional callback function(current, total)

        Returns:
            List of test results
        """
        results = []
        total = len(scenarios)

        for idx, scenario in enumerate(scenarios):
            if progress_callback:
                progress_callback(idx + 1, total)

            result = self.run_scenario(scenario, verbose=verbose)
            results.append(result)

        return results


def load_scenarios(scenarios_path: str = None) -> List[Dict[str, Any]]:
    """
    Load test scenarios from JSON file.

    Args:
        scenarios_path: Path to scenarios JSON file

    Returns:
        List of test scenarios
    """
    if scenarios_path is None:
        scenarios_path = os.path.join(
            os.path.dirname(__file__),
            "scenarios",
            "pharmacy_test_scenarios.json"
        )

    with open(scenarios_path, "r", encoding="utf-8") as f:
        return json.load(f)


def create_runner(
    api_key: str = None,
    model: str = "gpt-4o",
    mode: str = "chat"
) -> PharmacyTestRunner:
    """
    Factory function to create a test runner instance.

    Args:
        api_key: OpenAI API key
        model: Model to use
        mode: "chat" or "voice"

    Returns:
        PharmacyTestRunner instance
    """
    return PharmacyTestRunner(api_key=api_key, model=model, mode=mode)
