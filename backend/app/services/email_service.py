from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from email.mime.text import MIMEText
import base64
import os

class EmailService:
    @staticmethod
    def send_invite_email_with_gmail_api(
        user,
        to_email: str,
        custom_message: str
    ) -> bool:
        """
        Send an email on behalf of a user using their Gmail OAuth tokens.
        """
        try:
            creds = Credentials(
                token=user.gmail_access_token,
                refresh_token=user.gmail_refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id="880394972027-ikeas0vl8iaibs9vml7c41l8367m3eid.apps.googleusercontent.com",
                client_secret="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"
            )

            service = build("gmail", "v1", credentials=creds)

            message_text = f"""
            Hi!

            {user.name} has invited you to join SeerSync.

            Message: {custom_message}

            Click here to sign up: https://your-app-link.com/signup
            """

            message = MIMEText(message_text)
            message["to"] = to_email
            message["from"] = user.email
            message["subject"] = f"Invitation from {user.name}"

            raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
            body = {"raw": raw}

            service.users().messages().send(userId="me", body=body).execute()

            print(f"✅ Email sent from {user.email} to {to_email}")
            return True

        except Exception as e:
            print(f"❌ Failed to send email via Gmail API: {e}")
            return False

email_service = EmailService()