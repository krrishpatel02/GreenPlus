import re


GUJARATI_RE = re.compile(r"[\u0A80-\u0AFF]")
DEVANAGARI_RE = re.compile(r"[\u0900-\u097F]")


def detect_language(text):
    value = str(text or "").strip()
    if not value:
        return "English"
    gujarati = len(GUJARATI_RE.findall(value))
    hindi = len(DEVANAGARI_RE.findall(value))
    latin_words = re.findall(r"[a-zA-Z]+", value.lower())
    latin = " ".join(latin_words)
    if gujarati and latin_words:
        return "Gujlish"
    if gujarati:
        return "Gujarati"
    if hindi and latin_words:
        return "Hinglish"
    if hindi:
        return "Hindi"
    hindi_markers = {"kal", "aaj", "hai", "hoga", "barish", "pani", "kaise", "karu", "mera", "bahut"}
    gujlish_markers = {"aavse", "kem", "shu", "nu", "karvu", "thase", "pade", "pani"}
    words = set(latin_words)
    if words & gujlish_markers:
        return "Gujlish"
    if words & hindi_markers:
        return "Hinglish"
    return "English"
