"""
WhatsApp client using Whapi.cloud API for retrieving communities, groups, and members.

API docs: https://whapi.readme.io/reference
"""

import requests
from config import WHAPI_BASE_URL, WHAPI_TOKEN


class WhatsAppClient:
    """Client to interact with WhatsApp via Whapi.cloud."""

    def __init__(self, token=None):
        self.base_url = WHAPI_BASE_URL
        self.token = token or WHAPI_TOKEN
        if not self.token:
            raise ValueError(
                "WHAPI_TOKEN is not set. "
                "Set it as an environment variable or pass it to the constructor."
            )
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/json",
        }

    def _get(self, path, params=None):
        """Make a GET request to Whapi.cloud."""
        url = f"{self.base_url}{path}"
        resp = requests.get(url, headers=self.headers, params=params, timeout=30)
        resp.raise_for_status()
        return resp.json()

    # ---- Communities ----

    def get_communities(self, count=100):
        """Get all communities.

        Returns:
            List of community objects with id, name, and metadata.
        """
        data = self._get("/communities", params={"count": count})
        return data.get("communities", data if isinstance(data, list) else [])

    def get_community_subgroups(self, community_id):
        """Get all sub-groups linked to a community.

        Args:
            community_id: The community ID (e.g., '120363XXX@g.us').

        Returns:
            List of linked sub-group objects.
        """
        data = self._get(f"/communities/{community_id}/subgroups")
        return data.get("groups", data if isinstance(data, list) else [])

    # ---- Groups ----

    def get_groups(self, count=100):
        """Get all groups the account is part of.

        Returns:
            List of group objects with id, name, participants, etc.
        """
        data = self._get("/groups", params={"count": count})
        return data.get("groups", data if isinstance(data, list) else [])

    def get_group(self, group_id):
        """Get detailed info about a specific group including participants.

        Args:
            group_id: The group chat ID (e.g., '120363XXX@g.us').

        Returns:
            Dict with group metadata and participant list.
        """
        return self._get(f"/groups/{group_id}")

    def get_group_members(self, group_id):
        """Get the member/participant list for a specific group.

        Args:
            group_id: The group chat ID.

        Returns:
            List of participant dicts.
        """
        group_data = self.get_group(group_id)
        return group_data.get("participants", [])
