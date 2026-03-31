#!/usr/bin/env python3
"""
List all WhatsApp communities and their linked sub-groups.

Usage:
    python list_communities.py [--json] [--csv]

Environment variables required:
    WHAPI_TOKEN - Your Whapi.cloud API token
"""

import argparse
import csv
import json
import sys

from wa_client import WhatsAppClient


def list_communities(output_format="table"):
    """Retrieve and display all communities and their sub-groups."""
    client = WhatsAppClient()

    print("Fetching communities...\n", file=sys.stderr)
    communities = client.get_communities()

    if not communities:
        print("No communities found.", file=sys.stderr)
        return

    results = []

    for community in communities:
        community_id = community.get("id", "")
        community_name = (
            community.get("subject", "")
            or community.get("name", "")
            or community_id
        )

        # Fetch linked sub-groups
        try:
            subgroups = client.get_community_subgroups(community_id)
        except Exception as e:
            print(f"  Warning: could not fetch subgroups for {community_name}: {e}", file=sys.stderr)
            subgroups = []

        entry = {
            "community_id": community_id,
            "community_name": community_name,
            "subgroups": [],
        }

        for sg in subgroups:
            gid = sg.get("id", "") or sg.get("groupId", "")
            gname = sg.get("subject", "") or sg.get("name", gid)
            entry["subgroups"].append({
                "group_id": gid,
                "group_name": gname,
            })

        results.append(entry)

    # Output
    if output_format == "json":
        print(json.dumps(results, indent=2, ensure_ascii=False))

    elif output_format == "csv":
        writer = csv.writer(sys.stdout)
        writer.writerow(["community_id", "community_name", "group_id", "group_name"])
        for r in results:
            if r["subgroups"]:
                for g in r["subgroups"]:
                    writer.writerow([
                        r["community_id"], r["community_name"],
                        g["group_id"], g["group_name"],
                    ])
            else:
                writer.writerow([r["community_id"], r["community_name"], "", ""])

    else:  # table
        for r in results:
            print(f"Community: {r['community_name']}")
            print(f"  ID: {r['community_id']}")
            if r["subgroups"]:
                print(f"  Sub-groups ({len(r['subgroups'])}):")
                for g in r["subgroups"]:
                    print(f"    - {g['group_name']} ({g['group_id']})")
            else:
                print("  Sub-groups: (none)")
            print()

    print(f"Total: {len(results)} communities found.", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description="List WhatsApp communities and sub-groups")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--csv", action="store_true", help="Output as CSV")
    args = parser.parse_args()

    fmt = "json" if args.json else "csv" if args.csv else "table"

    try:
        list_communities(output_format=fmt)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
