import os
import psycopg2
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

DB_URL = os.getenv("SUPABASE_DB_URL")
if not DB_URL:
    print("Error: SUPABASE_DB_URL not found in .env")
    exit(1)

# Migrations directory
MIGRATIONS_DIR = Path(__file__).resolve().parents[1] / "data" / "migrations"


def get_executed_migrations(conn):
    with conn.cursor() as cur:
        # Create history table if not exists
        cur.execute("""
            CREATE TABLE IF NOT EXISTS public._migration_history (
                id serial PRIMARY KEY,
                name text UNIQUE NOT NULL,
                applied_at timestamptz DEFAULT now()
            );
        """)
        conn.commit()

        cur.execute("SELECT name FROM public._migration_history")
        return {row[0] for row in cur.fetchall()}


def run_migrations():
    try:
        conn = psycopg2.connect(DB_URL)
        print("Connected to Database.")
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    executed = get_executed_migrations(conn)

    # Get all sql files, sorted
    files = sorted(MIGRATIONS_DIR.glob("*.sql"))

    for f in files:
        if f.name in executed:
            continue

        print(f"Running migration: {f.name}...")
        try:
            sql = f.read_text(encoding="utf-8")
            with conn.cursor() as cur:
                cur.execute(sql)
                # Record as executed
                cur.execute(
                    "INSERT INTO public._migration_history (name) VALUES (%s)",
                    (f.name,),
                )
            conn.commit()
            print(f"  -> Success.")
        except Exception as e:
            conn.rollback()
            print(f"  -> Failed: {e}")
            break

    conn.close()
    print("Migration run complete.")


if __name__ == "__main__":
    run_migrations()
