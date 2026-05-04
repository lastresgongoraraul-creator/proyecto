import urllib.request
import json

url = "https://www.igdb.com/games/pragmata"
req = urllib.request.Request(
    url, 
    data=None, 
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
)

try:
    response = urllib.request.urlopen(req)
    html = response.read().decode('utf-8')
    print("Success! Length:", len(html))
    import re
    matches = re.findall(r'images\.igdb\.com/igdb/image/upload/t_cover_big/([a-zA-Z0-9_]+)\.(?:jpg|webp|png)', html)
    print("Hashes found:", set(matches))
except Exception as e:
    print("Error:", e)
