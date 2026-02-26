"""
AI Kundli Explanation Service — Google Gemini API Integration
=============================================================
- Generates structured Hindi kundli match explanations
- Strict JSON output validated before return
- In-memory cache keyed by (total_score + dosh flags)
- Graceful fallback if Gemini fails — never crashes
- No user input passed unfiltered to the model
- GEMINI_API_KEY read from environment only
"""

import os
import json
import hashlib
import logging
from typing import Dict, Optional

import httpx

logger = logging.getLogger(__name__)

# ── Configuration ──────────────────────────────────────────────────────────
GEMINI_API_KEY   = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL     = "gemini-1.5-flash"
GEMINI_URL       = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent"
)
GEMINI_TIMEOUT   = 15   # seconds — fail fast
MAX_OUTPUT_TOKENS = 600

# ── In-memory cache {cache_key: dict} ─────────────────────────────────────
_EXPLANATION_CACHE: Dict[str, dict] = {}

# ── System prompt (verbatim from spec) ────────────────────────────────────
_SYSTEM_INSTRUCTION = (
    "You are a Vedic astrology compatibility assistant. "
    "Explain kundli matching results in simple Hindi. "
    "Do not make deterministic future predictions. "
    "Avoid fear-based or negative extreme language. "
    "Be practical, balanced, and culturally respectful. "
    "Provide advisory insights only."
)

# ── Fallback templates per tone ────────────────────────────────────────────
_FALLBACK = {
    "very_positive": {
        "summary": "दोनों जातकों की कुंडली में बहुत अच्छी अनुकूलता पाई गई है।",
        "strengths": "गुण मिलान अत्यंत शुभ है। मानसिक, भावनात्मक और व्यावहारिक स्तर पर अच्छा सामंजस्य है।",
        "concerns": "कोई विशेष चिंता नहीं। पारस्परिक सम्मान बनाए रखें।",
        "overall_advice": "यह मिलान बहुत शुभ है। परिवार और विशेषज्ञ से परामर्श लेकर आगे बढ़ें।",
        "muhurta_guidance": "किसी ज्योतिषाचार्य से विवाह के लिए शुभ मुहूर्त निकलवाएं।",
    },
    "positive": {
        "summary": "कुंडली मिलान संतोषजनक है। दोनों के बीच अच्छा तालमेल है।",
        "strengths": "अधिकांश कूटों में सकारात्मक अनुकूलता है।",
        "concerns": "कुछ क्षेत्रों में थोड़ा ध्यान देने की आवश्यकता हो सकती है।",
        "overall_advice": "यह मिलान अच्छा है। परस्पर समझ और संवाद पर ध्यान दें।",
        "muhurta_guidance": "विवाह से पहले किसी ज्योतिष विशेषज्ञ से परामर्श लें।",
    },
    "neutral": {
        "summary": "कुंडली मिलान औसत श्रेणी में है। कुछ बातों पर विचार-विमर्श आवश्यक है।",
        "strengths": "कुछ कूटों में अनुकूलता है जो रिश्ते को स्थिर बना सकती है।",
        "concerns": "कुछ क्षेत्रों में ध्यान देना और खुलकर बात करना लाभदायक होगा।",
        "overall_advice": "परिवार और किसी योग्य ज्योतिषी से परामर्श अवश्य लें।",
        "muhurta_guidance": "शुभ मुहूर्त और पारंपरिक उपायों के बारे में विशेषज्ञ से मार्गदर्शन लें।",
    },
    "cautious": {
        "summary": "कुंडली मिलान में कुछ विशेष बिंदुओं पर ध्यान देना उचित होगा।",
        "strengths": "रिश्ते में आपसी समझ और प्रयास से सामंजस्य बनाया जा सकता है।",
        "concerns": "किसी योग्य ज्योतिष विशेषज्ञ से विस्तृत परामर्श लेना उचित होगा।",
        "overall_advice": "अंतिम निर्णय से पहले परिवार और विशेषज्ञ का मार्गदर्शन अवश्य लें।",
        "muhurta_guidance": "यदि आगे बढ़ने का निर्णय लें तो पारंपरिक उपायों और शुभ मुहूर्त का पालन करें।",
    },
}

_REQUIRED_KEYS = {"summary", "strengths", "concerns", "overall_advice", "muhurta_guidance"}


def _get_tone(score: int) -> str:
    if score >= 30:
        return "very_positive"
    elif score >= 24:
        return "positive"
    elif score >= 18:
        return "neutral"
    return "cautious"


def _cache_key(score_data: dict) -> str:
    """Deterministic cache key from score totals and dosh flags."""
    relevant = {
        "t": score_data.get("total_score", 0),
        "bd": bool(score_data.get("bhakoot_dosh", False)),
        "nd": bool(score_data.get("nadi_dosh", False)),
        # Including individual koot scores for uniqueness
        "b": score_data.get("breakdown", {}),
    }
    return hashlib.md5(json.dumps(relevant, sort_keys=True).encode()).hexdigest()


def _build_prompt(score_data: dict) -> str:
    total         = score_data.get("total_score", 0)
    breakdown     = score_data.get("breakdown", {})
    nadi_dosh     = score_data.get("nadi_dosh", False)
    bhakoot_dosh  = score_data.get("bhakoot_dosh", False)
    tone          = _get_tone(total)

    tone_instructions = {
        "very_positive": "अत्यंत सकारात्मक और उत्साहजनक भाषा प्रयोग करें।",
        "positive":      "सकारात्मक और संतुलित भाषा प्रयोग करें।",
        "neutral":       "व्यावहारिक और तटस्थ भाषा प्रयोग करें।",
        "cautious":      "सम्मानजनक और सावधान, लेकिन चिंताजनक नहीं, भाषा प्रयोग करें।",
    }

    dosh_note = ""
    if nadi_dosh:
        dosh_note += "\nनाड़ी दोष परिलक्षित है — इसे सौम्य तरीके से बताएं और पारंपरिक उपायों का सुझाव दें।"
    if bhakoot_dosh:
        dosh_note += "\nभकूट दोष परिलक्षित है — इसे सौम्य तरीके से बताएं और विशेषज्ञ परामर्श सुझाएं।"

    breakdown_text = "\n".join(
        f"  - {k.capitalize()}: {v}"
        for k, v in breakdown.items()
    )

    return f"""
कुंडली मिलान के आधार पर Hindi में एक structured JSON explanation बनाएं।

डेटा:
- कुल गुण मिलान: {total}/36
- कूट विवरण:
{breakdown_text}
- नाड़ी दोष: {"हाँ" if nadi_dosh else "नहीं"}
- भकूट दोष: {"हाँ" if bhakoot_dosh else "नहीं"}

निर्देश:
- {tone_instructions[tone]}
- भविष्य के बारे में निश्चित बात न करें।
- मृत्यु, विच्छेद, या नकारात्मक भविष्यवाणी का उल्लेख न करें।{dosh_note}

केवल इस exact JSON structure में उत्तर दें (कोई markdown नहीं, कोई extra text नहीं):
{{
  "summary": "<2-3 वाक्य में कुल मिलान का निष्कर्ष>",
  "strengths": "<मुख्य अनुकूलताएं>",
  "concerns": "<सौम्य ध्यान देने योग्य बातें>",
  "overall_advice": "<व्यावहारिक सलाह>",
  "muhurta_guidance": "<विवाह मुहूर्त पर सुझाव>"
}}
""".strip()


def _parse_gemini_response(raw_text: str) -> Optional[dict]:
    """Extract and validate JSON from Gemini's response text."""
    text = raw_text.strip()
    # Strip potential markdown code fences
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        # Try to find first { ... } block
        start = text.find("{")
        end   = text.rfind("}") + 1
        if start == -1 or end == 0:
            return None
        try:
            parsed = json.loads(text[start:end])
        except json.JSONDecodeError:
            return None

    # Validate required keys
    if not _REQUIRED_KEYS.issubset(parsed.keys()):
        return None

    # Ensure all values are strings
    return {k: str(v) for k, v in parsed.items() if k in _REQUIRED_KEYS}


async def get_kundli_explanation(score_data: dict) -> dict:
    """
    Main entry point — returns structured bilingual AI explanation.
    Always returns a valid dict; never raises.

    score_data must contain:
      total_score (int), breakdown (dict), nadi_dosh (bool), bhakoot_dosh (bool)
    """
    tone = _get_tone(score_data.get("total_score", 0))

    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not set — returning fallback explanation.")
        return _FALLBACK[tone]

    key = _cache_key(score_data)
    if key in _EXPLANATION_CACHE:
        logger.info("Returning cached Gemini explanation.")
        return _EXPLANATION_CACHE[key]

    prompt = _build_prompt(score_data)

    payload = {
        "system_instruction": {"parts": [{"text": _SYSTEM_INSTRUCTION}]},
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "maxOutputTokens": MAX_OUTPUT_TOKENS,
            "temperature": 0.4,
            "topP": 0.9,
        },
        "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT",       "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH",      "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT","threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT","threshold": "BLOCK_NONE"},
        ],
    }

    try:
        async with httpx.AsyncClient(timeout=GEMINI_TIMEOUT) as client:
            resp = await client.post(
                GEMINI_URL,
                json=payload,
                params={"key": GEMINI_API_KEY},
                headers={"Content-Type": "application/json"},
            )
            resp.raise_for_status()
            data = resp.json()

        raw_text = (
            data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
        )

        parsed = _parse_gemini_response(raw_text)

        if parsed is None:
            logger.warning("Gemini returned unparseable response — using fallback.")
            return _FALLBACK[tone]

        _EXPLANATION_CACHE[key] = parsed
        return parsed

    except httpx.TimeoutException:
        logger.warning("Gemini API timed out — using fallback.")
    except httpx.HTTPStatusError as e:
        logger.error("Gemini API HTTP error %s: %s", e.response.status_code, e.response.text)
    except Exception as e:
        logger.exception("Unexpected error calling Gemini: %s", e)

    return _FALLBACK[tone]
