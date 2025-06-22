#!/usr/bin/env python3

import requests
import argparse
import sys
import os
import json

def fetch_parks(api_key):
    """Fetch all parks from the NPS API, handling pagination."""
    base_url = "https://developer.nps.gov/api/v1/parks"
    parks = []
    start = 0
    limit = 50

    while True:
        headers = {
            "X-Api-Key": api_key
        }
        params = {
            "start": start,
            "limit": limit
        }

        try:
            response = requests.get(base_url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Add parks from current page
            parks.extend(data["data"])
            
            # Check if we've retrieved all parks
            total = int(data["total"])  # Convert total to integer
            if start + limit >= total:
                break
                
            start += limit

        except requests.exceptions.RequestException as e:
            print(f"Error fetching parks: {e}", file=sys.stderr)
            sys.exit(1)

    # Sort parks by fullName before returning
    return sorted(parks, key=lambda x: x["fullName"])

def fetch_stamp_locations(api_key):
    """Fetch all passport stamp locations from the NPS API."""
    base_url = "https://developer.nps.gov/api/v1/passportstamplocations"
    start = 0
    limit = 50
    parkCodes = set()  # To store unique park codes

    while True:
        headers = {
            "X-Api-Key": api_key
        }
        params = {
            "start": start,
            "limit": limit
        }

        try:
            response = requests.get(base_url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()

            for stamp in data["data"]:
                for park in stamp["parks"]:
                    parkCodes.add(park["parkCode"])
                        
            total = int(data["total"])
            if start + limit >= total:
                break
                
            start += limit

        except requests.exceptions.RequestException as e:
            print(f"Error fetching stamp locations: {e}", file=sys.stderr)
            sys.exit(1)

    return parkCodes

SITES_JSON_PATH = os.path.join(os.path.dirname(__file__), '../../data/sites.json')

def load_existing_sites():
    try:
        with open(SITES_JSON_PATH, 'r') as f:
            return json.load(f)
    except Exception:
        return []

def merge_sites(existing_sites, new_sites):
    # Use nps_link as unique key if available, else fallback to name
    def site_key(site):
        return site.get('nps_link') or site.get('name')

    existing_map = {site_key(site): site for site in existing_sites if site_key(site)}
    new_map = {site_key(site): site for site in new_sites if site_key(site)}

    merged = []
    # Add or update sites from new_sites (active = True)
    for key, new_site in new_map.items():
        old = existing_map.get(key, {})
        merged_site = dict(old)
        merged_site.update(new_site)
        merged.append(merged_site)
    # Mark missing sites as inactive
    for key, old_site in existing_map.items():
        if key not in new_map:
            merged_site = dict(old_site)
            merged_site['active'] = False
            merged.append(merged_site)
    return merged

def main():
    parser = argparse.ArgumentParser(description="Fetch park info from the NPS API and output as JSON")
    args = parser.parse_args()
    
    api_key = os.environ.get('NPS_API_TOKEN')
    if not api_key:
        print("Error: NPS API key must be provided via NPS_API_TOKEN environment variable", file=sys.stderr)
        sys.exit(1)
    
    try:
        parks = fetch_parks(api_key)
        parks_with_stamps = fetch_stamp_locations(api_key)
        result = []
        for park in parks:
            name = park.get("fullName", "")
            has_stamps = park.get("parkCode", "") in parks_with_stamps
            description = park.get("description", "")
            url = park.get("url", "")
            images = park.get("images", [])
            photo_link = images[0]["url"] if images else ""
            result.append({
                "name": name,
                "description": description,
                "has_stamps": has_stamps,
                "nps_link": url,
                "photo_link": photo_link
            })
        existing_sites = load_existing_sites()
        merged_sites = merge_sites(existing_sites, result)
        print(json.dumps(merged_sites, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"An error occurred: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    with open('../../data/sites.json') as f:
        sites = json.load(f)
    print("First site entry before update:", sites[0])
    main()