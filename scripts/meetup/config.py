"""
Configuration for Meetup GraphQL API client.

To get your credentials:
1. Go to https://www.meetup.com/api/oauth/list/ to manage OAuth consumers
2. Create an OAuth consumer at https://www.meetup.com/api/oauth/create/
3. Use the OAuth2 server flow to obtain an access token

Or for quick testing:
1. Visit https://www.meetup.com/api/playground/
2. Copy the access token from the Authorization header

Set the token as an environment variable or create a .env file.
"""

import os

# Meetup OAuth2 access token
MEETUP_ACCESS_TOKEN = os.environ.get("MEETUP_ACCESS_TOKEN", "")

# Meetup GraphQL endpoint
MEETUP_GQL_URL = "https://api.meetup.com/gql"
