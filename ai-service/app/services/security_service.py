import re
import logging

logger = logging.getLogger(__name__)

class SecurityService:
    def __init__(self):
        # Common spam keywords
        self.spam_keywords = [
            r"buy now", r"free gift", r"click here", r"guaranteed profit",
            r"crypto investment", r"whatsapp me", r"telegram me",
            r"limited offer", r"urgent", r"winner", r"congratulations"
        ]

    def analyze_text(self, text: str) -> dict:
        """
        Analyzes text for spam or suspicious behavior.
        """
        if not text:
            return {"is_suspicious": False, "reason": "Empty text"}

        reasons = []
        
        # 1. Check for repetition (spam indicator)
        if re.search(r"(.)\1{7,}", text):
            reasons.append("Character repetition detected")
            
        # 2. Check for high link density
        links = re.findall(r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+", text)
        if len(links) > 2:
            reasons.append("Too many links")
            
        # 3. Check for aggressive caps lock (excluding URLs)
        clean_text = text
        for link in links:
            clean_text = clean_text.replace(link, "")
            
        if len(clean_text.strip()) > 8 and sum(1 for c in clean_text if c.isupper()) / len(clean_text) > 0.6:
            reasons.append("Aggressive caps lock")
            
        # 4. Check for spam keywords
        spam_keywords = self.spam_keywords + [r"bitcoin", r"crypto", r"earn money", r"fast cash"]
        for keyword in spam_keywords:
            if re.search(keyword, text, re.IGNORECASE):
                reasons.append(f"Spam keyword detected: {keyword}")
                break

        is_suspicious = len(reasons) > 0
        
        return {
            "is_suspicious": is_suspicious,
            "reasons": reasons,
            "score": min(1.0, len(reasons) / 3.0) 
        }

# Singleton
security_service = None

def get_security_service():
    global security_service
    if security_service is None:
        security_service = SecurityService()
    return security_service
