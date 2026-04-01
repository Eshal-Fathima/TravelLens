"""
LLM Explainer Module (FIXED + IMPROVED)

Clean, non-generic explanations using Ollama (Mistral).
"""

import logging
import requests
from typing import List, Dict, Any, Optional
from .interest_builder import get_top_interests

logger = logging.getLogger(__name__)


class LLMExplainer:

    def __init__(self, model_name: str = "mistral", ollama_url: str = "http://localhost:11434"):
        self.model_name = model_name
        self.ollama_url = ollama_url.rstrip('/')
        self.api_endpoint = f"{self.ollama_url}/api/generate"

    def _check_ollama_connection(self) -> bool:
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False

    def _generate_with_ollama(self, prompt: str) -> Optional[str]:
        try:
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.4,  # 🔥 LOWER = less hallucination
                    "max_tokens": 60
                }
            }

            response = requests.post(
                self.api_endpoint,
                json=payload,
                timeout=20,
                headers={"Content-Type": "application/json"}
            )

            if response.status_code == 200:
                return response.json().get("response", "").strip()

        except Exception as e:
            logger.error(f"Ollama error: {str(e)}")

        return None

    def generate_explanation(
        self,
        user_interests: List[str],
        place_name: str,
        category: str = "",
        tags: List[str] = None
    ) -> str:

        try:
            tags = tags or []

            interests_text = ", ".join(user_interests[:4]) if user_interests else "travel"
            tags_text = ", ".join(tags[:3]) if tags else category.lower()

            # 🔥 NEW STRONG PROMPT
            prompt = f"""
You are a travel recommendation assistant.

User interests: {interests_text}
Place: {place_name}
Category: {category}
Tags: {tags_text}

Write ONE short natural sentence explaining why this place matches the user.

RULES:
- Use ONLY the given interests/tags/category
- DO NOT mention history unless explicitly relevant
- DO NOT use generic phrases
- Keep it under 20 words
- Make it sound human

Example:
"You may enjoy this place because it matches your interest in shopping and lively environments."

Now generate:
"""

            if self._check_ollama_connection():
                result = self._generate_with_ollama(prompt)
                if result:
                    return self._clean(result)

            # fallback
            return self._fallback(user_interests, place_name, category, tags)

        except Exception as e:
            logger.error(f"Explanation error: {str(e)}")
            return f"{place_name} matches your travel interests."

    def _clean(self, text: str) -> str:
        text = " ".join(text.split())
        text = text.strip('"\'')
        return text

    def _fallback(self, interests, place_name, category, tags):
        base = tags if tags else interests

        if base:
            return f"You may enjoy {place_name} as it aligns with your interest in {', '.join(base[:2])}."

        return f"{place_name} is a great match for your travel preferences."


# GLOBAL INSTANCE
_explainer = None


def get_explainer() -> LLMExplainer:
    global _explainer
    if _explainer is None:
        _explainer = LLMExplainer()
    return _explainer


def generate_explanation(user_id: int, place_name: str, category: str = "", tags: List[str] = None) -> str:
    try:
        top_interests = get_top_interests(user_id, limit=5)
        interests = [i for i, _ in top_interests]

        explainer = get_explainer()
        return explainer.generate_explanation(interests, place_name, category, tags)

    except Exception as e:
        logger.error(f"Explain error: {str(e)}")
        return f"{place_name} matches your travel interests."


def generate_batch_explanations(recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    try:
        explainer = get_explainer()

        for rec in recommendations:
            user_id = rec.get('user_id')
            place_name = rec.get('place')
            category = rec.get('category', "")
            tags = rec.get('tags', [])

            if user_id:
                top_interests = get_top_interests(user_id, limit=5)
                interests = [i for i, _ in top_interests]

                rec['reason'] = explainer.generate_explanation(
                    interests,
                    place_name,
                    category,
                    tags
                )
            else:
                rec['reason'] = f"{place_name} is a great destination."

        return recommendations

    except Exception as e:
        logger.error(f"Batch explanation error: {str(e)}")
        return recommendations