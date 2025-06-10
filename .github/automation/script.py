#!/usr/bin/env python3

import requests
import argparse
import sys
import os

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

    return parks

def fetch_stamp_locations(api_key):
    """Fetch all passport stamp locations from the NPS API."""
    base_url = "https://developer.nps.gov/api/v1/passportstamplocations"
    stamps = []
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

def main():
    parser = argparse.ArgumentParser(description="Fetch park names from the NPS API")
    parser.add_argument("--no-stamps", action="store_true", help="Show only parks without stamps")
    args = parser.parse_args()
    
    api_key = os.environ.get('NPS_API_TOKEN')
    if not api_key:
        print("Error: NPS API key must be provided via NPS_API_TOKEN environment variable", file=sys.stderr)
        sys.exit(1)
    
    try:
        parks = fetch_parks(api_key)
        parks_with_stamps = fetch_stamp_locations(api_key)
        
        for park in parks:
            if args.no_stamps:
                if park["parkCode"] not in parks_with_stamps:
                    print(park["fullName"])
            else:
                print(park["fullName"])
    except Exception as e:
        print(f"An error occurred: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()