"""
Report Generator for Pharmacy Assistant Test Results

This module generates comprehensive reports from test evaluations,
including JSON, HTML, and CSV formats with visualizations.
"""

import json
import os
from typing import Dict, List, Any
from datetime import datetime
import csv


class ReportGenerator:
    """
    Generates test reports in multiple formats.
    """

    def __init__(self, output_dir: str = None):
        """
        Initialize the report generator.

        Args:
            output_dir: Directory to save reports (defaults to tests/results/reports)
        """
        if output_dir is None:
            output_dir = os.path.join(
                os.path.dirname(__file__),
                "results",
                "reports"
            )

        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

        # Create subdirectories
        self.logs_dir = os.path.join(
            os.path.dirname(__file__),
            "results",
            "logs"
        )
        os.makedirs(self.logs_dir, exist_ok=True)

    def generate_json_report(
        self,
        evaluations: List[Dict[str, Any]],
        aggregate_scores: Dict[str, Any],
        timestamp: str = None
    ) -> str:
        """
        Generate JSON report.

        Args:
            evaluations: List of evaluation results
            aggregate_scores: Aggregate statistics
            timestamp: Report timestamp (defaults to current time)

        Returns:
            Path to generated JSON file
        """
        if timestamp is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        report = {
            "report_metadata": {
                "timestamp": timestamp,
                "total_scenarios": len(evaluations),
                "generated_by": "PharmacyAssistantTestFramework"
            },
            "aggregate_scores": aggregate_scores,
            "individual_evaluations": evaluations
        }

        output_path = os.path.join(
            self.output_dir,
            f"test_report_{timestamp}.json"
        )

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        return output_path

    def generate_csv_report(
        self,
        evaluations: List[Dict[str, Any]],
        timestamp: str = None
    ) -> str:
        """
        Generate CSV report with scores.

        Args:
            evaluations: List of evaluation results
            timestamp: Report timestamp

        Returns:
            Path to generated CSV file
        """
        if timestamp is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        output_path = os.path.join(
            self.output_dir,
            f"test_scores_{timestamp}.csv"
        )

        # Filter valid evaluations
        valid_evals = [e for e in evaluations if "error" not in e]

        if not valid_evals:
            return None

        # CSV headers
        headers = [
            "scenario_id",
            "scenario_name",
            "category",
            "factual_accuracy",
            "policy_adherence",
            "response_quality",
            "overall_score",
            "critical_issues_count",
            "passed"
        ]

        with open(output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()

            for eval_result in valid_evals:
                row = {
                    "scenario_id": eval_result.get("scenario_id", ""),
                    "scenario_name": "",  # Will need to look up
                    "category": "",
                    "factual_accuracy": eval_result.get("factual_accuracy", 0),
                    "policy_adherence": eval_result.get("policy_adherence", 0),
                    "response_quality": eval_result.get("response_quality", 0),
                    "overall_score": eval_result.get("overall_score", 0),
                    "critical_issues_count": len(eval_result.get("critical_issues", [])),
                    "passed": "YES" if eval_result.get("overall_score", 0) >= 0.7 else "NO"
                }
                writer.writerow(row)

        return output_path

    def generate_html_report(
        self,
        evaluations: List[Dict[str, Any]],
        aggregate_scores: Dict[str, Any],
        timestamp: str = None
    ) -> str:
        """
        Generate HTML report with visualizations.

        Args:
            evaluations: List of evaluation results
            aggregate_scores: Aggregate statistics
            timestamp: Report timestamp

        Returns:
            Path to generated HTML file
        """
        if timestamp is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        output_path = os.path.join(
            self.output_dir,
            f"test_report_{timestamp}.html"
        )

        # Generate HTML content
        html_content = self._generate_html_content(evaluations, aggregate_scores, timestamp)

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        return output_path

    def _generate_html_content(
        self,
        evaluations: List[Dict[str, Any]],
        aggregate_scores: Dict[str, Any],
        timestamp: str
    ) -> str:
        """Generate HTML content for the report."""
        valid_evals = [e for e in evaluations if "error" not in e]

        # Calculate pass/fail
        passed = len([e for e in valid_evals if e.get("overall_score", 0) >= 0.7])
        failed = len(valid_evals) - passed

        # Calculate category scores
        category_scores = aggregate_scores.get("category_scores", {})

        html = f"""
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pharmacy Assistant Test Report - {timestamp}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            direction: rtl;
        }}

        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }}

        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }}

        .header h1 {{
            font-size: 2.5em;
            margin-bottom: 10px;
        }}

        .header .timestamp {{
            font-size: 0.9em;
            opacity: 0.9;
        }}

        .summary {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }}

        .summary-card {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
        }}

        .summary-card h3 {{
            color: #666;
            font-size: 0.9em;
            margin-bottom: 10px;
            text-transform: uppercase;
        }}

        .summary-card .value {{
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }}

        .metric-scores {{
            padding: 30px;
        }}

        .metric-scores h2 {{
            margin-bottom: 20px;
            color: #333;
        }}

        .metric {{
            margin-bottom: 20px;
        }}

        .metric-label {{
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-weight: 600;
        }}

        .metric-bar {{
            height: 30px;
            background: #e0e0e0;
            border-radius: 15px;
            overflow: hidden;
            position: relative;
        }}

        .metric-bar-fill {{
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            transition: width 0.5s ease;
        }}

        .category-scores {{
            padding: 30px;
            background: #f8f9fa;
        }}

        .category-scores h2 {{
            margin-bottom: 20px;
            color: #333;
        }}

        .category-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }}

        .category-card {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }}

        .category-card h3 {{
            margin-bottom: 10px;
            color: #667eea;
        }}

        .detailed-results {{
            padding: 30px;
        }}

        .detailed-results h2 {{
            margin-bottom: 20px;
            color: #333;
        }}

        .result-item {{
            background: white;
            padding: 20px;
            margin-bottom: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }}

        .result-item.failed {{
            border-left-color: #e74c3c;
        }}

        .result-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }}

        .result-header h3 {{
            color: #333;
        }}

        .badge {{
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: bold;
        }}

        .badge.pass {{
            background: #2ecc71;
            color: white;
        }}

        .badge.fail {{
            background: #e74c3c;
            color: white;
        }}

        .result-scores {{
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 10px;
        }}

        .score-item {{
            text-align: center;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }}

        .score-item .label {{
            font-size: 0.75em;
            color: #666;
            margin-bottom: 5px;
        }}

        .score-item .value {{
            font-size: 1.2em;
            font-weight: bold;
            color: #667eea;
        }}

        .critical-issues {{
            margin-top: 10px;
            padding: 10px;
            background: #fff3cd;
            border-left: 3px solid #ffc107;
            border-radius: 3px;
        }}

        .critical-issues h4 {{
            color: #856404;
            font-size: 0.9em;
            margin-bottom: 5px;
        }}

        .critical-issues ul {{
            margin-right: 20px;
            color: #856404;
        }}

        .footer {{
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #666;
            font-size: 0.9em;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>דוח בדיקות עוזר הפרמצבט</h1>
            <div class="timestamp">נוצר בתאריך: {timestamp}</div>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>סה"כ תרחישים</h3>
                <div class="value">{len(evaluations)}</div>
            </div>
            <div class="summary-card">
                <h3>עברו בהצלחה</h3>
                <div class="value" style="color: #2ecc71;">{passed}</div>
            </div>
            <div class="summary-card">
                <h3>נכשלו</h3>
                <div class="value" style="color: #e74c3c;">{failed}</div>
            </div>
            <div class="summary-card">
                <h3>אחוז הצלחה</h3>
                <div class="value">{aggregate_scores.get('pass_rate', 0) * 100:.1f}%</div>
            </div>
        </div>

        <div class="metric-scores">
            <h2>ציוני מדדים ממוצעים</h2>
"""

        # Add metric bars
        metrics = {
            "factual_accuracy": "דיוק עובדתי",
            "policy_adherence": "עמידה במדיניות",
            "response_quality": "איכות תגובה",
            "overall_score": "ציון כולל"
        }

        metric_scores = aggregate_scores.get("metric_scores", {})
        for key, label in metrics.items():
            score_data = metric_scores.get(key, {})
            mean_score = score_data.get("mean", 0)
            percentage = mean_score * 100

            html += f"""
            <div class="metric">
                <div class="metric-label">
                    <span>{label}</span>
                    <span>{mean_score:.2f}</span>
                </div>
                <div class="metric-bar">
                    <div class="metric-bar-fill" style="width: {percentage}%;">
                        {percentage:.1f}%
                    </div>
                </div>
            </div>
"""

        html += """
        </div>

        <div class="category-scores">
            <h2>ציונים לפי קטגוריה</h2>
            <div class="category-grid">
"""

        # Add category cards
        category_names = {
            "medication_info": "מידע על תרופות",
            "stock_check": "בדיקת מלאי",
            "ingredient_search": "חיפוש לפי מרכיב",
            "prescription_check": "בדיקת מרשם",
            "policy_violation": "אכיפת מדיניות",
            "user_verification": "אימות משתמש",
            "error_handling": "טיפול בשגיאות",
            "voice_specific": "מיוחד לקול",
            "language_handling": "טיפול בשפה"
        }

        for category, score in category_scores.items():
            category_label = category_names.get(category, category)
            percentage = score * 100

            html += f"""
                <div class="category-card">
                    <h3>{category_label}</h3>
                    <div class="metric-bar">
                        <div class="metric-bar-fill" style="width: {percentage}%;">
                            {score:.2f}
                        </div>
                    </div>
                </div>
"""

        html += """
            </div>
        </div>

        <div class="detailed-results">
            <h2>תוצאות מפורטות</h2>
"""

        # Add detailed results
        for eval_result in valid_evals:
            overall_score = eval_result.get("overall_score", 0)
            passed = overall_score >= 0.7
            badge_class = "pass" if passed else "fail"
            badge_text = "עבר" if passed else "נכשל"
            result_class = "" if passed else "failed"

            critical_issues = eval_result.get("critical_issues", [])

            html += f"""
            <div class="result-item {result_class}">
                <div class="result-header">
                    <h3>{eval_result.get('scenario_id', 'Unknown')}</h3>
                    <span class="badge {badge_class}">{badge_text}</span>
                </div>
                <div class="result-scores">
                    <div class="score-item">
                        <div class="label">דיוק</div>
                        <div class="value">{eval_result.get('factual_accuracy', 0):.2f}</div>
                    </div>
                    <div class="score-item">
                        <div class="label">מדיניות</div>
                        <div class="value">{eval_result.get('policy_adherence', 0):.2f}</div>
                    </div>
                    <div class="score-item">
                        <div class="label">איכות</div>
                        <div class="value">{eval_result.get('response_quality', 0):.2f}</div>
                    </div>
                </div>
"""

            if critical_issues:
                html += """
                <div class="critical-issues">
                    <h4>בעיות קריטיות:</h4>
                    <ul>
"""
                for issue in critical_issues:
                    html += f"                        <li>{issue}</li>\n"

                html += """
                    </ul>
                </div>
"""

            html += """
            </div>
"""

        html += f"""
        </div>

        <div class="footer">
            <p>נוצר על ידי Pharmacy Assistant Test Framework | {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
        </div>
    </div>
</body>
</html>
"""

        return html

    def save_conversation_logs(
        self,
        test_results: List[Dict[str, Any]],
        timestamp: str = None
    ) -> str:
        """
        Save detailed conversation logs.

        Args:
            test_results: List of test results with conversation histories
            timestamp: Log timestamp

        Returns:
            Path to logs directory
        """
        if timestamp is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        logs_subdir = os.path.join(self.logs_dir, timestamp)
        os.makedirs(logs_subdir, exist_ok=True)

        for result in test_results:
            scenario_id = result.get("scenario", {}).get("id", "unknown")
            log_path = os.path.join(logs_subdir, f"{scenario_id}.json")

            with open(log_path, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)

        return logs_subdir

    def generate_all_reports(
        self,
        test_results: List[Dict[str, Any]],
        evaluations: List[Dict[str, Any]],
        aggregate_scores: Dict[str, Any]
    ) -> Dict[str, str]:
        """
        Generate all report formats.

        Args:
            test_results: List of test results
            evaluations: List of evaluations
            aggregate_scores: Aggregate statistics

        Returns:
            Dictionary with paths to generated files
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        paths = {
            "json": self.generate_json_report(evaluations, aggregate_scores, timestamp),
            "csv": self.generate_csv_report(evaluations, timestamp),
            "html": self.generate_html_report(evaluations, aggregate_scores, timestamp),
            "logs": self.save_conversation_logs(test_results, timestamp)
        }

        return paths


def create_reporter(output_dir: str = None) -> ReportGenerator:
    """
    Factory function to create a report generator instance.

    Args:
        output_dir: Directory to save reports

    Returns:
        ReportGenerator instance
    """
    return ReportGenerator(output_dir=output_dir)
