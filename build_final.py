#!/usr/bin/env python3
"""
Merge OSM data with manually researched places to create the final dataset.
Filter to only places actually on Commercial Drive (between Broadway and Hastings).
"""

import json

# Load OSM data
with open("osm_places.json") as f:
    osm_places = json.load(f)

# Commercial Drive runs roughly at longitude -123.0695
# We want to filter out places that are clearly on side streets
# The street runs N-S so longitude should be very close to -123.0695
# Broadway is at ~49.2633, Hastings is at ~49.2812
COMM_DRIVE_LON = -123.0697
LON_TOLERANCE = 0.0012  # ~100m east-west tolerance
LAT_BROADWAY = 49.2620
LAT_HASTINGS = 49.2815

def is_on_commercial_drive(place):
    lat = place["latitude"]
    lon = place["longitude"]
    if lat < LAT_BROADWAY or lat > LAT_HASTINGS:
        return False
    if abs(lon - COMM_DRIVE_LON) > LON_TOLERANCE:
        return False
    return True

# Filter OSM places to Commercial Drive corridor
filtered = [p for p in osm_places if is_on_commercial_drive(p)]

# Places missing from OSM that we found from BIA + web research
# Using approximate coordinates based on address positions along Commercial Drive
additional_places = [
    {
        "name": "Indo-Chinese Street Wok",
        "category": "restaurant",
        "latitude": 49.2722,
        "longitude": -123.0698,
        "cuisine": "indian;chinese",
        "address": "Commercial Drive",
        "housenumber": "1851",
        "phone": None,
        "website": None,
        "opening_hours": None,
        "osm_id": None,
        "osm_type": None,
        "source": "bia_website"
    },
    {
        "name": "Junior's Pub & Grill",
        "category": "bar",
        "latitude": 49.2676,
        "longitude": -123.0696,
        "cuisine": None,
        "address": "Commercial Drive",
        "housenumber": "1601",
        "phone": None,
        "website": "https://www.juniorspub.ca/",
        "opening_hours": None,
        "osm_id": None,
        "osm_type": None,
        "source": "bia_website"
    },
    {
        "name": "Elephant Garden Creamery",
        "category": "cafe",
        "latitude": 49.2662,
        "longitude": -123.0694,
        "cuisine": "ice_cream",
        "address": "Commercial Drive",
        "housenumber": "2080",
        "phone": "+1 604-251-6832",
        "website": "https://elephantgarden.ca/",
        "opening_hours": None,
        "osm_id": None,
        "osm_type": None,
        "source": "bia_website"
    },
    {
        "name": "Apollo's Restaurant",
        "category": "restaurant",
        "latitude": 49.2649,
        "longitude": -123.0695,
        "cuisine": "greek",
        "address": "Commercial Drive",
        "housenumber": "2095",
        "phone": "+1 604-336-7464",
        "website": "https://apollosrestaurant.com/",
        "opening_hours": None,
        "osm_id": None,
        "osm_type": None,
        "source": "bia_website"
    },
    {
        "name": "Pax Romana Tapas Bar",
        "category": "restaurant",
        "latitude": 49.2691,
        "longitude": -123.0697,
        "cuisine": "mediterranean;tapas",
        "address": "Commercial Drive",
        "housenumber": "1670",
        "phone": None,
        "website": "https://www.paxromana.ca/",
        "opening_hours": None,
        "osm_id": None,
        "osm_type": None,
        "source": "bia_website"
    },
    {
        "name": "Mr. Greek Donair Store",
        "category": "fast_food",
        "latitude": 49.2636,
        "longitude": -123.0695,
        "cuisine": "greek",
        "address": "Commercial Drive",
        "housenumber": "2285",
        "phone": "(604) 620-6682",
        "website": None,
        "opening_hours": None,
        "osm_id": None,
        "osm_type": None,
        "source": "bia_website"
    },
    {
        "name": "Belli Pizza",
        "category": "restaurant",
        "latitude": 49.2707,
        "longitude": -123.0697,
        "cuisine": "pizza",
        "address": "Commercial Drive",
        "housenumber": "1733",
        "phone": None,
        "website": "https://www.belli.pizza/",
        "opening_hours": None,
        "osm_id": None,
        "osm_type": None,
        "source": "web_research"
    },
    {
        "name": "The Bench Bakehouse",
        "category": "bakery",
        "latitude": 49.2699,
        "longitude": -123.0697,
        "cuisine": "bakery",
        "address": "Commercial Drive",
        "housenumber": "1641",
        "phone": None,
        "website": "https://www.thebenchbakehouse.com/",
        "opening_hours": None,
        "osm_id": None,
        "osm_type": None,
        "source": "bia_website"
    },
    {
        "name": "La Grotta del Formaggio",
        "category": "restaurant",
        "latitude": 49.2712,
        "longitude": -123.0697,
        "cuisine": "italian;deli",
        "address": "Commercial Drive",
        "housenumber": "1791",
        "phone": None,
        "website": None,
        "opening_hours": None,
        "osm_id": None,
        "osm_type": None,
        "source": "bia_website"
    },
    {
        "name": "Giancarlo's Italian Cafe",
        "category": "cafe",
        "latitude": 49.2721,
        "longitude": -123.0697,
        "cuisine": "italian",
        "address": "Commercial Drive",
        "housenumber": "1865",
        "phone": None,
        "website": None,
        "opening_hours": None,
        "osm_id": None,
        "osm_type": None,
        "source": "bia_website"
    },
    {
        "name": "Erbil Restaurant",
        "category": "restaurant",
        "latitude": 49.2722,
        "longitude": -123.0697,
        "cuisine": "kurdish;turkish",
        "address": "Commercial Drive",
        "housenumber": "1861",
        "phone": None,
        "website": "https://erbilrestaurant.ca/",
        "opening_hours": None,
        "osm_id": None,
        "osm_type": None,
        "source": "bia_website"
    },
    {
        "name": "Delhi Fusion Indian Cuisine",
        "category": "restaurant",
        "latitude": 49.2722,
        "longitude": -123.0697,
        "cuisine": "indian",
        "address": "Commercial Drive",
        "housenumber": "1859",
        "phone": None,
        "website": None,
        "opening_hours": None,
        "osm_id": None,
        "osm_type": None,
        "source": "bia_website"
    },
    {
        "name": "Nomo Nomo",
        "category": "restaurant",
        "latitude": 49.2756,
        "longitude": -123.0697,
        "cuisine": "japanese",
        "address": "Commercial Drive",
        "housenumber": "1268",
        "phone": None,
        "website": "https://nomonomo.ca/",
        "opening_hours": None,
        "osm_id": None,
        "osm_type": None,
        "source": "web_research"
    },
]

# Check for duplicates between additional and filtered OSM
existing_names = {p["name"].lower().strip() for p in filtered}
# Also build fuzzy lookup
existing_first_words = {}
for p in filtered:
    words = p["name"].lower().split()
    if words:
        key = words[0]
        existing_first_words.setdefault(key, []).append(p["name"].lower())

added = 0
for place in additional_places:
    name_lower = place["name"].lower().strip()
    # Check exact match
    if name_lower in existing_names:
        continue
    # Check if first significant word matches
    first_word = name_lower.split()[0]
    skip = False
    if first_word in existing_first_words and len(first_word) > 3:
        for existing in existing_first_words[first_word]:
            if first_word in existing:
                skip = True
                break
    if skip:
        continue

    # Add source field to OSM places too
    place_copy = dict(place)
    filtered.append(place_copy)
    added += 1

# Add source to OSM places that don't have it
for p in filtered:
    if "source" not in p:
        p["source"] = "openstreetmap"

# Sort by latitude (south to north = Broadway to Hastings)
filtered.sort(key=lambda p: p["latitude"])

# Remove bars/pubs that aren't also restaurants (user asked for cafes, restaurants, bakeries)
# Actually, keep them - many serve food. But let's categorize properly.
# The user asked for "cafes and restaurants and bakeries" - let's include all food places
# but we can tag bars separately

print(f"OSM places (filtered to Commercial Dr corridor): {len([p for p in filtered if p['source'] == 'openstreetmap'])}")
print(f"Additional places from research: {added}")
print(f"Total unique places: {len(filtered)}")

# Category summary
from collections import Counter
cats = Counter(p["category"] for p in filtered)
for cat, count in cats.most_common():
    print(f"  {cat}: {count}")

# Build final clean output
output = {
    "metadata": {
        "title": "Food & Drink Establishments on Commercial Drive, Vancouver",
        "description": "Cafes, restaurants, bakeries, and food establishments on Commercial Drive between Broadway and Hastings, Vancouver BC",
        "bounds": {
            "south": LAT_BROADWAY,
            "north": LAT_HASTINGS,
            "street": "Commercial Drive",
            "city": "Vancouver",
            "province": "BC",
            "country": "Canada"
        },
        "sources": [
            "OpenStreetMap (Overpass API)",
            "onthedrive.ca (Commercial Drive BIA)",
            "thedrive.ca",
            "Yelp listings",
            "Individual restaurant websites"
        ],
        "last_updated": "2026-03-06",
        "total_count": len(filtered)
    },
    "places": filtered
}

with open("commercial_drive_food.json", "w") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"\nSaved to commercial_drive_food.json")

# Print all names for review
print("\n--- ALL PLACES (south to north) ---")
for i, p in enumerate(filtered, 1):
    addr = f" ({p.get('housenumber', '')} {p.get('address', '')})".strip() if p.get('housenumber') else ""
    print(f"{i:3}. [{p['category']:11}] {p['name']}{addr} ({p['source']})")
