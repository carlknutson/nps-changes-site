import os
import sys
import json
import requests
import time

SITES_PATH = os.path.join(os.path.dirname(__file__), "sites.json")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

SYSTEM_PROMPT = (
    "You are an assistant that returns a list of previous official National Park Service (NPS) names for a given site, "
    "excluding the site's current name. The user will provide the current name of an NPS site. "
    "Respond with a JSON array of all previous NPS-recognized names the site has had since its establishment, "
    "in chronological order. If there have been no previous names, respond with an empty array []. "
    "Do not include the current name in the list. Do not provide any explanation or extra text."
)

def get_previous_names(site_name, api_key):
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "gpt-4.1",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": site_name}
        ]
    }
    resp = requests.post(url, headers=headers, json=data)
    if resp.status_code == 200:
        content = resp.json()["choices"][0]["message"]["content"].strip()
        try:
            arr = json.loads(content)
            if isinstance(arr, list):
                return arr
        except Exception as e:
            print(f"Error parsing response for {site_name}: {content}")
            return []
    else:
        print(f"Error {resp.status_code}: {resp.text}")
        return []

def main():
    if not OPENAI_API_KEY:
        print("Please set the OPENAI_API_KEY environment variable.")
        sys.exit(1)

    with open(SITES_PATH, "r", encoding="utf-8") as f:
        sites = json.load(f)

    changed = False
    for entry in sites:
        if "previous_names" not in entry:
            site_name = entry.get("name")
            print(f"Querying previous names for: {site_name}")
            prev_names = get_previous_names(site_name, OPENAI_API_KEY)
            if prev_names:
                entry["previous_names"] = prev_names
                print(f" -> {prev_names}")
                changed = True
            else:
                # Ensure property is omitted if no previous names
                if "previous_names" in entry:
                    del entry["previous_names"]
            time.sleep(1.5)  # avoid rate limits

    if changed:
        with open(SITES_PATH, "w", encoding="utf-8") as f:
            json.dump(sites, f, indent=2, ensure_ascii=False)
        print("Updated sites.json with new previous_names values.")
    else:
        print("No changes made. All entries already have previous_names.")

if __name__ == "__main__":
    main()