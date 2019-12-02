# Octokit Request Action

> A GitHub Action to send arbitrary requests to GitHub's REST API

[![Build Status](https://github.com/octokit/request-action/workflows/Test/badge.svg)](https://github.com/octokit/request-action/actions)
[![Greenkeeper](https://badges.greenkeeper.io/octokit/request-action.svg)](https://greenkeeper.io/)

## Usage

Minimal example

```yml
Name: Log latest release
on:
  push:
    branches:
      - master

jobs:
  logLatestRelease:
    runs-on: ubuntu-latest
    steps:
      - uses: octokit/request-action@v2.x
        id: get_latest_release
        with:
          route: GET /repos/:repository/releases/latest
          repository: ${{ github.repository }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - run: "echo latest release: ${{ steps.get_latest_release.outputs.data }}"
```

More complex examples involving `POST`, setting custom media types, and parsing output data

```yml
name: Check run
on:
  push:
    branches:
      - master

jobs:
  create-file:
    runs-on: ubuntu-latest
    steps:
      # Create check run
      - uses: octokit/request-action@v2.x
        id: create_check_run
        with:
          route: POST /repos/:repository/check-runs
          repository: ${{ github.repository }}
          mediaType: '{"previews": ["antiope"]}'
          name: "Test check run"
          head_sha: ${{ github.sha }}
          output: '{"title":"Test check run title","summary": "A summary of the test check run", "images": [{"alt": "Test image", "image_url": "https://octodex.github.com/images/jetpacktocat.png"}]}'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      # Parse steps.create_check_run.outputs.data, since it is a string
      - id: parse_create_check_run
        uses: gr2m/get-json-paths-action@v1.x
        with:
          json: ${{ steps.create_check_run.outputs.data }}
          id: "id"

      # Update check run to completed, succesful status
      - uses: octokit/request-action@v2.x
        id: update_check_run
        with:
          route: PATCH /repos/:repository/check-runs/:check_run_id
          repository: ${{ github.repository }}
          mediaType: '{"previews": ["antiope"]}'
          check_run_id: ${{ steps.parse_create_check_run.outputs.id }}
          conclusion: "success"
          status: "completed"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

To access deep values of `outputs.data`, check out [`gr2m/get-json-paths-action`](https://github.com/gr2m/get-json-paths-action).

## Inputs

To use request body parameters, simply pass in an `input` matching the parameter name. See previous examples.

## Debugging

To see additional debug logs, create a secret with the name: `ACTIONS_STEP_DEBUG` and value `true`.

## How it works

`octokit/request-action` is using [`@octokit/request`](https://github.com/octokit/request.js/) internally with the addition
that requests are automatically authenticated using the `GITHUB_TOKEN` environment variable. It is required to prevent rate limiting, as all anonymous requsets from the same origin count against the same low rate.

The actions sets `data` output to the response data. Note that it is a string, you cannot access any keys of the response at this point. The action also sets `headers` (again, to a JSON string) and `status`.

## License

[MIT](LICENSE)
