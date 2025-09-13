# CI Logs & Artifact Retrieval Guide

This short guide shows three ways to get GitHub Actions logs and the `pages-summary` artifact produced by the CI workflow.

1) GitHub Web UI (easy)
  - Open the PR or commit page on GitHub.
  - Click the `Actions` tab or the workflow run link in the PR.
  - Select the run you want, then on the left choose the job (e.g., `test`).
  - To download logs: click the `Download logs` button (top right, three dots menu) and extract the ZIP.
  - To download artifacts: scroll to the bottom of the job summary and expand **Artifacts**, then click the `pages-summary` artifact and download.

2) GitHub CLI (`gh`) — recommended for automation
  - Install: https://cli.github.com/
  - Authenticate: `gh auth login`
  - List runs for repo: `gh run list --repo OWNER/REPO` (replace OWNER/REPO)
  - Get run id (from list) and download artifact:
    ```bash
    gh run download <run-id> --repo OWNER/REPO --name pages-summary -D ./downloads
    ```
  - The artifact will be saved under `./downloads`.

3) GitHub REST API (curl) — for environments without `gh`
  - Get workflow runs: `curl -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/OWNER/REPO/actions/runs"`
  - Use the run id to list artifacts: `curl -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/OWNER/REPO/actions/runs/<run-id>/artifacts"`
  - Download artifact URL (it will be a `zip`), then unzip locally.

Running the analyzer locally
  - Ensure the artifact `pages-summary.json` is available under `test-results/pages-summary.json` or pass the path explicitly.
  - Run:
    ```bash
    node scripts/parse-pages-summary.js test-results/pages-summary.json
    ```
  - Or simply:
    ```bash
    node scripts/parse-pages-summary.js
    ```

Share with me
  - If you want me to analyze the results, either attach `pages-summary.json` here or paste its contents. I can also analyze the job logs if you provide the `logs.zip` from the run.
