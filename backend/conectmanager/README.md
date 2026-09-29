# Connector API

All routes below require `Authorization: Bearer <access_token>` from `/auth/login` (for an active user). Paths use the existing `conectmanager` Python folder but the HTTP prefix is `/connectmanager`. Open `/docs` for the interactive schema.

| Resource | Create | List |
| --- | --- | --- |
| Provider | `POST /connectmanager/providers` | `GET /connectmanager/providers` |
| Target | `POST /connectmanager/targets` | `GET /connectmanager/targets` |
| Client | `POST /connectmanager/clients` | `GET /connectmanager/clients` |

Example create bodies, in order:

```json
{"name":"Source A","body_data":"{}","base_link":"https://example.com","prompt_data":"prompt"}
```

```json
{"name":"Destination B","key":"secret","api_link":"https://example.org","data":"{}","prompt_data":"prompt"}
```

```json
{"name":"My connector","provider_id":"<id from provider response>","target_id":"<id from target response>","status":"pending"}
```

`status` can be `active`, `inactive`, or `pending` (default). Provider and Target names are required. Client references must point to records owned by the current user; missing or other users' IDs yield 404. Clients store IDs, not copies of the Provider/Target. Target `key` is stored but excluded from both create and list responses; treat the MongoDB collection and backups as sensitive. There is no update/delete or secret-retrieval endpoint yet.

All list routes return an array, most recent first; optional `skip` (default 0) and `limit` (default 50, max 100) query parameters control paging. Records are scoped to the authenticated user. No frontend forms were added.

To run the smoke tests from `backend/` after installing its dependencies:

```bash
pip install -q pytest mongomock-motor
python -m pytest -q tests/test_connector.py
```
