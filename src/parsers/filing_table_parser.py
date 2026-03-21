from bs4 import BeautifulSoup
import pandas as pd
import re
import warnings
from bs4 import XMLParsedAsHTMLWarning

warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)

KEYWORDS = [
    "United States",
    "China",
    "Europe",
    "Asia",
    "Americas",
    "Japan",
]


def extract_numeric_candidates(cells):
    """
    Return numeric-looking values from a row.
    Keeps only values that look like percentages or shares.
    """
    candidates = []

    for cell in cells[1:]:
        text = str(cell).strip().replace(",", "")

        if not text:
            continue

        # grab first numeric token
        match = re.search(r"-?\d+(\.\d+)?", text)
        if not match:
            continue

        val = float(match.group())

        # keep only realistic percent/share values
        if 0 <= val <= 100:
            candidates.append(val)

    return candidates


def extract_geographic_revenue(file_path):
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()

    soup = BeautifulSoup(html, "lxml")
    tables = soup.find_all("table")

    records = []

    for table in tables:
        rows = table.find_all("tr")

        for row in rows:
            cells = [c.get_text(" ", strip=True) for c in row.find_all(["td", "th"])]

            if not cells:
                continue

            first_cell = cells[0]

            for keyword in KEYWORDS:
                if keyword.lower() in first_cell.lower():
                    numeric_candidates = extract_numeric_candidates(cells)

                    if numeric_candidates:
                        value = max(numeric_candidates)
                    else:
                        value = None

                    records.append(
                        {
                            "region": keyword,
                            "value": value,
                            "raw_label": first_cell,
                        }
                    )

    return pd.DataFrame(records)