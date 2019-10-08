# Octokit Request Action

> A GitHub Action to send arbiatary requests to GitHub's REST API

[![Build Status](https://github.com/octokit/core.js/workflows/Test/badge.svg)](https://github.com/octokit/core.js/actions)
[![Greenkeeper](https://badges.greenkeeper.io/octokit/core.js.svg)](https://greenkeeper.io/)

## Usage

Minimal example

```yml
Name: Log latest release
on:
  push:
    branches:
      - master

jobs:
  update_routes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - uses: octokit/request-action@v1.x
        id: get_latest_release
        with:
          route: GET /repos/:owner/:repo/releases/latest
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - run: "echo latest release: ${{ steps.get_latest_release.outputs.data }}"
```

## How it works

`octokit/request-action` is using [`@octokit/request`](https://github.com/octokit/request.js/) internally with some additions

1. Requests are authenticated using the `GITHUB_TOKEN` environment variable. It is required to prevent rate limiting, as all anonymous requsets from the same origin count against the same low rate.
2. The `owner` and `repo` parameters are preset to the repository that the action is run in.

The actions sets `data` output to the response data. Note that it is a string, you cannot access any keys of the response at this point. The action also sets `headers` (again, to a JSON string) and `status`.

## License

[MIT](LICENSE)
