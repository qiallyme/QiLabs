import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager


class Database:
    def __init__(self):
        self.db_url = os.getenv("SUPABASE_DB_URL")
        # Fallback for local development if SUPABASE_DB_URL is problematic,
        # but locally we usually want to connect to remote or local DB.
        # Ensure your .env has SUPABASE_DB_URL.

    def get_connection(self):
        if not self.db_url:
            raise ValueError("SUPABASE_DB_URL is not set")
        return psycopg2.connect(self.db_url)

    @contextmanager
    def cursor(self):
        """Yields a cursor from a fresh connection."""
        conn = self.get_connection()
        try:
            yield conn.cursor(cursor_factory=RealDictCursor)
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def fetch_one(self, sql, params=None):
        with self.cursor() as cur:
            cur.execute(sql, params)
            return cur.fetchone()

    def fetch_all(self, sql, params=None):
        with self.cursor() as cur:
            cur.execute(sql, params)
            return cur.fetchall()

    def execute(self, sql, params=None):
        with self.cursor() as cur:
            cur.execute(sql, params)
            return cur.rowcount


db = Database()
