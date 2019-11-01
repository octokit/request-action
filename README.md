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

More complex `POST` example

```yml
name: Create file
on:
  push:
    branches:
    - master

jobs:
  create-file:
    runs-on: ubuntu-latest
    steps:
    - uses: octokit/request-action@v1.x
      id: create_file
      with:
        route: PUT /repos/:owner/:repo/contents/:path
        path: 'test.txt'
        message: 'Test commit'
        content: 'dGVzdAo='
        committer: '{"name": "Monalisa Octocat", "email": "octocat@github.com"}'
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    - run: |
        echo "${{ steps.create_file.outputs.data }}"
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
