#!/usr/bin/env python3
"""Fetch all food establishments near Commercial Drive from OpenStreetMap."""

import json
import urllib.request
import urllib.parse

# Bounding box: Broadway (~49.2625) to Hastings (~49.2812)
# Commercial Drive runs at roughly lon -123.0695
# We use a narrow east-west band to capture both sides of the street
SOUTH = 49.2620
NORTH = 49.2815
WEST = -123.0715
EAST = -123.0680

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

QUERY = f"""
[out:json][timeout:120];
(
  node["amenity"~"restaurant|cafe|fast_food|bar|pub"]({SOUTH},{WEST},{NORTH},{EAST});
  node["shop"~"bakery|pastry|confectionery|coffee"]({SOUTH},{WEST},{NORTH},{EAST});
  way["amenity"~"restaurant|cafe|fast_food|bar|pub"]({SOUTH},{WEST},{NORTH},{EAST});
  way["shop"~"bakery|pastry|confectionery|coffee"]({SOUTH},{WEST},{NORTH},{EAST});
  relation["amenity"~"restaurant|cafe|fast_food|bar|pub"]({SOUTH},{WEST},{NORTH},{EAST});
  relation["shop"~"bakery|pastry|confectionery|coffee"]({SOUTH},{WEST},{NORTH},{EAST});
);
out center;
"""

def fetch():
    data = urllib.parse.urlencode({"data": QUERY}).encode()
    req = urllib.request.Request(OVERPASS_URL, data=data)
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read())

def extract_places(raw):
    places = []
    seen = set()
    for el in raw.get("elements", []):
        tags = el.get("tags", {})
        name = tags.get("name")
        if not name:
            continue

        # Get coordinates (nodes have lat/lon directly, ways have center)
        lat = el.get("lat") or (el.get("center", {}).get("lat"))
        lon = el.get("lon") or (el.get("center", {}).get("lon"))
        if not lat or not lon:
            continue

        # Deduplicate by name + rough location
        key = (name.lower(), round(lat, 4), round(lon, 4))
        if key in seen:
            continue
        seen.add(key)

        # Determine category
        amenity = tags.get("amenity", "")
        shop = tags.get("shop", "")
        if shop in ("bakery", "pastry", "confectionery"):
            category = "bakery"
        elif shop == "coffee":
            category = "cafe"
        elif amenity == "cafe":
            category = "cafe"
        elif amenity == "fast_food":
            category = "fast_food"
        elif amenity in ("bar", "pub"):
            category = "bar"
        else:
            category = "restaurant"

        place = {
            "name": name,
            "category": category,
            "latitude": round(lat, 7),
            "longitude": round(lon, 7),
            "cuisine": tags.get("cuisine", None),
            "address": tags.get("addr:street", None),
            "housenumber": tags.get("addr:housenumber", None),
            "phone": tags.get("phone", None),
            "website": tags.get("website", None),
            "opening_hours": tags.get("opening_hours", None),
            "osm_id": el.get("id"),
            "osm_type": el.get("type"),
        }
        places.append(place)

    # Sort by latitude (south to north, Broadway to Hastings)
    places.sort(key=lambda p: p["latitude"])
    return places

if __name__ == "__main__":
    print("Fetching from Overpass API...")
    raw = fetch()
    print(f"Got {len(raw.get('elements', []))} raw elements")
    places = extract_places(raw)
    print(f"Extracted {len(places)} unique named places")

    with open("osm_places.json", "w") as f:
        json.dump(places, f, indent=2)
    print("Saved to osm_places.json")

    # Print summary
    from collections import Counter
    cats = Counter(p["category"] for p in places)
    for cat, count in cats.most_common():
        print(f"  {cat}: {count}")
