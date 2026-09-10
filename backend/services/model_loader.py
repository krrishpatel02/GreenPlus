from pathlib import Path

import joblib


class LazyModel:
    def __init__(self, path: Path):
        self.path = path
        self._model = None
        self._error = None
        self._loaded = False

    @property
    def model(self):
        if not self._loaded:
            self._load()
        return self._model

    @property
    def error(self):
        if not self._loaded:
            self._load()
        return self._error

    def _load(self):
        self._loaded = True
        if not self.path.exists():
            self._error = f"Model file not found: {self.path.name}"
            return
        try:
            self._model = joblib.load(self.path)
        except Exception as exc:
            self._error = f"Model could not be loaded: {type(exc).__name__}"

    @property
    def available(self):
        return self.model is not None
