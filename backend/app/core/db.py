"""
SQLite Database Engine for Fyte.
Manages users, authentication records, and category budget allocations.
"""
import os
import sqlite3
import hashlib
import shutil
from typing import Optional, Dict, Any, List
from backend.app.core.config import settings

DB_PATH = os.path.join(settings.BASE_DIR, "data", "fyte.db")
OLD_DB_PATH = os.path.join(settings.BASE_DIR, "data", "spendwise.db")

# Seamless migration if old database file exists
if os.path.exists(OLD_DB_PATH) and not os.path.exists(DB_PATH):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    shutil.copy2(OLD_DB_PATH, DB_PATH)

def get_connection() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str, salt: str = "fyte_secure_salt_2026") -> str:
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Check current salt
    if hash_password(plain_password, "fyte_secure_salt_2026") == hashed_password:
        return True
    # Fallback to legacy salt for existing sessions
    if hash_password(plain_password, "spendwise_secure_salt_2026") == hashed_password:
        return True
    return False

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Financial Analyst',
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 2. Category Budgets table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT UNIQUE NOT NULL,
        monthly_limit REAL NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 3. Seed / Update Demo Users
    cursor.execute("SELECT id FROM users WHERE email = 'admin@fyte.ai'")
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO users (name, email, hashed_password, role, avatar) VALUES (?, ?, ?, ?, ?)",
            ("Dr. Alex Morgan", "admin@fyte.ai", hash_password("admin123"), "Chief Data Scientist", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
        )
    else:
        cursor.execute("UPDATE users SET hashed_password = ? WHERE email = 'admin@fyte.ai'", (hash_password("admin123"),))

    cursor.execute("SELECT id FROM users WHERE email = 'student@college.edu'")
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO users (name, email, hashed_password, role, avatar) VALUES (?, ?, ?, ?, ?)",
            ("Aarav Sharma", "student@college.edu", hash_password("student123"), "ML Project Evaluator", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150")
        )
    else:
        cursor.execute("UPDATE users SET hashed_password = ? WHERE email = 'student@college.edu'", (hash_password("student123"),))

    cursor.execute("SELECT id FROM users WHERE email = 'admin@spendwise.ai'")
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO users (name, email, hashed_password, role, avatar) VALUES (?, ?, ?, ?, ?)",
            ("Dr. Alex Morgan", "admin@spendwise.ai", hash_password("admin123"), "Chief Data Scientist", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
        )
    else:
        cursor.execute("UPDATE users SET hashed_password = ? WHERE email = 'admin@spendwise.ai'", (hash_password("admin123"),))
        
    # 4. Seed Default Budgets
    cursor.execute("SELECT COUNT(*) as cnt FROM budgets")
    budget_count = cursor.fetchone()['cnt']
    if budget_count == 0:
        default_budgets = [
            ("Food", 8000.0),
            ("Shopping", 10000.0),
            ("Transport", 3000.0),
            ("Utilities", 3000.0),
            ("Entertainment", 2500.0),
            ("Health", 3500.0),
        ]
        cursor.executemany(
            "INSERT INTO budgets (category, monthly_limit) VALUES (?, ?)",
            default_budgets
        )
        
    conn.commit()
    conn.close()

# Auto-initialize on module load
init_db()
