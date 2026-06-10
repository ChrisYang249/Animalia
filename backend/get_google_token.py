#!/usr/bin/env python3
"""One-time local script: run the Google OAuth consent flow and print a refresh token.

Usage:
    pip install google-auth-oauthlib
    python get_google_token.py /path/to/client_secret_XXXX.json

A browser window opens — sign in with the STAFF Google account whose calendar
will receive the adoption visit events. The refresh token is printed at the end;
copy it (and the client id/secret) into Render env vars.
"""

import sys

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/calendar.events"]


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: python get_google_token.py /path/to/client_secret.json")
        sys.exit(1)

    flow = InstalledAppFlow.from_client_secrets_file(sys.argv[1], SCOPES)
    # access_type=offline + prompt=consent guarantees a refresh token is issued
    creds = flow.run_local_server(port=0, access_type="offline", prompt="consent")

    print("\n=== Copy these into Render (animalia-api -> Environment) ===")
    print(f"GOOGLE_CLIENT_ID={creds.client_id}")
    print(f"GOOGLE_CLIENT_SECRET={creds.client_secret}")
    print(f"GOOGLE_REFRESH_TOKEN={creds.refresh_token}")
    print("GOOGLE_CALENDAR_ID=primary")


if __name__ == "__main__":
    main()
