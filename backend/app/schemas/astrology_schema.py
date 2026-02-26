from pydantic import BaseModel, ConfigDict
from datetime import date, time, datetime
from typing import Optional, Dict
from uuid import UUID


class BilingualField(BaseModel):
    en: str
    hi: str


class AstroProfileResponse(BaseModel):
    moon_sign:  BilingualField
    sun_sign:   BilingualField
    ascendant:  BilingualField
    nakshatra:  BilingualField
    gana:       BilingualField
    nadi:       BilingualField
    yoni:       BilingualField
    varna:      BilingualField
    tithi:      BilingualField
    manglik:    BilingualField


class ChartBase(BaseModel):
    birth_date: date
    birth_time: time
    latitude: float
    longitude: float

class ChartCreate(ChartBase):
    pass

class ChartResponse(ChartBase):
    id: UUID
    user_id: UUID
    chart_data: Optional[Dict] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MatchResponse(BaseModel):
    score: Dict
    doshas: Dict
    manglik_compatible: bool
    person1_chart: Optional[Dict] = None
    person2_chart: Optional[Dict] = None

    model_config = ConfigDict(from_attributes=True)

class MatchRequest(BaseModel):
    person1: ChartBase
    person2: ChartBase


class AIExplanation(BaseModel):
    """Structured bilingual Hindi explanation from Gemini."""
    summary:          str
    strengths:        str
    concerns:         str
    overall_advice:   str
    muhurta_guidance: str


class EnhancedMatchResponse(BaseModel):
    """Match result with AI explanation attached."""
    score_data:     Dict
    ai_explanation: AIExplanation
    person1_chart:  Optional[Dict] = None
    person2_chart:  Optional[Dict] = None

    model_config = ConfigDict(from_attributes=True)
