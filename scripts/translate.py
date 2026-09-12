#!/usr/bin/env python3
"""
Groq-basierte Übersetzung für Annie's Animal Tales
Übersetzt deutsche Blog-Beiträge automatisch ins Englische
"""

import os
import json
import yaml
from pathlib import Path
from datetime import datetime
import requests
import subprocess

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
POSTS_DIR = Path("docs/_posts")
POSTS_EN_DIR = Path("docs/_posts/en")

if not GROQ_API_KEY:
    print("❌ GROQ_API_KEY nicht gefunden. Überspring Translation.")
    exit(0)

POSTS_EN_DIR.mkdir(parents=True, exist_ok=True)

def get_new_posts():
    """Finde neue/geänderte deutsche Beiträge"""
    try:
        result = subprocess.run(
            ["git", "diff", "HEAD~1", "--name-only"],
            capture_output=True, text=True, cwd="."
        )
        changed_files = result.stdout.strip().split("\n")
        new_posts = [f for f in changed_files if f.startswith("docs/_posts/") and f.endswith(".md")]
        return new_posts
    except:
        return []

def translate_with_groq(text: str, language: str = "English") -> str:
    """Übersetze Text mit Groq API"""
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {
                "role": "user",
                "content": f"Übersetze ins {language}:\n\n{text}"
            }
        ],
        "temperature": 0.7,
        "max_tokens": 2000
    }
    
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"⚠️  Groq Fehler: {e}")
        return text

def process_post(post_path: str):
    """Verarbeite einen Blog-Beitrag"""
    with open(post_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if not content.startswith("---"):
        return
    
    parts = content.split("---", 2)
    if len(parts) < 3:
        return
    
    frontmatter_str = parts[1]
    body = parts[2].strip()
    
    frontmatter = yaml.safe_load(frontmatter_str)
    
    print(f"📖 Übersetze: {frontmatter.get('title', 'Unknown')}")
    
    frontmatter["title"] = translate_with_groq(frontmatter["title"])
    if "description" in frontmatter:
        frontmatter["description"] = translate_with_groq(frontmatter["description"])
    
    translated_body = translate_with_groq(body)
    
    filename = Path(post_path).name
    en_path = POSTS_EN_DIR / filename
    
    new_frontmatter = yaml.dump(frontmatter, allow_unicode=True, default_flow_style=False)
    new_content = f"---\n{new_frontmatter}---\n\n{translated_body}"
    
    with open(en_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print(f"✅ EN: {en_path}")

def main():
    new_posts = get_new_posts()
    if not new_posts:
        print("ℹ️  Keine neuen Beiträge.")
        return
    print(f"🌍 Übersetze {len(new_posts)} Beiträge...")
    for post in new_posts:
        try:
            process_post(post)
        except Exception as e:
            print(f"❌ {post}: {e}")

if __name__ == "__main__":
    main()
