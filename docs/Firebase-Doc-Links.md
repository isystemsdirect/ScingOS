# Firebase Docs Integration Guide (Option A)

This document explains how to implement the Option A approach: a server-side fetcher (Cloud Function) that downloads the repository docs index (docs/links_for_firebase.json) and caches each referenced Markdown document in Firestore under the `docs_index` collection. Firebase Studio or any admin UI can read from that collection.

Overview
- Fetch the canonical index from: https://raw.githubusercontent.com/isystemsdirect/ScingOS/main/docs/links_for_firebase.json
- For each entry, fetch the `raw` URL and store the Markdown content in Firestore.
- Trigger cache refresh via an authenticated HTTP POST (webhook) to the Cloud Function, or schedule periodic refreshes.

Files added by this guide (already prepared):
- cloud/functions/fetch_and_cache/index.js
- cloud/functions/fetch_and_cache/package.json
- .github/workflows/refresh_docs_on_push.yml

Prerequisites
- Firebase project with Firestore enabled (Native mode recommended).
- Firebase CLI installed and authenticated (firebase-tools).
- A GitHub repository with `main` branch and Actions enabled.

Steps

1) Deploy the Cloud Function

- From the `cloud/functions/fetch_and_cache` directory run:
  - npm install
  - firebase deploy --only functions:refreshDocs

- After deployment, note the HTTPS trigger URL for the function. Store it as a GitHub secret named `REFRESH_DOCS_ENDPOINT` (value should be the full URL).

2) Configure the GitHub Action

- The included workflow `.github/workflows/refresh_docs_on_push.yml` calls your function endpoint on each push to `main` using the repository secret `REFRESH_DOCS_ENDPOINT`.
- Make sure to add the secret in your repo Settings -> Secrets -> Actions.

3) Testing locally

- You can run the function locally with `firebase emulators:start --only functions` and POST to `http://localhost:5001/<PROJECT>/us-central1/refreshDocs`.
- Or run `node index.js` using a small wrapper for local testing (see comments in the function file).

Firestore structure (docs_index collection)
- Collection: `docs_index`
- Document ID: short key from index (for example, `ScingRundown`, `README`)
- Fields:
  - `key` (string)
  - `raw_url` (string)
  - `html_url` (string)
  - `description` (string)
  - `content` (string) - raw markdown text
  - `updated_at` (timestamp/string)

Security / Rate-limiting
- The function fetches raw.githubusercontent.com URLs publicly; no authentication is required for public repos. If any docs become private, update the function to use the GitHub API with token-based authentication.
- To prevent abuse of the refresh endpoint, configure IAM / HTTP auth (or require a secret header) and restrict the GitHub Action call to use that secret.

Notes on improvements
- Convert Markdown to HTML when caching if you want rendered content in the admin UI.
- Store an etag/sha to skip unchanged docs and save bandwidth.
- Use Firestore batched writes for atomic updates.
