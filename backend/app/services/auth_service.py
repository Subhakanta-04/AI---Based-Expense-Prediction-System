"""
Authentication Service for Fyte.
Handles registration, login verification, and token sessions.
"""
import base64
import json
import time
from typing import Optional, Dict, Any
from backend.app.core.db import get_connection, hash_password, verify_password

class AuthService:
    def register(self, name: str, email: str, password: str, role: str = "Financial Analyst") -> Dict[str, Any]:
        email = email.strip().lower()
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            conn.close()
            raise ValueError("An account with this email address already exists.")
            
        hashed = hash_password(password)
        avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        cursor.execute(
            "INSERT INTO users (name, email, hashed_password, role, avatar) VALUES (?, ?, ?, ?, ?)",
            (name.strip(), email, hashed, role, avatar)
        )
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        user_dict = {
            "id": user_id,
            "name": name.strip(),
            "email": email,
            "role": role,
            "avatar": avatar
        }
        token = self._create_token(user_dict)
        return {
            "user": user_dict,
            "token": token
        }

    def login(self, email: str, password: str) -> Dict[str, Any]:
        email = email.strip().lower()
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, name, email, hashed_password, role, avatar FROM users WHERE email = ?", 
            (email,)
        )
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            raise ValueError("Invalid email or password.")
            
        if not verify_password(password, row['hashed_password']):
            raise ValueError("Invalid email or password.")
            
        user_dict = {
            "id": row['id'],
            "name": row['name'],
            "email": row['email'],
            "role": row['role'],
            "avatar": row['avatar']
        }
        token = self._create_token(user_dict)
        return {
            "user": user_dict,
            "token": token
        }

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        try:
            payload_str = base64.b64decode(token.encode('utf-8')).decode('utf-8')
            payload = json.loads(payload_str)
            if payload.get("exp", 0) < time.time():
                return None
            return payload.get("user")
        except Exception:
            return None

    def _create_token(self, user: Dict[str, Any]) -> str:
        # Token valid for 7 days
        payload = {
            "user": user,
            "exp": time.time() + (7 * 24 * 3600),
            "iat": time.time()
        }
        payload_bytes = json.dumps(payload).encode('utf-8')
        return base64.b64encode(payload_bytes).decode('utf-8')

auth_service = AuthService()
