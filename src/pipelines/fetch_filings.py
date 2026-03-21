import pandas as pd

from src.utils.http import build_session
from src.db import get_conn
from src.config import SEC_CACHE_DIR


SEC_SUBMISSIONS_URL = "https://data.sec.gov/submissions/CIK{}.json"


def fetch_company_submissions(cik):
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


def download_filing(cik, accession, primary_doc):
    accession_clean = accession.replace("-", "")
    url = f"https://www.sec.gov/Archives/edgar/data/{int(cik)}/{accession_clean}/{primary_doc}"

    session = build_session()
    response = session.get(url, timeout=30)
    response.raise_for_status()

    file_path = SEC_CACHE_DIR / f"{cik}_{accession}.html"

    with open(file_path, "wb") as f:
        f.write(response.content)

    return file_path


def fetch_filings():
    conn = get_conn()

    companies = conn.execute(
        """
        SELECT ticker, cik
        FROM project_universe
        """
    ).fetchdf()

    records = []

    for _, row in companies.iterrows():
        ticker = row["ticker"]
        cik = row["cik"]

        try:
            submissions = fetch_company_submissions(cik)
            latest_10k = get_latest_10k(submissions)

            if latest_10k is None:
                print(f"No 10-K found for {ticker}")
                continue

            accession = latest_10k["accessionNumber"]
            primary_doc = latest_10k["primaryDocument"]

            file_path = download_filing(cik, accession, primary_doc)

            records.append(
                {
                    "ticker": ticker,
                    "cik": cik,
                    "accession": accession,
                    "file_path": str(file_path),
                }
            )

            print(f"Downloaded 10-K for {ticker}")

        except Exception as e:
            print(f"Failed {ticker}: {e}")

    df = pd.DataFrame(records)

    conn.execute("DROP TABLE IF EXISTS filings")

    conn.execute(
        """
        CREATE TABLE filings AS
        SELECT * FROM df
        """
    )

    print("Saved filings table")


if __name__ == "__main__":
    fetch_filings()