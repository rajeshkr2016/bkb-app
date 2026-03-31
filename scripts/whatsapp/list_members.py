#!/usr/bin/env python3
"""
List members of WhatsApp groups or all groups in a community.

Usage:
    # List members of a specific group
    python list_members.py --group "120363XXX@g.us"

    # List members of all groups in a community
    python list_members.py --community "120363XXX@g.us"

    # List members of all groups
    python list_members.py --all

    # Output as JSON or CSV
    python list_members.py --all --json
    python list_members.py --community "120363XXX@g.us" --csv > members.csv

Environment variables required:
    WHAPI_TOKEN - Your Whapi.cloud API token
"""

import argparse
import csv
import json
import sys

from wa_client import WhatsAppClient


def get_members_for_group(client, group_id):
    """Get group info and member list for a single group."""
    try:
        group_data = client.get_group(group_id)
    except Exception as e:
        return {
            "group_id": group_id,
            "group_name": "(error fetching)",
            "error": str(e),
            "member_count": 0,
            "members": [],
        }

    group_name = (
        group_data.get("subject", "")
        or group_data.get("name", "")
        or group_id
    )
    participants = group_data.get("participants", [])

    members = []
    for p in participants:
        member_id = p.get("id", "")
        role = p.get("rank", "") or p.get("role", "member")
        is_admin = role in ("admin", "superadmin") or p.get("isAdmin", False)
        members.append({
            "member_id": member_id,
            "phone": member_id.replace("@s.whatsapp.net", ""),
            "role": role,
            "is_admin": is_admin,
        })

    return {
        "group_id": group_id,
        "group_name": group_name,
        "member_count": len(members),
        "members": members,
    }


def list_community_members(client, community_id):
    """List members across all sub-groups of a community."""
    print(f"Fetching sub-groups for community: {community_id}...", file=sys.stderr)
    subgroups = client.get_community_subgroups(community_id)

    results = []
    for sg in subgroups:
        gid = sg.get("id", "") or sg.get("groupId", "")
        if gid:
            gname = sg.get("subject", "") or sg.get("name", gid)
            print(f"  Fetching members for: {gname}...", file=sys.stderr)
            result = get_members_for_group(client, gid)
            results.append(result)
    return results


def list_all_group_members(client):
    """List members across all groups."""
    groups = client.get_groups()
    results = []
    for g in groups:
        gid = g.get("id", "")
        if gid:
            gname = g.get("subject", "") or g.get("name", gid)
            print(f"  Fetching members for: {gname}...", file=sys.stderr)
            result = get_members_for_group(client, gid)
            results.append(result)
    return results


def output_results(results, output_format):
    """Format and print the results."""
    if output_format == "json":
        print(json.dumps(results, indent=2, ensure_ascii=False))

    elif output_format == "csv":
        writer = csv.writer(sys.stdout)
        writer.writerow(["group_id", "group_name", "member_id", "phone", "role", "is_admin"])
        for r in results:
            for m in r["members"]:
                writer.writerow([
                    r["group_id"], r["group_name"],
                    m["member_id"], m["phone"], m["role"], m["is_admin"],
                ])

    else:  # table
        for r in results:
            print(f"Group: {r['group_name']}")
            print(f"  ID: {r['group_id']}")
            print(f"  Members ({r['member_count']}):")
            if r.get("error"):
                print(f"    Error: {r['error']}")
            for m in r["members"]:
                role_label = f" ({m['role']})" if m["is_admin"] else ""
                print(f"    - {m['phone']}{role_label}")
            print()

    total_members = sum(r["member_count"] for r in results)
    total_groups = len(results)
    print(f"\nTotal: {total_members} members across {total_groups} groups.", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(
        description="List WhatsApp group/community members via Whapi.cloud"
    )
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument(
        "--group", type=str,
        help="Group ID to list members for (e.g., '120363XXX@g.us')",
    )
    source.add_argument(
        "--community", type=str,
        help="Community ID - lists members of all its sub-groups",
    )
    source.add_argument(
        "--all", action="store_true",
        help="List members of all groups",
    )
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--csv", action="store_true", help="Output as CSV")
    args = parser.parse_args()

    fmt = "json" if args.json else "csv" if args.csv else "table"

    try:
        client = WhatsAppClient()

        if args.group:
            print(f"Fetching members for group: {args.group}\n", file=sys.stderr)
            results = [get_members_for_group(client, args.group)]
        elif args.community:
            results = list_community_members(client, args.community)
        else:
            print("Fetching all groups and members...\n", file=sys.stderr)
            results = list_all_group_members(client)

        output_results(results, fmt)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
