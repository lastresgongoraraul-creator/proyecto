import sys
import os
import numpy as np

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.database import SessionLocal
from app.models.game import Game
from app.services.ai_engine import get_ai_engine
from dotenv import load_dotenv

load_dotenv()

def update_all_embeddings():
    print("🚀 Initializing Session...")
    db = SessionLocal()
    ai = get_ai_engine()
    
    print("🔍 Fetching games from database...")
    games = db.query(Game).all()
    print(f"📋 Found {len(games)} games.")

    updated_count = 0
    for game in games:
        # Check if embedding is zero-filled (as in the V9 migration)
        # In pgvector, we can check if it's all zeros. 
        # A simple way is to check if it matches a zero vector or if we just want to re-generate everything.
        # Let's re-generate for everyone to be safe and ensure consistency.
        
        print(f"🧠 Generating embedding for: {game.name}...")
        
        try:
            # Create text for embedding
            text_to_embed = ai.create_game_text(
                game.name, 
                game.summary, 
                game.genres, 
                game.platforms
            )
            
            # Generate embedding
            embedding = ai.generate_embedding(text_to_embed)
            
            # Update Game record
            game.embedding = embedding
            updated_count += 1
            
            if updated_count % 10 == 0:
                print(f"💾 Progress: {updated_count}/{len(games)} updated...")
                db.commit() # Commit periodically
                
        except Exception as e:
            print(f"❌ Error updating {game.name}: {e}")
    
    db.commit()
    db.close()
    print(f"✅ Success! Updated {updated_count} game embeddings.")

if __name__ == "__main__":
    update_all_embeddings()
