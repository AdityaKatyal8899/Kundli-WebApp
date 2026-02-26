from sqlalchemy.orm import Session
from app.models.sqlalchemy_model import User
from app.models.astrology_model import Chart
from app.schemas.astrology_schema import ChartCreate, MatchRequest
from app.core.engine import KundliEngine
from fastapi import HTTPException, status
import uuid

def create_or_update_chart(db: Session, user: User, chart_input: ChartCreate):
    # Prepare birth data for engine
    birth_data = {
        "year": chart_input.birth_date.year,
        "month": chart_input.birth_date.month,
        "day": chart_input.birth_date.day,
        "hour": chart_input.birth_time.hour + (chart_input.birth_time.minute / 60.0),
        "lat": chart_input.latitude,
        "lon": chart_input.longitude
    }
    
    # Generate chart data using engine
    generated_data = KundliEngine.generate_chart(birth_data)
    
    # Check if chart exists
    db_chart = db.query(Chart).filter(Chart.user_id == user.id).first()
    
    if db_chart:
        # Update existing
        db_chart.birth_date = chart_input.birth_date
        db_chart.birth_time = chart_input.birth_time
        db_chart.latitude = chart_input.latitude
        db_chart.longitude = chart_input.longitude
        db_chart.chart_data = generated_data
    else:
        # Create new
        db_chart = Chart(
            user_id=user.id,
            birth_date=chart_input.birth_date,
            birth_time=chart_input.birth_time,
            latitude=chart_input.latitude,
            longitude=chart_input.longitude,
            chart_data=generated_data
        )
        db.add(db_chart)
    
    db.commit()
    db.refresh(db_chart)
    return db_chart

def get_user_chart(db: Session, user: User):
    db_chart = db.query(Chart).filter(Chart.user_id == user.id).first()
    if not db_chart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Astrological chart not found for this user"
        )
    return db_chart

def match_users(db: Session, current_user: User, target_user_id: str):
    # Prevent matching self
    if str(current_user.id) == str(target_user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot match with yourself"
        )
    
    # Fetch charts
    chart1 = db.query(Chart).filter(Chart.user_id == current_user.id).first()
    chart2 = db.query(Chart).filter(Chart.user_id == target_user_id).first()
    
    if not chart1 or not chart2:
        missing = "your" if not chart1 else "target user's"
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chart missing for {missing} profile"
        )
    
    # Call matching engine
    match_result = KundliEngine.match_charts(chart1.chart_data, chart2.chart_data)
    
    # Map engine result to MatchResponse schema
    return {
        "score": {
            "total": match_result["total_score"],
            "max": match_result["max_score"],
            "breakdown": match_result["breakdown"]
        },
        "doshas": {},
        "manglik_compatible": match_result["manglik_status"] == "Balanced",
        "person1_chart": chart1.chart_data,
        "person2_chart": chart2.chart_data
    }

def match_manual_data(data: MatchRequest):
    # Convert input sets to engine format
    def get_engine_body(c):
        return {
            "year": c.birth_date.year,
            "month": c.birth_date.month,
            "day": c.birth_date.day,
            "hour": c.birth_time.hour + (c.birth_time.minute / 60.0),
            "lat": c.latitude,
            "lon": c.longitude
        }
    
    chart1_data = KundliEngine.generate_chart(get_engine_body(data.person1))
    chart2_data = KundliEngine.generate_chart(get_engine_body(data.person2))
    
    match_result = KundliEngine.match_charts(chart1_data, chart2_data)
    
    return {
        "score": {
            "total": match_result["total_score"],
            "max": match_result["max_score"],
            "breakdown": match_result["breakdown"]
        },
        "doshas": {},
        "manglik_compatible": match_result["manglik_status"] == "Balanced",
        "person1_chart": chart1_data,
        "person2_chart": chart2_data
    }
