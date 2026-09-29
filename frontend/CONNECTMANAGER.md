# Connector frontend

The sidebar has Providers, Targets, and Clients dropdowns, each with Add and All pages. Routes are `/connectmanager/{providers|targets|clients}/{add|all}` and require authentication. TanStack Query is already in `package.json` and is now mounted in `App.tsx`. The existing Axios client attaches the bearer token and handles unauthorized responses. Connector queries use user-scoped keys; login/logout clears the query cache.

Create a Provider and Target before adding a Client. Client dropdowns load all available pages (up to 100 items per request); client records refer to IDs and list views show the corresponding names. The Target key is entered only when creating a Target and is never displayed afterward, because the backend does not return it. There are no edit, delete, or secret-retrieval endpoints in the backend yet, so the UI only supports Add and All.

Lists page through the API 20 records at a time (the backend does not return a total count). A full last page may allow navigation to an empty next page; use Previous to go back.

Run `npm ci && npm run build` from `frontend/`. `npm run lint` cannot run on the existing repository until an ESLint flat-config file is added (no config currently exists).
