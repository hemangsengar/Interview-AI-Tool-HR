"""
Interactive Database Viewer - No SQLite CLI needed!
"""
import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = Path("backend/interview.db")

def print_header(title):
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)

def print_table(cursor, max_rows=None):
    """Print query results in a formatted table"""
    rows = cursor.fetchall()
    if not rows:
        print("  (No data)")
        return
    
    # Get column names
    columns = [desc[0] for desc in cursor.description]
    
    # Calculate column widths
    widths = [len(col) for col in columns]
    for row in rows[:max_rows] if max_rows else rows:
        for i, val in enumerate(row):
            widths[i] = max(widths[i], len(str(val)))
    
    # Print header
    header = " | ".join(col.ljust(widths[i]) for i, col in enumerate(columns))
    print("  " + header)
    print("  " + "-" * len(header))
    
    # Print rows
    display_rows = rows[:max_rows] if max_rows else rows
    for row in display_rows:
        row_str = " | ".join(str(val).ljust(widths[i]) for i, val in enumerate(row))
        print("  " + row_str)
    
    if max_rows and len(rows) > max_rows:
        print(f"  ... and {len(rows) - max_rows} more rows")
    
    print(f"\n  Total: {len(rows)} rows")

def view_all_users(conn):
    print_header("HR Users")
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, full_name, created_at FROM users")
    print_table(cursor)

def view_all_jobs(conn):
    print_header("Jobs")
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            id, 
            title, 
            job_code, 
            is_active,
            created_at
        FROM jobs
        ORDER BY created_at DESC
    """)
    print_table(cursor)

def view_all_candidates(conn):
    print_header("Candidates with Interview Results")
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            c.id,
            c.name,
            c.email,
            j.title as job,
            s.final_score,
            s.final_recommendation,
            c.status
        FROM candidates c
        JOIN jobs j ON c.job_id = j.id
        LEFT JOIN interview_sessions s ON c.id = s.candidate_id
        ORDER BY s.final_score DESC
    """)
    print_table(cursor)

def view_interview_stats(conn):
    print_header("Interview Statistics")
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            COUNT(*) as total_interviews,
            ROUND(AVG(final_score), 2) as avg_score,
            COUNT(CASE WHEN final_recommendation = 'Strong' THEN 1 END) as strong,
            COUNT(CASE WHEN final_recommendation = 'Medium' THEN 1 END) as medium,
            COUNT(CASE WHEN final_recommendation = 'Weak' THEN 1 END) as weak,
            COUNT(CASE WHEN final_recommendation = 'Reject' THEN 1 END) as reject
        FROM interview_sessions 
        WHERE status = 'Completed'
    """)
    print_table(cursor)

def view_recent_interviews(conn):
    print_header("Recent Interviews (Last 10)")
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            c.name,
            j.title as job,
            s.final_score,
            s.final_recommendation,
            s.ended_at
        FROM interview_sessions s
        JOIN candidates c ON s.candidate_id = c.id
        JOIN jobs j ON c.job_id = j.id
        WHERE s.status = 'Completed'
        ORDER BY s.ended_at DESC
        LIMIT 10
    """)
    print_table(cursor)

def view_candidate_details(conn, candidate_id):
    print_header(f"Candidate Details (ID: {candidate_id})")
    
    # Basic info
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            c.name,
            c.email,
            j.title as job,
            s.final_score,
            s.final_recommendation,
            s.status,
            s.started_at,
            s.ended_at
        FROM candidates c
        JOIN jobs j ON c.job_id = j.id
        LEFT JOIN interview_sessions s ON c.id = s.candidate_id
        WHERE c.id = ?
    """, (candidate_id,))
    print_table(cursor)
    
    # Questions and answers
    print("\n  Questions & Answers:")
    print("  " + "-" * 68)
    cursor.execute("""
        SELECT 
            q.index,
            q.question_text,
            a.correctness_score,
            a.depth_score,
            a.clarity_score,
            a.relevance_score
        FROM interview_questions q
        JOIN interview_sessions s ON q.session_id = s.id
        LEFT JOIN interview_answers a ON q.id = a.question_id
        WHERE s.candidate_id = ?
        ORDER BY q.index
    """, (candidate_id,))
    
    rows = cursor.fetchall()
    if rows:
        for row in rows:
            idx, question, corr, depth, clar, rel = row
            avg = (corr + depth + clar + rel) / 4 if corr else 0
            print(f"\n  Q{idx}: {question[:60]}...")
            if corr:
                print(f"       Scores: C={corr} D={depth} Cl={clar} R={rel} | Avg={avg:.1f}")
    else:
        print("  (No questions yet)")

def interactive_mode(conn):
    """Interactive query mode"""
    print_header("Interactive SQL Mode")
    print("  Enter SQL queries (or 'exit' to quit)")
    print("  Example: SELECT * FROM jobs;")
    print()
    
    while True:
        try:
            query = input("  SQL> ").strip()
            if query.lower() in ['exit', 'quit', 'q']:
                break
            if not query:
                continue
            
            cursor = conn.cursor()
            cursor.execute(query)
            print_table(cursor, max_rows=20)
        except Exception as e:
            print(f"  Error: {e}")

def main_menu():
    if not DB_PATH.exists():
        print(f"\n❌ Database not found: {DB_PATH}")
        print("   Make sure you're running this from the project root directory")
        return
    
    conn = sqlite3.connect(DB_PATH)
    
    while True:
        print("\n" + "=" * 70)
        print("  📊 DATABASE VIEWER")
        print("=" * 70)
        print("\n  Choose an option:")
        print("    1. View all HR users")
        print("    2. View all jobs")
        print("    3. View all candidates")
        print("    4. View interview statistics")
        print("    5. View recent interviews")
        print("    6. View candidate details (by ID)")
        print("    7. Interactive SQL mode")
        print("    8. Export all data to CSV")
        print("    0. Exit")
        print()
        
        choice = input("  Enter choice: ").strip()
        
        try:
            if choice == '1':
                view_all_users(conn)
            elif choice == '2':
                view_all_jobs(conn)
            elif choice == '3':
                view_all_candidates(conn)
            elif choice == '4':
                view_interview_stats(conn)
            elif choice == '5':
                view_recent_interviews(conn)
            elif choice == '6':
                candidate_id = input("  Enter candidate ID: ").strip()
                view_candidate_details(conn, int(candidate_id))
            elif choice == '7':
                interactive_mode(conn)
            elif choice == '8':
                print("\n  Run: python export_data.py")
            elif choice == '0':
                break
            else:
                print("\n  Invalid choice!")
        except Exception as e:
            print(f"\n  Error: {e}")
        
        input("\n  Press Enter to continue...")
    
    conn.close()
    print("\n  Goodbye! 👋\n")

if __name__ == "__main__":
    main_menu()
