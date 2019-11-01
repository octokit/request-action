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
      - uses: octokit/request-action@v1.x
        id: get_latest_release
        with:
          route: GET /repos/:owner/:repo/releases/latest
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - run: "echo latest release: ${{ steps.get_latest_release.outputs.data }}"
```

More complex examples involving `POST`, setting headers, parsing output data, and dates

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
    - uses: octokit/request-action@v1.x
      id: create_check_run
      with:
        route: POST /repos/:owner/:repo/check-runs
        headers: '{"accept": "application/vnd.github.antiope-preview+json"}'
        name: 'Test check run'
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
    - uses: octokit/request-action@v1.x
      id: update_check_run
      with:
        route: PATCH /repos/:owner/:repo/check-runs/:check_run_id
        check_run_id: ${{ steps.parse_create_check_run.outputs.id }}
        headers: '{"accept": "application/vnd.github.antiope-preview+json"}'
        conclusion: 'success'
        status: 'completed'
        completed_at: '"2019-11-01T13:59:43.227Z"'
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

To access deep values of `outputs.data`, check out [`gr2m/get-json-paths-action`](https://github.com/gr2m/get-json-paths-action).

## Inputs

To use request body parameters, simply pass in an `input` matching the parameter name. See previous examples.

## Debugging

To see additional debug logs, create a secret with the name: `ACTIONS_STEP_DEBUG` and value `true`.

## How it works

`octokit/request-action` is using [`@octokit/request`](https://github.com/octokit/request.js/) internally with some additions

1. Requests are authenticated using the `GITHUB_TOKEN` environment variable. It is required to prevent rate limiting, as all anonymous requsets from the same origin count against the same low rate.
2. The `owner` and `repo` parameters are preset to the repository that the action is run in.

The actions sets `data` output to the response data. Note that it is a string, you cannot access any keys of the response at this point. The action also sets `headers` (again, to a JSON string) and `status`.

## License

[MIT](LICENSE)
