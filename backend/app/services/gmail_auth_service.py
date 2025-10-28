from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import os

CLIENT_SECRETS_FILE = "client_secret.json"  # downloaded from Google Cloud
SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

class GmailAuthService:
    @staticmethod
    def get_auth_url():
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            redirect_uri="http://localhost:8000/api/v1/auth/google/callback"
        )
        auth_url, _ = flow.authorization_url(
            access_type="offline",
            prompt="consent"
        )
        return auth_url

    @staticmethod
    def exchange_code_for_tokens(code: str):
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            redirect_uri="http://localhost:8000/api/v1/auth/google/callback"
        )
        flow.fetch_token(code=code)
        credentials = flow.credentials
        return {
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_uri": credentials.token_uri,
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret,
        }
