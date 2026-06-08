"""RecallOps Cortex — backend configuration.

Reads environment (optionally a .env file) and reports which live
integrations are wired. Missing cloud credentials are NOT fatal: the service
runs in clearly-labelled `fallback` mode so the whole flow stays demoable
offline. openFDA needs no key, so the recall source is always live.
"""
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"  # backend/.env, regardless of CWD


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(_ENV_FILE), extra="ignore")

    # --- openFDA (public, no key required) ---
    openfda_base_url: str = "https://api.fda.gov/food/enforcement.json"
    openfda_api_key: str = ""  # optional; only raises rate limits

    # --- Google Cloud / Gemini 3 ---
    google_cloud_project: str = ""
    google_cloud_region: str = "us-central1"
    # OVERRIDE with the exact Gemini 3 id from the hackathon resources / Vertex console.
    gemini_model: str = "gemini-3-pro"
    use_vertex: bool = True
    google_api_key: str = ""  # google-genai API-key mode (non-Vertex)

    # --- BigQuery ---
    bigquery_dataset: str = "recallops_cortex"

    # --- Fivetran (partner requirement / MCP) ---
    fivetran_api_key: str = ""
    fivetran_api_secret: str = ""
    fivetran_group_id: str = ""

    # --- behaviour ---
    use_cached_fallback: bool = True
    freshness_limit_min: int = 15
    cors_origins: str = "*"

    @property
    def gemini_ready(self) -> bool:
        return bool(self.google_cloud_project or self.google_api_key)

    @property
    def bigquery_ready(self) -> bool:
        return bool(self.google_cloud_project)

    @property
    def fivetran_ready(self) -> bool:
        return bool(self.fivetran_api_key and self.fivetran_api_secret)

    def integration_status(self) -> dict:
        """openFDA is always live; the rest depend on supplied credentials."""
        return {
            "openfda": "live",
            "gemini": "live" if self.gemini_ready else "fallback",
            "bigquery": "live" if self.bigquery_ready else "fallback",
            "fivetran": "live" if self.fivetran_ready else "fallback",
        }

    @property
    def mode(self) -> str:
        status = self.integration_status()
        return "live" if all(v == "live" for v in status.values()) else "partial"


@lru_cache
def get_settings() -> Settings:
    return Settings()
