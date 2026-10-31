# config.py
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Folder the API serves at "/" (the website itself)
    FRONTEND_DIR: str = str(BASE_DIR.parent / "frontend")

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        extra="ignore",
    )

    @field_validator("DATABASE_URL")
    @classmethod
    def use_psycopg3_driver(cls, value: str) -> str:
        # requirements.txt installs psycopg (v3), so make plain
        # postgresql:// URLs use it instead of the old psycopg2 driver.
        if value.startswith("postgres://"):
            value = "postgresql://" + value[len("postgres://"):]
        if value.startswith("postgresql://"):
            value = "postgresql+psycopg://" + value[len("postgresql://"):]
        return value


settings = Settings()


# ---- Library rules (single source of truth, also sent to the frontend) ----

LATE_FEE_PER_DAY = 10  # rupees per day after the due date

# duration in days -> (label, price in rupees)
ISSUE_PLANS = {
    7: ("7 Days", 20),
    15: ("15 Days", 35),
    30: ("30 Days", 50),
    60: ("2 Months", 80),
    180: ("6 Months", 200),
}
