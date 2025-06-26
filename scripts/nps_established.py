import os
import sys
import json
import requests
import time

SITES_PATH = os.path.join(os.path.dirname(__file__), "sites.json")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def get_established_date(site_name, api_key):
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    system_prompt = (
        "You are an assistant that returns only the established date for US National Park Service (NPS) sites. "
        "The user will provide the name of an NPS site. Respond with only the established year in YYYY format. "
        "If the established date is not available, respond with \"Unknown\". "
        "Do not include any additional text, explanation, or context."
    )
    data = {
        "model": "gpt-4.1",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": site_name}
        ]
    }
    resp = requests.post(url, headers=headers, json=data)
    if resp.status_code == 200:
        return resp.json()["choices"][0]["message"]["content"].strip()
    else:
        print(f"Error {resp.status_code}: {resp.text}")
        return "Unknown"

def main():
    if not OPENAI_API_KEY:
        print("Please set the OPENAI_API_KEY environment variable.")
        sys.exit(1)

    with open(SITES_PATH, "r", encoding="utf-8") as f:
        sites = json.load(f)

    changed = False
    for entry in sites:
        if "nps_established" not in entry or not entry["nps_established"]:
            site_name = entry.get("name")
            print(f"Querying established date for: {site_name}")
            date = get_established_date(site_name, OPENAI_API_KEY)
            entry["nps_established"] = date
            print(f" -> {date}")
            changed = True
            time.sleep(1.5)  # avoid rate limits

    if changed:
        with open(SITES_PATH, "w", encoding="utf-8") as f:
            json.dump(sites, f, indent=2, ensure_ascii=False)
        print("Updated sites.json with new nps_established values.")
    else:
        print("No changes made. All entries already have nps_established.")

if __name__ == "__main__":
    main()