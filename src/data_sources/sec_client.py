import pandas as pd

from src.utils.http import build_session


SEC_TICKER_URL = "https://www.sec.gov/files/company_tickers.json"
SEC_SUBMISSIONS_URL = "https://data.sec.gov/submissions/CIK{}.json"
SEC_COMPANY_FACTS_URL = "https://data.sec.gov/api/xbrl/companyfacts/CIK{}.json"


def get_sec_ticker_map():
    session = build_session()

    response = session.get(SEC_TICKER_URL, timeout=30)
    response.raise_for_status()

    data = response.json()

    rows = []
    for item in data.values():
        rows.append(
            {
                "ticker": item["ticker"].upper(),
                "cik": str(item["cik_str"]).zfill(10),
                "company_name": item["title"],
            }
        )

    return pd.DataFrame(rows)


def fetch_company_submissions(cik: str):
    session = build_session()
    url = SEC_SUBMISSIONS_URL.format(cik)

    response = session.get(url, timeout=30)
    response.raise_for_status()

    return response.json()


def get_latest_10k(submissions):
    filings = submissions["filings"]["recent"]
    df = pd.DataFrame(filings)

    df = df[df["form"] == "10-K"]

    if df.empty:
        return None

    return df.iloc[0]


def download_filing(cik: str, accession: str, primary_doc: str):
    accession_clean = accession.replace("-", "")
    url = f"https://www.sec.gov/Archives/edgar/data/{int(cik)}/{accession_clean}/{primary_doc}"

    session = build_session()
    response = session.get(url, timeout=30)
    response.raise_for_status()

    return response.content


def fetch_company_facts(cik: str):
    session = build_session()
    url = SEC_COMPANY_FACTS_URL.format(cik)

    response = session.get(url, timeout=30)
    response.raise_for_status()

    return response.json()


def _extract_latest_usd_fact(company_facts: dict, concept_names: list[str]):
    facts = company_facts.get("facts", {}).get("us-gaap", {})

    for concept in concept_names:
        concept_block = facts.get(concept)
        if not concept_block:
            continue

        units = concept_block.get("units", {})
        usd_rows = units.get("USD")
        if not usd_rows:
            continue

        df = pd.DataFrame(usd_rows)
        if df.empty or "val" not in df.columns:
            continue

        if "fy" in df.columns:
            df = df.sort_values(["fy", "fp"], ascending=[False, False], na_position="last")
        elif "end" in df.columns:
            df = df.sort_values("end", ascending=False, na_position="last")

        for _, row in df.iterrows():
            val = row.get("val")
            if pd.notna(val):
                return float(val)

    return None


def get_company_financials_from_sec(cik: str) -> dict:
    company_facts = fetch_company_facts(cik)

    revenue = _extract_latest_usd_fact(
        company_facts,
        [
            "RevenueFromContractWithCustomerExcludingAssessedTax",
            "Revenues",
            "SalesRevenueNet",
        ],
    )

    gross_profit = _extract_latest_usd_fact(
        company_facts,
        [
            "GrossProfit",
        ],
    )

    gross_margin = None
    if revenue not in (None, 0) and gross_profit is not None:
        gross_margin = gross_profit / revenue

    return {
        "revenue": revenue,
        "gross_profit": gross_profit,
        "gross_margin": gross_margin,
    }