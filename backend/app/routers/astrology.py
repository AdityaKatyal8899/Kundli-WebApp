from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.sqlalchemy_model import User
from app.models.astrology_model import Chart
from app.schemas.astrology_schema import (
    ChartCreate, ChartResponse, MatchResponse, MatchRequest,
    AstroProfileResponse, EnhancedMatchResponse
)
from app.services import astrology_service
from app.services.ai_kundli_service import get_kundli_explanation
from app.oauth2 import get_current_user, get_current_user_optional
from app.core.astrology_labels import build_profile_labels
from typing import Optional

router = APIRouter(
    prefix="/astrology",
    tags=["Astrology"]
)

@router.post("/chart", response_model=ChartResponse)
def create_chart(
    chart_input: ChartCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create or update current user's astrological chart."""
    return astrology_service.create_or_update_chart(db, current_user, chart_input)

@router.get("/chart/profile", response_model=AstroProfileResponse)
def get_my_astro_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Return the current user's bilingual astrological profile
    (moon sign, sun sign, ascendant, nakshatra, gana, nadi, yoni, varna, tithi, manglik).
    """
    db_chart = db.query(Chart).filter(Chart.user_id == current_user.id).first()
    if not db_chart:
        raise HTTPException(status_code=404, detail="No astrological chart found. Please generate your chart first.")
    return build_profile_labels(db_chart.chart_data)

@router.get("/chart/{user_id}/profile", response_model=AstroProfileResponse)
def get_public_astro_profile(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Return any user's bilingual astrological profile (public, no raw ephemeris data exposed).
    """
    db_chart = db.query(Chart).filter(Chart.user_id == user_id).first()
    if not db_chart:
        raise HTTPException(status_code=404, detail="Astrological chart not found for this user.")
    return build_profile_labels(db_chart.chart_data)

@router.get("/chart", response_model=ChartResponse)
def get_chart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return current user's stored chart."""
    return astrology_service.get_user_chart(db, current_user)

@router.post("/match/{user_id}", response_model=MatchResponse)
def match_with_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Match current user with another user's chart."""
    return astrology_service.match_users(db, current_user, user_id)

@router.post("/match-data", response_model=MatchResponse)
def match_manual(
    match_input: MatchRequest,
    current_user: User = Depends(get_current_user)
):
    """Match two sets of birth data manually."""
    return astrology_service.match_manual_data(match_input)


# ── AI-Enhanced Match Endpoints ───────────────────────────────────────────

@router.post("/match/{user_id}/ai", response_model=EnhancedMatchResponse)
async def match_with_user_ai(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Match current user with another user's chart and generate
    a structured Hindi AI explanation via Gemini.
    Returns: { score_data, ai_explanation, person1_chart, person2_chart }
    """
    match_result = astrology_service.match_users(db, current_user, user_id)

    # Build score_data payload for AI service
    breakdown = match_result["score"].get("breakdown", {})
    score_data = {
        "total_score":   match_result["score"]["total"],
        "breakdown":     breakdown,
        "nadi_dosh":     breakdown.get("nadi", 8) == 0,
        "bhakoot_dosh":  breakdown.get("bhakoot", 7) == 0,
    }

    ai_explanation = await get_kundli_explanation(score_data)

    return {
        "score_data":    {**score_data, "max_score": match_result["score"]["max"]},
        "ai_explanation": ai_explanation,
        "person1_chart": match_result.get("person1_chart"),
        "person2_chart": match_result.get("person2_chart"),
    }


@router.post("/match-data/ai", response_model=EnhancedMatchResponse)
async def match_manual_ai(
    match_input: MatchRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Match two sets of birth data manually and generate
    a structured Hindi AI explanation via Gemini.
    Returns: { score_data, ai_explanation, person1_chart, person2_chart }
    """
    match_result = astrology_service.match_manual_data(match_input)

    breakdown = match_result["score"].get("breakdown", {})
    score_data = {
        "total_score":   match_result["score"]["total"],
        "breakdown":     breakdown,
        "nadi_dosh":     breakdown.get("nadi", 8) == 0,
        "bhakoot_dosh":  breakdown.get("bhakoot", 7) == 0,
    }

    ai_explanation = await get_kundli_explanation(score_data)

    return {
        "score_data":    {**score_data, "max_score": match_result["score"]["max"]},
        "ai_explanation": ai_explanation,
        "person1_chart": match_result.get("person1_chart"),
        "person2_chart": match_result.get("person2_chart"),
    }
