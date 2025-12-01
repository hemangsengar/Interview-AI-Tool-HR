"""
Export all database data to CSV files for easy viewing in Excel
"""
import sqlite3
import csv
from pathlib import Path
from datetime import datetime

# Database path
DB_PATH = Path("backend/interview.db")
OUTPUT_DIR = Path("database_exports")
OUTPUT_DIR.mkdir(exist_ok=True)

def export_table_to_csv(db_path, table_name, output_dir):
    """Export a single table to CSV"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all data from table
    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()
    
    # Get column names
    column_names = [description[0] for description in cursor.description]
    
    # Write to CSV
    output_file = output_dir / f"{table_name}.csv"
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(column_names)
        writer.writerows(rows)
    
    conn.close()
    print(f"✓ Exported {table_name}: {len(rows)} rows → {output_file}")
    return len(rows)

def export_custom_report(db_path, output_dir):
    """Export a custom interview report"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    query = """
    SELECT 
        c.name as candidate_name,
        c.email as candidate_email,
        j.title as job_title,
        j.job_code,
        s.status as interview_status,
        s.final_score,
        s.final_recommendation,
        s.started_at,
        s.ended_at,
        c.status as candidate_status,
        COUNT(q.id) as total_questions,
        COUNT(a.id) as total_answers
    FROM candidates c
    LEFT JOIN jobs j ON c.job_id = j.id
    LEFT JOIN interview_sessions s ON c.id = s.candidate_id
    LEFT JOIN interview_questions q ON s.id = q.session_id
    LEFT JOIN interview_answers a ON q.id = a.question_id
    GROUP BY c.id
    ORDER BY s.ended_at DESC
    """
    
    cursor.execute(query)
    rows = cursor.fetchall()
    column_names = [description[0] for description in cursor.description]
    
    output_file = output_dir / "interview_report.csv"
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(column_names)
        writer.writerows(rows)
    
    conn.close()
    print(f"✓ Exported custom report: {len(rows)} rows → {output_file}")

def main():
    print("=" * 60)
    print("  Database Export Tool")
    print("=" * 60)
    print()
    
    if not DB_PATH.exists():
        print(f"❌ Database not found: {DB_PATH}")
        return
    
    # Get all tables
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [row[0] for row in cursor.fetchall()]
    conn.close()
    
    print(f"Found {len(tables)} tables in database")
    print()
    
    # Export each table
    total_rows = 0
    for table in tables:
        if table != 'sqlite_sequence':  # Skip internal SQLite table
            rows = export_table_to_csv(DB_PATH, table, OUTPUT_DIR)
            total_rows += rows
    
    print()
    print("Exporting custom reports...")
    export_custom_report(DB_PATH, OUTPUT_DIR)
    
    print()
    print("=" * 60)
    print(f"✓ Export complete!")
    print(f"  Total rows exported: {total_rows}")
    print(f"  Output directory: {OUTPUT_DIR.absolute()}")
    print("=" * 60)
    print()
    print("You can now open the CSV files in Excel or any spreadsheet app!")

if __name__ == "__main__":
    main()
