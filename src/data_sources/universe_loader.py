import pandas as pd
from io import StringIO

from src.utils.http import build_session


SP500_WIKI = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"


def get_sp500_companies() -> pd.DataFrame:
    session = build_session()

    # Use a browser-like User-Agent for Wikipedia
    session.headers.update(
        {
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            )
        }
    )

    response = session.get(SP500_WIKI, timeout=30)
    response.raise_for_status()

    html_io = StringIO(response.text)
    tables = pd.read_html(html_io)
    df = tables[0]

    df = df.rename(
        columns={
            "Symbol": "ticker",
            "Security": "company_name",
            "GICS Sector": "sector",
            "GICS Sub-Industry": "sub_industry",
        }
    )

    df["ticker"] = df["ticker"].astype(str).str.replace(".", "-", regex=False)
    df["company_name"] = df["company_name"].astype(str).str.strip()
    df["sector"] = df["sector"].astype(str).str.strip()
    df["sub_industry"] = df["sub_industry"].astype(str).str.strip()

    return df[["ticker", "company_name", "sector", "sub_industry"]]