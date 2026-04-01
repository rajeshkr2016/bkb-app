#!/usr/bin/env python3
"""
List members of a Meetup group.

Usage:
    # List members of a group
    python list_members.py --group python-meetup-nyc

    # Limit number of members
    python list_members.py --group python-meetup-nyc --limit 100

    # Output as JSON or CSV
    python list_members.py --group python-meetup-nyc --json
    python list_members.py --group python-meetup-nyc --csv > members.csv

Environment variables required:
    MEETUP_ACCESS_TOKEN - Your Meetup OAuth2 access token
"""

import argparse
import csv
import json
import sys

from meetup_client import MeetupClient


def list_members(client, urlname, limit, output_format):
    """Retrieve and display members of a group."""
    print(f"Fetching members for group: {urlname}...\n", file=sys.stderr)

    # First get group info for context
    group = client.get_group(urlname)
    group_name = group.get("name", urlname)
    total_count = group.get("memberships", {}).get("count", "?")
    print(f"Group: {group_name} ({total_count} total members)", file=sys.stderr)

    if limit:
        print(f"Fetching up to {limit} members...", file=sys.stderr)

    members = client.get_all_group_members(urlname, limit=limit)

    if not members:
        print("No members found.", file=sys.stderr)
        return

    results = []
    for m in members:
        results.append({
            "id": m.get("id", ""),
            "name": m.get("name", ""),
            "role": m.get("role", "member"),
            "city": m.get("city", ""),
            "country": m.get("country", ""),
            "bio": (m.get("bio") or "")[:100],
            "joined_date": m.get("joinedDate", ""),
            "photo": (m.get("memberPhoto") or {}).get("source", ""),
        })

    # Output
    if output_format == "json":
        print(json.dumps(results, indent=2, ensure_ascii=False))

    elif output_format == "csv":
        writer = csv.writer(sys.stdout)
        writer.writerow(["id", "name", "role", "city", "country", "bio", "joined_date", "photo"])
        for r in results:
            writer.writerow([
                r["id"], r["name"], r["role"],
                r["city"], r["country"], r["bio"],
                r["joined_date"], r["photo"],
            ])

    else:  # table
        print(f"\nMembers of {group_name}:\n")
        for r in results:
            role_label = f" ({r['role']})" if r["role"] and r["role"] != "member" else ""
            location = ", ".join(filter(None, [r["city"], r["country"]]))
            loc_str = f" - {location}" if location else ""
            print(f"  {r['name']}{role_label}{loc_str}")

    print(f"\nFetched: {len(results)} members.", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description="List Meetup group members")
    parser.add_argument(
        "--group", type=str, required=True,
        help="Group URL name (e.g., 'python-meetup-nyc')",
    )
    parser.add_argument(
        "--limit", type=int, default=None,
        help="Max number of members to fetch (default: all)",
    )
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--csv", action="store_true", help="Output as CSV")
    args = parser.parse_args()

    fmt = "json" if args.json else "csv" if args.csv else "table"

    try:
        client = MeetupClient()
        list_members(client, args.group, args.limit, fmt)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
