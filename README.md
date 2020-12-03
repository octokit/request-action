# Octokit Request Action

> A GitHub Action to send arbitrary requests to GitHub's REST API

[![Build Status](https://github.com/octokit/request-action/workflows/Test/badge.svg)](https://github.com/octokit/request-action/actions)

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
          route: GET /repos/{repository}/releases/latest
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
          route: POST /repos/{repository}/check-runs
          repository: ${{ github.repository }}
          mediaType: | # The | is significant!
            previews: 
              - antiope
          name: "Test check run"
          head_sha: ${{ github.sha }}
          output: | # The | is significant!
            title: Test check run title
            summary: A summary of the test check run
            images:
              - alt: Test image
                image_url: https://octodex.github.com/images/jetpacktocat.png
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      # Update check run to completed, succesful status
      - uses: octokit/request-action@v2.x
        id: update_check_run
        with:
          route: PATCH /repos/{repository}/check-runs/{check_run_id}
          repository: ${{ github.repository }}
          mediaType: | # The | is significant!
            previews: 
              - antiope
          check_run_id: ${{ fromJson(steps.create_check_run.outputs.data).id }}
          conclusion: "success"
          status: "completed"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

To use request body parameters, simply pass in an `input` matching the parameter name. See previous examples.

## Debugging

To see additional debug logs, create a secret with the name: `ACTIONS_STEP_DEBUG` and value `true`.

## How it works

`octokit/request-action` is using [`@octokit/request`](https://github.com/octokit/request.js/) internally with the addition
that requests are automatically authenticated using the `GITHUB_TOKEN` environment variable. It is required to prevent rate limiting, as all anonymous requests from the same origin count against the same low rate.

The actions sets `data` output to the response data. The action also sets the `headers` (again, to a JSON string) and `status` output properties.

To access deep values of `outputs.data` and `outputs.headers`, check out the [fromJson](https://help.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions#fromjson) function.

## Warnings

The GitHub Actions runners are currently showing warnings when using this action that look like:

```
##[warning]Unexpected input 'repository', valid inputs are ['route', 'mediaType']
```

The reason for this warning is because the `repository` key is not listed as a possible value in `actions.yml`. This warning will appear for any key used under the `with` except `route` and `mediaType`. Due to the flexible nature of the required inputs depending on the `route`, not all of the possible paramters can be listed in `actions.yml`, so you will see this warning under normal usage of the action. As long as you see a 200 response code at the bottom of the output, everything should have worked properly and you can ignore the warnings. The response code will appear at the bottom of the output from the action and looks like:

```
< 200 451ms
```

See [Issue #26](https://github.com/octokit/request-action/issues/26) for more information.

## License

[MIT](LICENSE)
