from fastapi import APIRouter

from .health import router as health_router
from .survey import router as survey_router
from .survey_question import router as survey_question_router
from .survey_response import router as survey_response_router
from .survey_response_conversation import router as survey_response_conversation_router

api_router = APIRouter()

api_router.include_router(health_router, prefix="/health", tags=["health"])
api_router.include_router(survey_router, prefix="/surveys", tags=["surveys"])
api_router.include_router(survey_question_router, prefix="/survey-questions", tags=["survey-questions"])
api_router.include_router(survey_response_router, prefix="/survey-responses", tags=["survey-responses"])
api_router.include_router(survey_response_conversation_router, prefix="/survey-response-conversations", tags=["survey-response-conversations"]) 