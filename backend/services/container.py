from functools import lru_cache


@lru_cache(maxsize=1)
def get_auth_service():
    from .auth_service import AuthService

    return AuthService()


@lru_cache(maxsize=1)
def get_prediction_service():
    from .prediction_service import PredictionService

    return PredictionService()


@lru_cache(maxsize=1)
def get_assistant_service():
    from .assistant_service import AssistantService

    return AssistantService()


@lru_cache(maxsize=1)
def get_notification_service():
    from .notification_service import NotificationService

    return NotificationService()
