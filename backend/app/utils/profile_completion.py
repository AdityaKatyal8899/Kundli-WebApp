"""
Profile Completion Utility
--------------------------
Calculates a deterministic profile completion score (0-100) based on
filled profile fields and whether the user has a primary photo.

This is derived state — never store it in the DB.
It is always computed fresh from current data.
"""

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.sqlalchemy_model import Profile


def calculate_profile_completion(profile: "Profile", has_primary_photo: bool) -> int:
    """
    Calculate profile completion percentage.

    Fields tracked (10 total, each worth 10%):
    1. full_name
    2. education
    3. occupation
    4. salary
    5. community
    6. about (bio)
    7. religion
    8. birth_place (non-placeholder)
    9. birth_time (non-placeholder)
    10. has_primary_photo

    Returns: integer 0–100
    """
    score = 0
    total_fields = 10

    if profile.full_name and profile.full_name.strip():
        score += 1
    if profile.education and profile.education.strip():
        score += 1
    if profile.occupation and profile.occupation.strip():
        score += 1
    if profile.salary and profile.salary > 0:
        score += 1
    if profile.community and profile.community.strip():
        score += 1
    if profile.about and profile.about.strip():
        score += 1
    if profile.religion and profile.religion.strip():
        score += 1
    # birth_place is required but might be auto-set to "Unknown"
    if profile.birth_place and profile.birth_place.strip() and profile.birth_place != "Unknown":
        score += 1
    # birth_time is required but might be auto-set to "12:00"
    if profile.birth_time and profile.birth_time.strip() and profile.birth_time != "12:00":
        score += 1
    if has_primary_photo:
        score += 1

    return int((score / total_fields) * 100)


def is_profile_visible(completion: int) -> bool:
    """
    Placeholder for future search visibility gating.
    Currently not enforced — prepared for future use.
    """
    return completion >= 40
