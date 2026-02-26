"""
Bilingual (English + Hindi) lookup tables for all Kundli astrological fields.
All labels derived from traditional Vedic astrology. No external APIs.
"""

# ── Zodiac Signs (1-indexed, 1=Aries) ─────────────────────────────────────
SIGNS = [
    None,  # 0 padding (signs are 1-12)
    {"en": "Aries",       "hi": "मेष"},
    {"en": "Taurus",      "hi": "वृषभ"},
    {"en": "Gemini",      "hi": "मिथुन"},
    {"en": "Cancer",      "hi": "कर्क"},
    {"en": "Leo",         "hi": "सिंह"},
    {"en": "Virgo",       "hi": "कन्या"},
    {"en": "Libra",       "hi": "तुला"},
    {"en": "Scorpio",     "hi": "वृश्चिक"},
    {"en": "Sagittarius", "hi": "धनु"},
    {"en": "Capricorn",   "hi": "मकर"},
    {"en": "Aquarius",    "hi": "कुंभ"},
    {"en": "Pisces",      "hi": "मीन"},
]

# ── Nakshatras (0-indexed, 0=Ashwini … 26=Revati) ─────────────────────────
NAKSHATRAS = [
    {"en": "Ashwini",      "hi": "अश्विनी"},
    {"en": "Bharani",      "hi": "भरणी"},
    {"en": "Krittika",     "hi": "कृत्तिका"},
    {"en": "Rohini",       "hi": "रोहिणी"},
    {"en": "Mrigashira",   "hi": "मृगशिरा"},
    {"en": "Ardra",        "hi": "आर्द्रा"},
    {"en": "Punarvasu",    "hi": "पुनर्वसु"},
    {"en": "Pushya",       "hi": "पुष्य"},
    {"en": "Ashlesha",     "hi": "अश्लेषा"},
    {"en": "Magha",        "hi": "मघा"},
    {"en": "Purva Phalguni","hi": "पूर्व फाल्गुनी"},
    {"en": "Uttara Phalguni","hi": "उत्तर फाल्गुनी"},
    {"en": "Hasta",        "hi": "हस्त"},
    {"en": "Chitra",       "hi": "चित्रा"},
    {"en": "Swati",        "hi": "स्वाती"},
    {"en": "Vishakha",     "hi": "विशाखा"},
    {"en": "Anuradha",     "hi": "अनुराधा"},
    {"en": "Jyeshtha",     "hi": "ज्येष्ठा"},
    {"en": "Mula",         "hi": "मूल"},
    {"en": "Purva Ashadha","hi": "पूर्वाषाढ़"},
    {"en": "Uttara Ashadha","hi": "उत्तराषाढ़"},
    {"en": "Shravana",     "hi": "श्रावण"},
    {"en": "Dhanishtha",   "hi": "धनिष्ठा"},
    {"en": "Shatabhisha",  "hi": "शतभिषा"},
    {"en": "Purva Bhadrapada","hi": "पूर्व भाद्रपद"},
    {"en": "Uttara Bhadrapada","hi": "उत्तर भाद्रपद"},
    {"en": "Revati",       "hi": "रेवती"},
]

# ── Gana (0=Deva, 1=Manushya, 2=Rakshasa) ─────────────────────────────────
GANA = [
    {"en": "Deva",     "hi": "देव"},
    {"en": "Manushya", "hi": "मनुष्य"},
    {"en": "Rakshasa", "hi": "राक्षस"},
]

# ── Nadi (0=Adi, 1=Madhya, 2=Antya) ──────────────────────────────────────
NADI = [
    {"en": "Adi",    "hi": "आदि"},
    {"en": "Madhya", "hi": "मध्य"},
    {"en": "Antya",  "hi": "अन्त्य"},
]

# ── Yoni (0-13, animal symbols) ───────────────────────────────────────────
YONI = [
    {"en": "Horse",    "hi": "अश्व"},
    {"en": "Elephant", "hi": "गज"},
    {"en": "Sheep",    "hi": "मेष"},
    {"en": "Serpent",  "hi": "सर्प"},
    {"en": "Dog",      "hi": "श्वान"},
    {"en": "Cat",      "hi": "मार्जार"},
    {"en": "Rat",      "hi": "मूषक"},
    {"en": "Cow",      "hi": "गाय"},
    {"en": "Buffalo",  "hi": "महिष"},
    {"en": "Tiger",    "hi": "व्याघ्र"},
    {"en": "Hare",     "hi": "मृग"},
    {"en": "Monkey",   "hi": "वानर"},
    {"en": "Lion",     "hi": "सिंह"},
    {"en": "Mongoose", "hi": "नकुल"},
]

# ── Varna (derived from moon sign) ────────────────────────────────────────
# Water signs (4,8,12) → Brahmin, Fire (1,5,9) → Kshatriya,
# Earth (2,6,10) → Vaishya, Air (3,7,11) → Shudra
def get_varna(moon_sign: int) -> dict:
    if moon_sign in [4, 8, 12]:
        return {"en": "Brahmin",   "hi": "ब्राह्मण"}
    elif moon_sign in [1, 5, 9]:
        return {"en": "Kshatriya", "hi": "क्षत्रिय"}
    elif moon_sign in [2, 6, 10]:
        return {"en": "Vaishya",   "hi": "वैश्य"}
    else:
        return {"en": "Shudra",    "hi": "शूद्र"}

# ── Tithi (1-30, from moon-sun longitude difference) ──────────────────────
_PAKSHA_EN = ["Shukla Paksha", "Krishna Paksha"]
_PAKSHA_HI = ["शुक्ल पक्ष", "कृष्ण पक्ष"]

_TITHI_NAMES_EN = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima / Amavasya"
]
_TITHI_NAMES_HI = [
    "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी",
    "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
    "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "पूर्णिमा / अमावस्या"
]

def get_tithi(moon_lon: float, sun_lon: float) -> dict:
    """Calculate tithi from moon and sun sidereal longitudes."""
    diff = (moon_lon - sun_lon) % 360
    tithi_num = int(diff / 12)         # 0-29
    paksha_idx = 0 if tithi_num < 15 else 1
    day_idx = tithi_num % 15           # 0-14 within paksha
    en = f"{_PAKSHA_EN[paksha_idx]} {_TITHI_NAMES_EN[day_idx]}"
    hi = f"{_PAKSHA_HI[paksha_idx]} {_TITHI_NAMES_HI[day_idx]}"
    return {"en": en, "hi": hi}


def get_manglik(is_manglik: bool) -> dict:
    return (
        {"en": "Yes", "hi": "हाँ"} if is_manglik
        else {"en": "No", "hi": "नहीं"}
    )


def build_profile_labels(chart_data: dict) -> dict:
    """
    Convert raw engine chart_data (indices) into a fully structured bilingual dict.
    This is the single source of truth for the /astrology/chart/profile response.
    """
    moon_sign_idx   = chart_data["moon_sign"]        # 1-12
    asc_sign_idx    = chart_data["asc_sign"]          # 1-12
    sun_sign_idx    = chart_data["planet_positions"]["Sun"]["sign"]  # 1-12
    nak_idx         = chart_data["nakshatra_index"]   # 0-26
    gana_idx        = chart_data["gana"]              # 0-2
    nadi_idx        = chart_data["nadi"]              # 0-2
    yoni_idx        = chart_data["yoni"]              # 0-13
    is_manglik      = chart_data["is_manglik"]        # bool

    moon_lon = chart_data["planet_positions"]["Moon"]["lon"]
    sun_lon  = chart_data["planet_positions"]["Sun"]["lon"]

    return {
        "moon_sign":  SIGNS[moon_sign_idx],
        "sun_sign":   SIGNS[sun_sign_idx],
        "ascendant":  SIGNS[asc_sign_idx],
        "nakshatra":  NAKSHATRAS[nak_idx],
        "gana":       GANA[gana_idx],
        "nadi":       NADI[nadi_idx],
        "yoni":       YONI[yoni_idx],
        "varna":      get_varna(moon_sign_idx),
        "tithi":      get_tithi(moon_lon, sun_lon),
        "manglik":    get_manglik(is_manglik),
    }
