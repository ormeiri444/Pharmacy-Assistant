#!/usr/bin/env python3
"""
Main Test Execution Script for Pharmacy Assistant

This script runs the complete testing pipeline:
1. Load test scenarios
2. Run scenarios against the agent
3. Evaluate responses with LLM judge
4. Generate comprehensive reports

Usage:
    python run_tests.py [--scenarios SCENARIOS_FILE] [--model MODEL] [--verbose]
"""

import argparse
import sys
import os
from datetime import datetime
from dotenv import load_dotenv
load_dotenv() 

# Add parent directory to path to import modules
sys.path.insert(0, os.path.dirname(__file__))

from test_runner import PharmacyTestRunner, load_scenarios
from judges.llm_judge import PharmacyResponseJudge
from report_generator import ReportGenerator


def print_progress_bar(current, total, prefix='Progress:', length=50):
    """Print a progress bar to the console."""
    percent = 100 * (current / float(total))
    filled_length = int(length * current // total)
    bar = '█' * filled_length + '-' * (length - filled_length)
    print(f'\r{prefix} |{bar}| {percent:.1f}% ({current}/{total})', end='', flush=True)
    if current == total:
        print()


def main():
    """Main test execution function."""
    parser = argparse.ArgumentParser(
        description='Run Pharmacy Assistant tests with LLM judge evaluation'
    )
    parser.add_argument(
        '--scenarios',
        type=str,
        help='Path to test scenarios JSON file',
        default=None
    )
    parser.add_argument(
        '--model',
        type=str,
        help='OpenAI model to use for agent',
        default='gpt-4o'
    )
    parser.add_argument(
        '--judge-model',
        type=str,
        help='OpenAI model to use for judge',
        default='gpt-4o'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Print detailed progress information'
    )
    parser.add_argument(
        '--filter-category',
        type=str,
        help='Only run scenarios from this category',
        default=None
    )
    parser.add_argument(
        '--filter-id',
        type=str,
        help='Only run scenario with this ID',
        default=None
    )

    args = parser.parse_args()

    print("=" * 70)
    print("Pharmacy Assistant Test Framework")
    print("=" * 70)
    print()

    # Check for API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OPENAI_API_KEY environment variable not set")
        print("Please set your OpenAI API key:")
        print("  export OPENAI_API_KEY='your-api-key-here'")
        sys.exit(1)

    # Load scenarios
    print("📋 Loading test scenarios...")
    try:
        scenarios = load_scenarios(args.scenarios)
        print(f"   Loaded {len(scenarios)} scenarios")
    except Exception as e:
        print(f"ERROR: Failed to load scenarios: {e}")
        sys.exit(1)

    # Filter scenarios if requested
    if args.filter_category:
        scenarios = [s for s in scenarios if s.get("category") == args.filter_category]
        print(f"   Filtered to {len(scenarios)} scenarios in category '{args.filter_category}'")

    if args.filter_id:
        scenarios = [s for s in scenarios if s.get("id") == args.filter_id]
        print(f"   Filtered to scenario '{args.filter_id}'")

    if not scenarios:
        print("ERROR: No scenarios to run")
        sys.exit(1)

    print()

    # Initialize test runner
    print("🤖 Initializing test runner...")
    try:
        runner = PharmacyTestRunner(api_key=api_key, model=args.model)
        print(f"   Using model: {args.model}")
    except Exception as e:
        print(f"ERROR: Failed to initialize test runner: {e}")
        sys.exit(1)

    print()

    # Run scenarios
    print("🏃 Running test scenarios...")
    start_time = datetime.now()

    def progress_callback(current, total):
        if not args.verbose:
            print_progress_bar(current, total, prefix='Running scenarios:')

    try:
        test_results = runner.run_scenarios(
            scenarios,
            verbose=args.verbose,
            progress_callback=progress_callback
        )
        print(f"   Completed {len(test_results)} scenarios")
    except Exception as e:
        print(f"ERROR: Test execution failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    print()

    # Initialize judge
    print("⚖️  Initializing LLM judge...")
    try:
        judge = PharmacyResponseJudge(api_key=api_key, model=args.judge_model)
        print(f"   Using model: {args.judge_model}")
    except Exception as e:
        print(f"ERROR: Failed to initialize judge: {e}")
        sys.exit(1)

    print()

    # Evaluate results
    print("📊 Evaluating responses...")

    def eval_progress_callback(current, total):
        if not args.verbose:
            print_progress_bar(current, total, prefix='Evaluating:')

    try:
        evaluations = judge.evaluate_batch(
            test_results,
            progress_callback=eval_progress_callback
        )
        print(f"   Completed {len(evaluations)} evaluations")
    except Exception as e:
        print(f"ERROR: Evaluation failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    print()

    # Calculate aggregate scores
    print("📈 Calculating aggregate scores...")
    try:
        aggregate_scores = judge.calculate_aggregate_scores(evaluations)

        # Print summary
        print()
        print("=" * 70)
        print("RESULTS SUMMARY")
        print("=" * 70)
        print()

        print(f"Total Scenarios:      {aggregate_scores['total_evaluations']}")
        print(f"Valid Evaluations:    {aggregate_scores['valid_evaluations']}")
        print(f"Failed Evaluations:   {aggregate_scores['failed_evaluations']}")
        print(f"Pass Rate:            {aggregate_scores['pass_rate'] * 100:.1f}%")
        print()

        print("Average Scores:")
        metrics = aggregate_scores.get('metric_scores', {})
        for metric_name, scores in metrics.items():
            mean = scores.get('mean', 0)
            print(f"  {metric_name:20s}: {mean:.3f}")

        print()

        if aggregate_scores.get('critical_issues_count', 0) > 0:
            print(f"⚠️  Critical Issues Found: {aggregate_scores['critical_issues_count']}")
            print("Critical issues:")
            for issue in aggregate_scores.get('critical_issues', []):
                print(f"  - {issue}")
            print()

        print("Category Scores:")
        for category, score in aggregate_scores.get('category_scores', {}).items():
            print(f"  {category:20s}: {score:.3f}")

    except Exception as e:
        print(f"ERROR: Failed to calculate aggregate scores: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    print()

    # Generate reports
    print("📝 Generating reports...")
    try:
        reporter = ReportGenerator()
        report_paths = reporter.generate_all_reports(
            test_results,
            evaluations,
            aggregate_scores
        )

        print(f"   JSON report:  {report_paths['json']}")
        print(f"   CSV report:   {report_paths['csv']}")
        print(f"   HTML report:  {report_paths['html']}")
        print(f"   Logs saved:   {report_paths['logs']}")
    except Exception as e:
        print(f"ERROR: Report generation failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    print()

    # Final summary
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()

    print("=" * 70)
    print(f"✅ Testing completed in {duration:.1f} seconds")
    print()
    print(f"Open the HTML report to view detailed results:")
    print(f"  {os.path.abspath(report_paths['html'])}")
    print("=" * 70)


if __name__ == "__main__":
    main()
