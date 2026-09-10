from functools import lru_cache


@lru_cache(maxsize=1)
def get_auth_service():
    from .auth_service import AuthService

    return AuthService()


@lru_cache(maxsize=1)
def get_prediction_service():
    from .prediction_service import PredictionService

    return PredictionService()
