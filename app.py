
import sqlite3
import re
from datetime import datetime
from pathlib import Path

from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

DB_PATH = Path(__file__).parent / "inquiries.db"
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            matter TEXT,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/contact", methods=["POST"])
def contact():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    matter = (data.get("matter") or "").strip()
    message = (data.get("message") or "").strip()

    errors = {}
    if len(name) < 2:
        errors["name"] = "Enter your full name."
    if not EMAIL_RE.match(email):
        errors["email"] = "Enter a valid email address."
    if len(message) < 10:
        errors["message"] = "Tell us a little more about your matter (10+ characters)."

    if errors:
        return jsonify({"ok": False, "errors": errors}), 400

    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO inquiries (name, email, matter, message, created_at) VALUES (?, ?, ?, ?, ?)",
        (name, email, matter, message, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()

    return jsonify({"ok": True, "message": "Received. Our team will respond within one business day."})


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
else:
    init_db()
