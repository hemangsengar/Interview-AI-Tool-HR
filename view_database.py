"""
View all data from PostgreSQL database.
Run: python view_database.py
"""
import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from tabulate import tabulate

# Database URL
DATABASE_URL = "postgresql://interview_user:z3WjOmLZhr6HVfnYwpQA4OlTpqvEIxrN@dpg-d4nc22buibrs739a1vs0-a.oregon-postgres.render.com/interview_db_cy4i"

def view_database():
    """View all tables and their data."""
    try:
        # Create engine
        engine = create_engine(DATABASE_URL)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Get inspector
        inspector = inspect(engine)
        
        # Get all table names
        tables = inspector.get_table_names()
        
        print("=" * 80)
        print("DATABASE CONTENTS")
        print("=" * 80)
        print(f"\nFound {len(tables)} tables: {', '.join(tables)}\n")
        
        # View each table
        for table_name in tables:
            print("\n" + "=" * 80)
            print(f"TABLE: {table_name}")
            print("=" * 80)
            
            # Get column names
            columns = [col['name'] for col in inspector.get_columns(table_name)]
            
            # Query all rows
            query = text(f"SELECT * FROM {table_name}")
            result = session.execute(query)
            rows = result.fetchall()
            
            if rows:
                # Convert to list of dicts for better display
                data = []
                for row in rows:
                    data.append(dict(zip(columns, row)))
                
                # Print table
                print(f"\nTotal rows: {len(rows)}\n")
                print(tabulate(data, headers="keys", tablefmt="grid"))
            else:
                print("\n(No data)")
        
        session.close()
        print("\n" + "=" * 80)
        print("END OF DATABASE")
        print("=" * 80)
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Check if tabulate is installed
    try:
        import tabulate
    except ImportError:
        print("Installing tabulate...")
        os.system("pip install tabulate")
        import tabulate
    
    view_database()
