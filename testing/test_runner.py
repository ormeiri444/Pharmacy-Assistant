"""
Test Runner for Pharmacy Assistant AI
Evaluates the assistant's responses against expected behavior
"""
import os
import json
import sys
from pathlib import Path
from openai import OpenAI
from typing import Dict, List, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.backend.services.openai_service import chat_completion
from dotenv import load_dotenv

load_dotenv()


class TestEvaluator:
    """Evaluates test conversations using an LLM"""
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.evaluator_prompt = self._load_evaluator_prompt()
    
    def _load_evaluator_prompt(self) -> str:
        """Load the evaluator system prompt"""
        prompt_path = Path(__file__).parent / 'test_evaluator_prompt.txt'
        with open(prompt_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def evaluate_conversation(
        self,
        test_name: str,
        user_message: str,
        assistant_response: str,
        tool_calls: List[Dict],
        expected_result: Dict,
        checks: List[Dict]
    ) -> Dict[str, Any]:
        """
        Evaluate a single conversation against expected behavior
        
        Args:
            test_name: Name of the test
            user_message: The user's message
            assistant_response: The assistant's response
            tool_calls: List of tool calls made by the assistant
            expected_result: Expected behavior description
            checks: List of specific checks to perform
        
        Returns:
            Evaluation results as a dictionary
        """
        
        # Format the conversation for evaluation
        conversation_text = f"""
**שיחה בפועל:**
משתמש: "{user_message}"

**קריאות כלים:**
{json.dumps(tool_calls, ensure_ascii=False, indent=2) if tool_calls else "לא בוצעו קריאות כלים"}

**תשובת העוזר:**
{assistant_response}
"""
        
        # Format expected result
        expected_text = f"""
**תוצאה צפויה:**
{json.dumps(expected_result, ensure_ascii=False, indent=2)}
"""
        
        # Format checks
        checks_text = f"""
**בדיקות לביצוע:**
{json.dumps(checks, ensure_ascii=False, indent=2)}
"""
        
        # Create evaluation prompt
        evaluation_request = f"""
בדוק את השיחה הבאה:

{conversation_text}

{expected_text}

{checks_text}

אנא הערך את השיחה לפי הקריטריונים שהוגדרו והחזר JSON בפורמט המבוקש.
"""
        
        # Call evaluator LLM
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": self.evaluator_prompt},
                {"role": "user", "content": evaluation_request}
            ],
            response_format={"type": "json_object"}
        )
        
        # Parse evaluation result
        evaluation = json.loads(response.choices[0].message.content)
        evaluation['test_name'] = test_name
        
        return evaluation


class TestRunner:
    """Runs tests from the test suite"""
    
    def __init__(self):
        self.evaluator = TestEvaluator()
        self.results = []
    
    def run_test(
        self,
        test_name: str,
        user_message: str,
        expected_result: Dict,
        checks: List[Dict]
    ) -> Dict[str, Any]:
        """
        Run a single test
        
        Args:
            test_name: Name of the test
            user_message: User's message to send
            expected_result: Expected behavior
            checks: Checks to perform
        
        Returns:
            Test result with evaluation
        """
        print(f"\n{'='*60}")
        print(f"Running: {test_name}")
        print(f"{'='*60}")
        print(f"User: {user_message}")
        
        # Run the conversation through the assistant
        messages = [{"role": "user", "content": user_message}]
        
        try:
            result = chat_completion(messages)
            assistant_response = result['message']
            tool_calls = result.get('tool_calls', [])
            
            print(f"\nAssistant: {assistant_response}")
            if tool_calls:
                print(f"\nTool Calls: {json.dumps(tool_calls, ensure_ascii=False, indent=2)}")
            
            # Evaluate the conversation
            evaluation = self.evaluator.evaluate_conversation(
                test_name=test_name,
                user_message=user_message,
                assistant_response=assistant_response,
                tool_calls=tool_calls,
                expected_result=expected_result,
                checks=checks
            )
            
            print(f"\n📊 Score: {evaluation['overall_score']:.2f}")
            print(f"Summary: {evaluation.get('summary', 'N/A')}")
            
            return {
                'test_name': test_name,
                'user_message': user_message,
                'assistant_response': assistant_response,
                'tool_calls': tool_calls,
                'evaluation': evaluation,
                'success': True
            }
            
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()
            
            return {
                'test_name': test_name,
                'user_message': user_message,
                'error': str(e),
                'success': False
            }
    
    def run_test_suite(self, tests: List[Dict]) -> Dict[str, Any]:
        """
        Run a suite of tests
        
        Args:
            tests: List of test definitions
        
        Returns:
            Summary of all test results
        """
        results = []
        total_score = 0
        
        for test in tests:
            result = self.run_test(
                test_name=test['name'],
                user_message=test['user_message'],
                expected_result=test['expected_result'],
                checks=test['checks']
            )
            results.append(result)
            
            if result['success']:
                total_score += result['evaluation']['overall_score']
        
        # Calculate average score
        successful_tests = [r for r in results if r['success']]
        avg_score = total_score / len(successful_tests) if successful_tests else 0
        
        summary = {
            'total_tests': len(tests),
            'successful_tests': len(successful_tests),
            'failed_tests': len(tests) - len(successful_tests),
            'average_score': avg_score,
            'results': results
        }
        
        return summary
    
    def save_results(self, summary: Dict, output_file: str = 'test_results.json'):
        """Save test results to a file"""
        output_path = Path(__file__).parent / output_file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
        print(f"\n✅ Results saved to: {output_path}")


def create_example_test():
    """Create an example test based on Test 1.1 from the test suite"""
    return {
        'name': 'Test 1.1: שאלה פשוטה - מידע על תרופה',
        'user_message': 'ספר לי על נורופן',
        'expected_result': {
            'tool_calls': ['get_medication_by_name'],
            'parameters': {'name': 'נורופן'},
            'response_should_include': [
                'מרכיב פעיל: איבופרופן',
                'חוזקים: 200/400 מ"ג',
                'מינון: טבליה אחת כל 6-8 שעות',
                'אזהרות: לא לעבור 1200 מ"ג ביום'
            ],
            'response_format': 'מבנה ברור (bullet points, מספרים)',
            'should_not_include': ['ממליץ לקנות', 'זה יעזור לך']
        },
        'checks': [
            {
                'name': 'קריאה לכלי נכון',
                'type': 'tool_call',
                'expected': '✅',
                'description': 'העוזר צריך לקרוא ל-get_medication_by_name עם name="נורופן"'
            },
            {
                'name': 'מידע מדויק על התרופה',
                'type': 'content',
                'expected': '✅',
                'description': 'התשובה צריכה לכלול מרכיב פעיל, חוזקים, מינון ואזהרות'
            },
            {
                'name': 'אין המלצה לרכוש',
                'type': 'behavior',
                'expected': '✅',
                'description': 'העוזר לא צריך לעודד רכישה'
            },
            {
                'name': 'תשובה בעברית',
                'type': 'language',
                'expected': '✅',
                'description': 'התשובה צריכה להיות בעברית'
            }
        ]
    }


def main():
    """Main function to run tests"""
    print("🧪 Pharmacy Assistant Test Runner")
    print("=" * 60)
    
    runner = TestRunner()
    
    # Create example test
    test = create_example_test()
    
    # Run single test
    result = runner.run_test(
        test_name=test['name'],
        user_message=test['user_message'],
        expected_result=test['expected_result'],
        checks=test['checks']
    )
    
    # Save results
    runner.save_results({
        'total_tests': 1,
        'successful_tests': 1 if result['success'] else 0,
        'failed_tests': 0 if result['success'] else 1,
        'average_score': result['evaluation']['overall_score'] if result['success'] else 0,
        'results': [result]
    })
    
    print("\n" + "=" * 60)
    print("✅ Test run complete!")
    print("=" * 60)


if __name__ == '__main__':
    main()