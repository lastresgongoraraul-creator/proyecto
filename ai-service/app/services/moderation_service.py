from better_profanity import profanity
import logging

logger = logging.getLogger(__name__)

class ModerationService:
    def __init__(self):
        # Load default profanity words
        profanity.load_censor_words()
        # You can add custom words here
        # profanity.add_censor_words(["custom_bad_word"])

    def is_offensive(self, text: str) -> bool:
        """
        Checks if the text contains offensive language.
        """
        if not text:
            return False
        return profanity.contains_profanity(text)

    def censor_text(self, text: str) -> str:
        """
        Replaces offensive words with asterisks.
        """
        if not text:
            return text
        return profanity.censor(text)

# Singleton
moderation_service = None

def get_moderation_service():
    global moderation_service
    if moderation_service is None:
        moderation_service = ModerationService()
    return moderation_service
