import requests
import os
from datetime import datetime
from app.core.errors import AIException

class IGDBService:
    def __init__(self):
        self.client_id = os.getenv("IGDB_CLIENT_ID")
        self.client_secret = os.getenv("IGDB_CLIENT_SECRET")
        self.auth_url = "https://id.twitch.tv/oauth2/token"
        self.base_url = "https://api.igdb.com/v4"
        self.token = None

    def _get_token(self):
        """
        Authenticates with Twitch to get a Bearer token.
        """
        params = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "client_credentials"
        }
        response = requests.post(self.auth_url, params=params)
        if response.status_code != 200:
            raise AIException(status_code=500, message="Failed to authenticate with IGDB", error_type="Authentication Error")
        
        data = response.json()
        self.token = data["access_token"]
        return self.token

    def fetch_games(self, limit: int = 50, offset: int = 0):
        """
        Fetches games with genre, platforms, and release date.
        """
        if not self.token:
            self._get_token()

        headers = {
            "Client-ID": self.client_id,
            "Authorization": f"Bearer {self.token}"
        }

        # Apicalypse query with cover field
        query = f"fields name, summary, genres.name, platforms.name, first_release_date, cover.url; limit {limit}; offset {offset};"
        
        response = requests.post(f"{self.base_url}/games", headers=headers, data=query)
        
        if response.status_code == 401: # Token expired?
            self._get_token()
            headers["Authorization"] = f"Bearer {self.token}"
            response = requests.post(f"{self.base_url}/games", headers=headers, data=query)

        if response.status_code != 200:
            raise AIException(status_code=response.status_code, message="Error fetching games from IGDB", error_type="External API Error")

        return self._format_games(response.json())

    def _format_games(self, raw_games):
        formatted = []
        for game in raw_games:
            genres = [g["name"] for g in game.get("genres", [])]
            platforms = [p["name"] for p in game.get("platforms", [])]
            
            # Convert timestamp to year
            ts = game.get("first_release_date")
            year = datetime.fromtimestamp(ts).year if ts else None
            
            # Format cover URL (convert // to https:// and use t_cover_big)
            cover_url = game.get("cover", {}).get("url")
            if cover_url:
                if cover_url.startswith("//"):
                    cover_url = "https:" + cover_url
                cover_url = cover_url.replace("t_thumb", "t_cover_big")

            formatted.append({
                "igdb_id": game["id"],
                "name": game["name"],
                "summary": game.get("summary", ""),
                "genres": genres,
                "platforms": platforms,
                "release_year": year,
                "cover_url": cover_url
            })
        return formatted
