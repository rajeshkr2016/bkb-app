"""
Configuration for Whapi.cloud WhatsApp API client.

To get your credentials:
1. Sign up at https://whapi.cloud
2. Create a channel and connect your WhatsApp number
3. Copy your API Token from the channel settings

Set the token as an environment variable or create a .env file.
"""

import os

# Whapi.cloud API token - set via environment variable
WHAPI_TOKEN = os.environ.get("WHAPI_TOKEN", "")

# Base URL for Whapi.cloud
WHAPI_BASE_URL = "https://gate.whapi.cloud"
