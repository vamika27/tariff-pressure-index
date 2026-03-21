import pandas as pd
import numpy as np


def minmax(series: pd.Series) -> pd.Series:
    s = pd.to_numeric(series, errors="coerce")

    if s.isna().all():
        return pd.Series(np.zeros(len(s)), index=s.index)

    min_val = s.min()
    max_val = s.max()

    if min_val == max_val:
        return pd.Series(np.ones(len(s)) * 0.5, index=s.index)

    return (s - min_val) / (max_val - min_val)


def build_tariff_pressure_score(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()

    out["gross_margin_norm"] = minmax(out["gross_margin"])
    out["gross_margin_vulnerability"] = 1 - out["gross_margin_norm"]

    out["import_dependency_norm"] = minmax(out["import_dependency_ratio"])
    out["revenue_exposure_norm"] = minmax(out["affected_region_revenue_share"])

    out["tariff_pressure_score"] = (
        out["gross_margin_vulnerability"]
        + out["import_dependency_norm"]
        + out["revenue_exposure_norm"]
    ) / 3 * 100

    out["tariff_pressure_score"] = out["tariff_pressure_score"].round(2)

    def bucket(score: float) -> str:
        if score >= 67:
            return "High"
        if score >= 34:
            return "Medium"
        return "Low"

    out["risk_bucket"] = out["tariff_pressure_score"].apply(bucket)

    return out