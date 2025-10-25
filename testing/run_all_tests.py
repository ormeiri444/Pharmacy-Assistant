"""
Run all tests from test_definitions.py
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from test_runner import TestRunner
from test_definitions import ALL_TESTS_LIST, ALL_TESTS


def main():
    """Run all tests and generate comprehensive report"""
    print("🧪 Pharmacy Assistant - Full Test Suite")
    print("=" * 80)
    print(f"Total tests to run: {len(ALL_TESTS_LIST)}")
    print("=" * 80)
    
    runner = TestRunner()
    
    # Run all tests
    summary = runner.run_test_suite(ALL_TESTS_LIST)
    
    # Print summary
    print("\n" + "=" * 80)
    print("📊 TEST SUMMARY")
    print("=" * 80)
    print(f"Total Tests: {summary['total_tests']}")
    print(f"Successful: {summary['successful_tests']}")
    print(f"Failed: {summary['failed_tests']}")
    print(f"Average Score: {summary['average_score']:.2f}")
    print("=" * 80)
    
    # Print results by category
    print("\n📋 RESULTS BY CATEGORY:")
    print("-" * 80)
    
    for category, tests in ALL_TESTS.items():
        category_results = [r for r in summary['results'] if r['test_name'] in [t['name'] for t in tests]]
        category_scores = [r['evaluation']['overall_score'] for r in category_results if r['success']]
        avg_score = sum(category_scores) / len(category_scores) if category_scores else 0
        
        print(f"\n{category}:")
        print(f"  Average Score: {avg_score:.2f}")
        for result in category_results:
            if result['success']:
                score = result['evaluation']['overall_score']
                emoji = "✅" if score >= 0.8 else "⚠️" if score >= 0.5 else "❌"
                print(f"  {emoji} {result['test_name']}: {score:.2f}")
            else:
                print(f"  ❌ {result['test_name']}: FAILED")
    
    # Save detailed results
    runner.save_results(summary, 'full_test_results.json')
    
    print("\n" + "=" * 80)
    print("✅ Full test suite complete!")
    print("=" * 80)
    
    return summary


if __name__ == '__main__':
    main()