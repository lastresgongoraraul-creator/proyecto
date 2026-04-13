import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.database import init_db, SessionLocal
from app.models.game import Game
from app.services.igdb_service import IGDBService
from app.services.ai_engine import get_ai_engine
from dotenv import load_dotenv

load_dotenv()

def populate(limit=50):
    print("🚀 Initializing Database...")
    init_db()
    
    db = SessionLocal()
    igdb = IGDBService()
    ai = get_ai_engine()
    
    print(f"🔍 Fetching {limit} games from IGDB...")
    try:
        games_data = igdb.fetch_games(limit=limit)
    except Exception as e:
        print(f"❌ Error fetching from IGDB: {e}")
        return

    print("🧠 Generating embeddings and saving to DB...")
    new_games_count = 0
    for data in games_data:
        # Check if game already exists
        existing = db.query(Game).filter(Game.igdb_id == data["igdb_id"]).first()
        if existing:
            continue
            
        # Create text for embedding
        text_to_embed = ai.create_game_text(
            data["name"], 
            data["summary"], 
            data["genres"], 
            data["platforms"]
        )
        
        # Generate embedding
        embedding = ai.generate_embedding(text_to_embed)
        
        # Create Game record
        game = Game(
            igdb_id=data["igdb_id"],
            name=data["name"],
            summary=data["summary"],
            primary_genre=data["genres"][0] if data["genres"] else None,
            genres=data["genres"],
            platforms=data["platforms"],
            release_year=data["release_year"],
            embedding=embedding
        )
        
        db.add(game)
        new_games_count += 1
        
    db.commit()
    db.close()
    print(f"✅ Success! Added {new_games_count} new games to the catalog.")

if __name__ == "__main__":
    populate(limit=20) # Default to 20 for testing
