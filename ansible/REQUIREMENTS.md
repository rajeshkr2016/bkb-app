# Ansible Requirements

This document lists the control node and target host requirements for the Metro bundler nginx deployment.

## Control Node (where you run Ansible)

- Ansible `core` 2.13+ (or full Ansible 6+)
- Python 3.8+
- SSH access to target hosts
- Inventory configured in `ansible/inventory/hosts.ini`

## Target Hosts (Ubuntu)

- Ubuntu (tested with 20.04/22.04+) with sudo access
- OpenSSH server running and reachable
- Ports `80` and `443` open
- DNS for `metro_web_domain` and `metro_mobile_domain` pointing to the host

## Packages Installed By the Role

The role installs these packages on the target host:

- `nginx`
- `certbot` (optional, only if `metro_certbot_enabled: true`)
- `python3-certbot-nginx` (optional, only if `metro_certbot_enabled: true`)
- `openssl` (optional, only if `metro_self_signed_enabled: true`)

## External Ansible Dependencies

- No required collections or Galaxy roles.

## TLS Certificates

You must provide certificates if `metro_certbot_enabled` is `false`:

- `metro_ssl_cert_path`
- `metro_ssl_key_path`

If you enable Let’s Encrypt with `metro_certbot_enabled: true`, the role will request certificates for both domains.

If you enable self-signed certs with `metro_self_signed_enabled: true`, the role will generate a local certificate using OpenSSL.
The role will renew the cert automatically if it expires within `metro_self_signed_renew_before` seconds.
