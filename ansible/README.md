# Metro Bundler Nginx (Ansible)

This directory contains Ansible assets to deploy nginx as a TLS-terminating reverse proxy for Metro bundlers (web + mobile). It includes a role, a playbook, an inventory example, and a configurable nginx template.

## Quick Start

1. Update variables in `ansible/group_vars/all.yml`.
2. Update host(s) in `ansible/inventory/hosts.ini`.
3. Run the playbook:

```bash
ansible-playbook -i ansible/inventory/hosts.ini ansible/playbooks/metro-nginx-role.yml
```

## Files

- Role: `ansible/roles/metro_nginx/`
- Playbook (role-based): `ansible/playbooks/metro-nginx-role.yml`
- Inventory example: `ansible/inventory/hosts.ini`
- Variables: `ansible/group_vars/all.yml`
- Template: `ansible/roles/metro_nginx/templates/nginx-metro-bundler.conf.j2`

## Required Variables

Set these in `ansible/group_vars/all.yml`:

- `metro_web_domain`
- `metro_mobile_domain`
- `metro_web_upstream` (host:port)
- `metro_mobile_upstream` (host:port)
- `metro_ssl_cert_path`
- `metro_ssl_key_path`

## Optional Variables

Defaults live in `ansible/roles/metro_nginx/defaults/main.yml`:

- `metro_web_upstream_scheme` (default `http`)
- `metro_mobile_upstream_scheme` (default `http`)
- `metro_web_upstream_verify` (default `on`)
- `metro_mobile_upstream_verify` (default `on`)
- `metro_web_upstream_ca_cert` (default `/etc/ssl/certs/ca-certificates.crt`)
- `metro_mobile_upstream_ca_cert` (default `/etc/ssl/certs/ca-certificates.crt`)
- `metro_extra_server_names` (default empty, space-separated)
- `metro_rate_limit` (default `20r/s`)
- `metro_rate_limit_burst` (default `40`)
- `metro_cache_path` (default `/var/cache/nginx/metro`)
- `metro_cache_zone_size` (default `50m`)
- `metro_cache_max_size` (default `1g`)
- `metro_cache_inactive` (default `30m`)
- `metro_cache_valid_success` (default `10m`)
- `metro_cache_valid_404` (default `1m`)
- `metro_certbot_enabled` (default `false`)
- `metro_certbot_email` (default `ops@example.com`)
- `metro_self_signed_enabled` (default `false`)
- `metro_self_signed_days` (default `365`)
- `metro_self_signed_subject` (default `/C=US/ST=CA/L=San Francisco/O=Metro/OU=Dev/CN=localhost`)
- `metro_self_signed_sans` (default empty list)
- `metro_self_signed_renew_before` (default `2592000` seconds)

## Let’s Encrypt

If you want the role to request/renew certificates automatically:

1. Set `metro_certbot_enabled: true`.
2. Set `metro_certbot_email` to your ops email.
3. Ensure DNS for both domains points to the host and port 80 is reachable.

## Self-Signed Certificates

If you want the role to generate a self-signed certificate:

1. Set `metro_self_signed_enabled: true`.
2. Ensure `metro_ssl_cert_path` and `metro_ssl_key_path` point to desired locations.
3. Optionally customize `metro_self_signed_subject` and `metro_self_signed_sans`.

Note: self-signed certs will trigger browser warnings unless you trust the cert.

## Notes

- The nginx template defines `limit_req_zone` and `proxy_cache_path`, so it must be included from the `http` context (standard on Ubuntu via `sites-enabled/*`).
- Metro uses WebSockets for HMR; the template includes required headers and HTTP/1.1 settings.
- The playbooks explicitly load [all.yml](/Users/rradhakrishnan/projects/bkb-app/ansible/group_vars/all.yml), so variable loading does not depend on the current working directory.
