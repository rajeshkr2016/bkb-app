"""
Meetup GraphQL API client for retrieving groups and members.

API docs: https://www.meetup.com/api/guide/
GraphQL endpoint: https://api.meetup.com/gql
"""

import requests
from config import MEETUP_GQL_URL, MEETUP_ACCESS_TOKEN


class MeetupClient:
    """Client to interact with Meetup's GraphQL API."""

    def __init__(self, token=None):
        self.url = MEETUP_GQL_URL
        self.token = token or MEETUP_ACCESS_TOKEN
        if not self.token:
            raise ValueError(
                "MEETUP_ACCESS_TOKEN is not set. "
                "Set it as an environment variable or pass it to the constructor."
            )
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    def _query(self, query, variables=None):
        """Execute a GraphQL query."""
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
        resp = requests.post(
            self.url, json=payload, headers=self.headers, timeout=30
        )
        resp.raise_for_status()
        data = resp.json()
        if "errors" in data:
            errors = "; ".join(e.get("message", str(e)) for e in data["errors"])
            raise RuntimeError(f"GraphQL errors: {errors}")
        return data.get("data", {})

    # ---- Self / Current User ----

    def get_self(self):
        """Get the authenticated user's info and groups they belong to."""
        query = """
        query {
          self {
            id
            name
            email
            city
            country
            memberships {
              count
              edges {
                node {
                  id
                  name
                  urlname
                  city
                  state
                  country
                  memberships {
                    count
                  }
                }
              }
            }
          }
        }
        """
        return self._query(query).get("self", {})

    def get_my_groups(self):
        """Get all groups the authenticated user is a member of."""
        user = self.get_self()
        memberships = user.get("memberships", {})
        edges = memberships.get("edges", [])
        return [edge["node"] for edge in edges if "node" in edge]

    # ---- Group by URL name ----

    def get_group(self, urlname):
        """Get group details by its URL name (the slug in meetup.com/slug/).

        Args:
            urlname: The group's URL name (e.g., 'python-meetup-nyc').

        Returns:
            Dict with group details.
        """
        query = """
        query($urlname: String!) {
          groupByUrlname(urlname: $urlname) {
            id
            name
            urlname
            description
            city
            state
            country
            memberships {
              count
            }
            organizer {
              id
              name
            }
            topics {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
        """
        return self._query(query, {"urlname": urlname}).get("groupByUrlname", {})

    # ---- Group Members ----

    def get_group_members(self, urlname, first=50, cursor=None):
        """Get members of a group by its URL name.

        Args:
            urlname: The group's URL name.
            first: Number of members to fetch per page (max 50).
            cursor: Pagination cursor for fetching next page.

        Returns:
            Dict with edges (member list), pageInfo, and totalCount.
        """
        query = """
        query($urlname: String!, $first: Int, $after: String) {
          groupByUrlname(urlname: $urlname) {
            name
            memberships(first: $first, after: $after) {
              count
              pageInfo {
                hasNextPage
                endCursor
              }
              edges {
                node {
                  id
                  name
                  bio
                  city
                  country
                  memberPhoto {
                    source
                  }
                  role
                  joinedDate
                }
              }
            }
          }
        }
        """
        variables = {"urlname": urlname, "first": first}
        if cursor:
            variables["after"] = cursor
        result = self._query(query, variables).get("groupByUrlname", {})
        return result.get("memberships", {})

    def get_all_group_members(self, urlname, limit=None):
        """Fetch all members of a group, paginating automatically.

        Args:
            urlname: The group's URL name.
            limit: Max number of members to fetch (None = all).

        Returns:
            List of member dicts.
        """
        members = []
        cursor = None

        while True:
            batch_size = 50
            if limit:
                remaining = limit - len(members)
                if remaining <= 0:
                    break
                batch_size = min(50, remaining)

            data = self.get_group_members(urlname, first=batch_size, cursor=cursor)
            edges = data.get("edges", [])

            if not edges:
                break

            for edge in edges:
                node = edge.get("node", {})
                members.append(node)

            page_info = data.get("pageInfo", {})
            if not page_info.get("hasNextPage"):
                break
            cursor = page_info.get("endCursor")

        return members
