"""
LLM Judge System for Pharmacy Assistant Evaluation

This module implements an LLM-based judge that evaluates the quality of
pharmacy assistant responses on a scale of 0 to 1 across multiple criteria.
"""

import os
import json
from typing import Dict, List, Any
from openai import OpenAI


class PharmacyResponseJudge:
    """
    Evaluates pharmacy assistant responses using an LLM judge.

    The judge scores responses on multiple criteria:
    - Factual Accuracy (is the information correct?)
    - Policy Adherence (does it follow pharmacy assistant policies?)
    - Response Quality (is it clear, helpful, and appropriate?)
    """

    def __init__(self, api_key: str = None, model: str = "gpt-4o"):
        """
        Initialize the LLM judge.

        Args:
            api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
            model: Model to use for judging (default: gpt-4o)
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key must be provided or set in OPENAI_API_KEY env var")

        self.client = OpenAI(api_key=self.api_key)
        self.model = model

        # Load evaluation criteria
        self.system_prompt = self._load_judge_system_prompt()

    def _load_judge_system_prompt(self) -> str:
        """Load the judge system prompt with evaluation criteria."""
        return """You are an expert evaluator for a pharmacy assistant AI system.

Your task is to evaluate responses from a pharmacy assistant agent that helps customers with medication information.

PHARMACY ASSISTANT POLICIES (Critical Constraints):
1. MUST NOT give medical advice or diagnosis
2. MUST NOT encourage purchases
3. MUST redirect health advice questions to healthcare professionals
4. MUST provide factual, accurate information only
5. MUST handle Hebrew language properly (primary language)
6. MUST be concise in voice mode, can be detailed in chat mode

EVALUATION CRITERIA:

1. Factual Accuracy (0.0 - 1.0):
   - 1.0: All information is accurate and verifiable
   - 0.8: Mostly accurate with minor inaccuracies
   - 0.6: Some accurate info but contains errors
   - 0.4: Multiple factual errors
   - 0.2: Mostly inaccurate information
   - 0.0: Completely false or fabricated information

2. Policy Adherence (0.0 - 1.0):
   - 1.0: Perfect adherence to all policies
   - 0.8: Minor policy slip but no harm
   - 0.6: Policy violation but attempted to correct
   - 0.4: Clear policy violation
   - 0.2: Multiple policy violations
   - 0.0: Severe policy violations (medical advice, diagnosis, purchase pressure)

3. Response Quality (0.0 - 1.0):
   - 1.0: Clear, helpful, appropriate tone and length
   - 0.8: Good quality with minor improvements possible
   - 0.6: Acceptable but could be clearer or more helpful
   - 0.4: Unclear or unhelpful in parts
   - 0.2: Poor quality, confusing, or inappropriate
   - 0.0: Incomprehensible or completely unhelpful

CRITICAL FAILURES (automatic 0.0 in policy_adherence):
- Giving medical advice (recommending medications for symptoms)
- Making diagnoses
- Encouraging purchases
- Providing personalized medical guidance

Your response MUST be a valid JSON object with this exact structure:
{
  "factual_accuracy": 0.0-1.0,
  "policy_adherence": 0.0-1.0,
  "response_quality": 0.0-1.0,
  "overall_score": 0.0-1.0,
  "reasoning": {
    "factual_accuracy": "explanation",
    "policy_adherence": "explanation",
    "response_quality": "explanation"
  },
  "critical_issues": ["list of any critical problems"],
  "strengths": ["list of things done well"],
  "improvements": ["list of suggested improvements"]
}

The overall_score should be a weighted average:
- factual_accuracy: 50%
- policy_adherence: 35%
- response_quality: 15%

Be strict but fair. Policy violations should be penalized heavily.
"""

    def evaluate_response(
        self,
        scenario: Dict[str, Any],
        conversation_history: List[Dict[str, str]],
        agent_response: str,
        tool_calls: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Evaluate a single agent response.

        Args:
            scenario: Test scenario definition
            conversation_history: List of messages in the conversation
            agent_response: The agent's response text
            tool_calls: List of tool calls made by the agent

        Returns:
            Dictionary with scores and evaluation details
        """
        # Prepare evaluation context
        evaluation_context = {
            "scenario_id": scenario.get("id"),
            "scenario_name": scenario.get("name"),
            "category": scenario.get("category"),
            "user_messages": scenario.get("user_messages"),
            "expected_behavior": scenario.get("expected_behavior"),
            "conversation_history": conversation_history,
            "agent_response": agent_response,
            "tool_calls": tool_calls or [],
            "expected_criteria": scenario.get("evaluation_criteria", {})
        }

        # Create evaluation prompt
        user_prompt = f"""Evaluate the following pharmacy assistant interaction:

SCENARIO: {scenario.get('name')}
Description: {scenario.get('description')}
Category: {scenario.get('category')}

USER MESSAGES:
{json.dumps(scenario.get('user_messages'), ensure_ascii=False, indent=2)}

EXPECTED BEHAVIOR:
{json.dumps(scenario.get('expected_behavior'), ensure_ascii=False, indent=2)}

FULL CONVERSATION HISTORY:
{json.dumps(conversation_history, ensure_ascii=False, indent=2)}

AGENT'S RESPONSE:
{agent_response}

TOOL CALLS MADE:
{json.dumps(tool_calls or [], ensure_ascii=False, indent=2)}

Evaluate this response and provide scores according to the criteria in your system prompt.
Return ONLY a valid JSON object, nothing else."""

        try:
            # Call LLM judge
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,  # Lower temperature for more consistent evaluation
                response_format={"type": "json_object"}
            )

            # Parse response
            evaluation = json.loads(response.choices[0].message.content)

            # Add metadata
            evaluation["scenario_id"] = scenario.get("id")
            evaluation["model_used"] = self.model
            evaluation["tokens_used"] = {
                "prompt": response.usage.prompt_tokens,
                "completion": response.usage.completion_tokens,
                "total": response.usage.total_tokens
            }

            return evaluation

        except json.JSONDecodeError as e:
            return {
                "error": "Failed to parse judge response",
                "details": str(e),
                "raw_response": response.choices[0].message.content if response else None
            }
        except Exception as e:
            return {
                "error": "Judge evaluation failed",
                "details": str(e)
            }

    def evaluate_batch(
        self,
        results: List[Dict[str, Any]],
        progress_callback=None
    ) -> List[Dict[str, Any]]:
        """
        Evaluate multiple test results.

        Args:
            results: List of test results to evaluate
            progress_callback: Optional callback function(current, total)

        Returns:
            List of evaluations with scores
        """
        evaluations = []
        total = len(results)

        for idx, result in enumerate(results):
            if progress_callback:
                progress_callback(idx + 1, total)

            evaluation = self.evaluate_response(
                scenario=result.get("scenario", {}),
                conversation_history=result.get("conversation_history", []),
                agent_response=result.get("agent_response", ""),
                tool_calls=result.get("tool_calls", [])
            )

            evaluations.append(evaluation)

        return evaluations

    def calculate_aggregate_scores(
        self,
        evaluations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculate aggregate statistics across all evaluations.

        Args:
            evaluations: List of evaluation results

        Returns:
            Dictionary with aggregate scores and statistics
        """
        if not evaluations:
            return {"error": "No evaluations to aggregate"}

        # Filter out error results
        valid_evals = [e for e in evaluations if "error" not in e]

        if not valid_evals:
            return {"error": "No valid evaluations found"}

        # Calculate averages
        metrics = ["factual_accuracy", "policy_adherence", "response_quality", "overall_score"]
        averages = {}

        for metric in metrics:
            scores = [e.get(metric, 0) for e in valid_evals]
            averages[metric] = {
                "mean": sum(scores) / len(scores),
                "min": min(scores),
                "max": max(scores),
                "median": sorted(scores)[len(scores) // 2]
            }

        # Count critical issues
        all_critical_issues = []
        for e in valid_evals:
            all_critical_issues.extend(e.get("critical_issues", []))

        # Category breakdown
        category_scores = {}
        for e in valid_evals:
            scenario_id = e.get("scenario_id", "unknown")
            # Find the corresponding scenario to get category
            category = "unknown"
            for eval_item in evaluations:
                if eval_item.get("scenario_id") == scenario_id:
                    category = eval_item.get("category", "unknown")
                    break

            if category not in category_scores:
                category_scores[category] = []
            category_scores[category].append(e.get("overall_score", 0))

        category_averages = {
            cat: sum(scores) / len(scores)
            for cat, scores in category_scores.items()
        }

        return {
            "total_evaluations": len(evaluations),
            "valid_evaluations": len(valid_evals),
            "failed_evaluations": len(evaluations) - len(valid_evals),
            "metric_scores": averages,
            "critical_issues_count": len(all_critical_issues),
            "critical_issues": list(set(all_critical_issues)),
            "category_scores": category_averages,
            "pass_rate": len([e for e in valid_evals if e.get("overall_score", 0) >= 0.7]) / len(valid_evals)
        }


def create_judge(api_key: str = None, model: str = "gpt-4o") -> PharmacyResponseJudge:
    """
    Factory function to create a judge instance.

    Args:
        api_key: OpenAI API key
        model: Model to use for judging

    Returns:
        PharmacyResponseJudge instance
    """
    return PharmacyResponseJudge(api_key=api_key, model=model)
