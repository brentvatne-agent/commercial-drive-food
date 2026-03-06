#!/usr/bin/env python3
"""Clean up the merged dataset - remove duplicates, non-food entries, side streets."""

import json

with open("commercial_drive_food.json") as f:
    data = json.load(f)

places = data["places"]

# Names to remove (not food, duplicates, or not on Commercial Drive)
remove_names = {
    "Ladybug Community Little Library",  # not a food place
}

# Entries on side streets (Venables, East Broadway, 1st Ave) - keep only if
# they're clearly Commercial Drive corner locations
remove_addresses = set()

# Fix: "Appolos's" is a duplicate/typo of "Apollo's Restaurant"
# "Mr. Greek" at 2285 is same as "Mr. Greek Donair Store"
# "Commercial Drive Licorice Parlour" is candy, not cafe/restaurant/bakery

remove_names.add("Appolos's")  # duplicate of Apollo's Restaurant
remove_names.add("Commercial Drive Licorice Parlour")  # candy shop, not food establishment

# Remove places on side streets that aren't actually on Commercial Drive
side_street_addresses = {"East Broadway", "Venables Street", "East 1st Avenue"}

cleaned = []
seen_addresses = {}  # housenumber -> name for dedup

for p in places:
    name = p["name"]

    # Skip explicitly removed names
    if name in remove_names:
        continue

    # Skip side street addresses (but keep if address is Commercial Drive or None)
    addr = p.get("address", "") or ""
    if any(side in addr for side in side_street_addresses):
        continue

    # Deduplicate Mr. Greek entries - keep the one with more info
    if name == "Mr. Greek" and any(c["name"] == "Mr. Greek Donair Store" for c in cleaned):
        continue
    if name == "Mr. Greek Donair Store" and any(c["name"] == "Mr. Greek" for c in cleaned):
        # Replace the existing Mr. Greek with this one
        cleaned = [c for c in cleaned if c["name"] != "Mr. Greek"]

    cleaned.append(p)

# Re-sort by latitude
cleaned.sort(key=lambda p: p["latitude"])

# Update metadata
data["places"] = cleaned
data["metadata"]["total_count"] = len(cleaned)

# Category summary
from collections import Counter
cats = Counter(p["category"] for p in cleaned)

print(f"After cleanup: {len(cleaned)} places")
for cat, count in cats.most_common():
    print(f"  {cat}: {count}")

with open("commercial_drive_food.json", "w") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\nSaved cleaned data to commercial_drive_food.json")

# Final listing
print("\n--- FINAL LIST (south to north, Broadway to Hastings) ---")
for i, p in enumerate(cleaned, 1):
    hn = p.get("housenumber", "")
    addr_str = f" - {hn} Commercial Dr" if hn else ""
    cuisine_str = f" ({p['cuisine']})" if p.get("cuisine") else ""
    print(f"{i:3}. [{p['category']:11}] {p['name']}{addr_str}{cuisine_str}")
