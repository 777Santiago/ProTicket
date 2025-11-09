from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    BUSINESS_DATABASE_URL: str

    model_config = SettingsConfigDict(env_file=str(BASE_DIR / ".env"))

settings = Settings()
