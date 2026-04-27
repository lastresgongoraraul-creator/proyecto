from sentence_transformers import SentenceTransformer
import os
import torch

class AIEngine:
    def __init__(self):
        self.model_name = os.getenv("MODEL_NAME", "all-MiniLM-L6-v2")
        # Load model on CPU or GPU if available
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = SentenceTransformer(self.model_name, device=self.device)

    def generate_embedding(self, text: str):
        """
        Generates a 384-dimensional embedding for the given text.
        """
        if not text:
            return None
        
        # Ensure text is not too long for the model
        embedding = self.model.encode(text, convert_to_tensor=False)
        return embedding.tolist()

    def create_game_text(self, game_name: str, summary: str, genres: list, platforms: list):
        """
        Creates a descriptive text for the game to be embedded.
        Optimized for all-MiniLM-L6-v2 by prioritizing genre and omitting platforms (noise).
        """
        genres_str = ", ".join(genres) if genres else "Unknown"
        # Omit platforms to avoid noise (e.g. grouping different games just because both are on PS5)
        # Structure it to prioritize Title and Genre.
        content = f"Title: {game_name}. Genre: {genres_str}. Description: {summary or ''}"
        return content

# Singleton instance
ai_engine = None

def get_ai_engine():
    global ai_engine
    if ai_engine is None:
        ai_engine = AIEngine()
    return ai_engine
