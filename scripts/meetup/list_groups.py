#!/usr/bin/env python3
"""
List Meetup groups the authenticated user belongs to, or look up a group by URL name.

Usage:
    # List your groups
    python list_groups.py

    # Look up a specific group
    python list_groups.py --group python-meetup-nyc

    # Output as JSON or CSV
    python list_groups.py --json
    python list_groups.py --group python-meetup-nyc --csv

Environment variables required:
    MEETUP_ACCESS_TOKEN - Your Meetup OAuth2 access token
"""

import argparse
import csv
import json
import sys

from meetup_client import MeetupClient


def list_my_groups(client, output_format):
    """List all groups the authenticated user is part of."""
    print("Fetching your groups...\n", file=sys.stderr)
    user = client.get_self()
    user_name = user.get("name", "Unknown")
    memberships = user.get("memberships", {})
    edges = memberships.get("edges", [])
    groups = [e["node"] for e in edges if "node" in e]

    if not groups:
        print("No groups found.", file=sys.stderr)
        return

    results = []
    for g in groups:
        results.append({
            "id": g.get("id", ""),
            "name": g.get("name", ""),
            "urlname": g.get("urlname", ""),
            "city": g.get("city", ""),
            "state": g.get("state", ""),
            "country": g.get("country", ""),
            "member_count": g.get("memberships", {}).get("count", 0),
        })

    _output(results, output_format, title=f"Groups for {user_name}")


def lookup_group(client, urlname, output_format):
    """Look up a specific group by URL name."""
    print(f"Fetching group: {urlname}...\n", file=sys.stderr)
    g = client.get_group(urlname)

    if not g:
        print(f"Group '{urlname}' not found.", file=sys.stderr)
        return

    organizer = g.get("organizer", {})
    topics = [e["node"]["name"] for e in g.get("topics", {}).get("edges", []) if "node" in e]

    result = {
        "id": g.get("id", ""),
        "name": g.get("name", ""),
        "urlname": g.get("urlname", ""),
        "city": g.get("city", ""),
        "state": g.get("state", ""),
        "country": g.get("country", ""),
        "member_count": g.get("memberships", {}).get("count", 0),
        "organizer": organizer.get("name", ""),
        "topics": topics,
        "description": g.get("description", ""),
    }

    if output_format == "json":
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(f"Group: {result['name']}")
        print(f"  URL: meetup.com/{result['urlname']}")
        print(f"  Location: {result['city']}, {result['state']} {result['country']}")
        print(f"  Members: {result['member_count']}")
        print(f"  Organizer: {result['organizer']}")
        if topics:
            print(f"  Topics: {', '.join(topics)}")
        if result["description"]:
            desc = result["description"][:200]
            if len(result["description"]) > 200:
                desc += "..."
            print(f"  Description: {desc}")


def _output(results, output_format, title=""):
    """Format and print results."""
    if output_format == "json":
        print(json.dumps(results, indent=2, ensure_ascii=False))

    elif output_format == "csv":
        writer = csv.writer(sys.stdout)
        writer.writerow(["id", "name", "urlname", "city", "state", "country", "member_count"])
        for r in results:
            writer.writerow([
                r["id"], r["name"], r["urlname"],
                r["city"], r["state"], r["country"], r["member_count"],
            ])

    else:  # table
        if title:
            print(f"{title}\n")
        for r in results:
            location = ", ".join(filter(None, [r["city"], r["state"], r["country"]]))
            print(f"  {r['name']}")
            print(f"    URL: meetup.com/{r['urlname']}")
            print(f"    Location: {location}")
            print(f"    Members: {r['member_count']}")
            print()

    print(f"Total: {len(results)} groups.", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description="List Meetup groups")
    parser.add_argument(
        "--group", type=str,
        help="Look up a specific group by URL name (e.g., 'python-meetup-nyc')",
    )
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--csv", action="store_true", help="Output as CSV")
    args = parser.parse_args()

    fmt = "json" if args.json else "csv" if args.csv else "table"

    try:
        client = MeetupClient()

        if args.group:
            lookup_group(client, args.group, fmt)
        else:
            list_my_groups(client, fmt)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
