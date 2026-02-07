"""Multi-account OAuth authentication for Gmail."""

import json
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

# Gmail API scopes - read-only for safety
SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.labels",
]


class AuthError(Exception):
    """Authentication error."""

    pass


class AuthManager:
    """Manages OAuth credentials for multiple Gmail accounts."""

    def __init__(self, credentials_dir: Path):
        self.credentials_dir = credentials_dir
        self.credentials_dir.mkdir(parents=True, exist_ok=True)

    def _account_dir(self, account: str) -> Path:
        """Get the directory for an account's credentials."""
        return self.credentials_dir / account

    def _token_path(self, account: str) -> Path:
        """Get the token file path for an account."""
        return self._account_dir(account) / "token.json"

    def _client_secrets_path(self, account: str) -> Path:
        """Get the client secrets file path for an account."""
        return self._account_dir(account) / "client_secrets.json"

    def list_accounts(self) -> list[str]:
        """List all authenticated accounts."""
        accounts = []
        if self.credentials_dir.exists():
            for path in self.credentials_dir.iterdir():
                if path.is_dir() and (path / "token.json").exists():
                    accounts.append(path.name)
        return sorted(accounts)

    def get_credentials(self, account: str) -> Credentials:
        """Get valid credentials for an account, refreshing if needed."""
        token_path = self._token_path(account)

        if not token_path.exists():
            raise AuthError(
                f"Account '{account}' not authenticated. "
                f"Run: gmail-mcp auth --account {account}"
            )

        creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)

        # Refresh if expired
        if creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                # Save refreshed token
                with open(token_path, "w") as f:
                    f.write(creds.to_json())
            except Exception as e:
                raise AuthError(f"Failed to refresh credentials for '{account}': {e}")

        if not creds.valid:
            raise AuthError(
                f"Invalid credentials for '{account}'. "
                f"Re-authenticate: gmail-mcp auth --account {account}"
            )

        return creds

    def authenticate(self, account: str, credentials_file: Path | None = None) -> Credentials:
        """Run OAuth flow for an account."""
        account_dir = self._account_dir(account)
        account_dir.mkdir(parents=True, exist_ok=True)

        client_secrets = self._client_secrets_path(account)

        # Copy credentials file if provided
        if credentials_file:
            if not credentials_file.exists():
                raise AuthError(f"Credentials file not found: {credentials_file}")
            # Validate it's a valid OAuth client credentials file
            with open(credentials_file) as f:
                data = json.load(f)
            if "installed" not in data and "web" not in data:
                raise AuthError(
                    "Invalid credentials file. Download OAuth client credentials "
                    "(not service account) from Google Cloud Console."
                )
            # Copy to account directory
            with open(client_secrets, "w") as f:
                json.dump(data, f, indent=2)

        if not client_secrets.exists():
            raise AuthError(
                f"No client secrets for account '{account}'. "
                f"Provide --credentials-file on first auth."
            )

        # Run OAuth flow
        flow = InstalledAppFlow.from_client_secrets_file(str(client_secrets), SCOPES)
        creds = flow.run_local_server(port=0)

        # Save token
        token_path = self._token_path(account)
        with open(token_path, "w") as f:
            f.write(creds.to_json())

        return creds
