import time
import yfinance as yf


def get_company_financials(ticker: str) -> dict:
    """
    Returns a small dictionary of financial data for one ticker.
    """
    stock = yf.Ticker(ticker)

    info = stock.info

    gross_margin = info.get("grossMargins")
    revenue = info.get("totalRevenue")

    return {
        "ticker": ticker,
        "gross_margin": gross_margin,
        "revenue": revenue,
    }


def safe_get_company_financials(ticker: str) -> dict:
    """
    Wrapped version so one ticker failing does not kill the pipeline.
    """
    try:
        result = get_company_financials(ticker)
        time.sleep(0.2)
        return result
    except Exception as e:
        return {
            "ticker": ticker,
            "gross_margin": None,
            "revenue": None,
            "error": str(e),
        }