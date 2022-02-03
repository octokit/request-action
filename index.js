const { inspect } = require("util");
const yaml = require("js-yaml");

const core = require("@actions/core");
const { Octokit } = require("@octokit/action");

main();

async function main() {
  const time = Date.now();

  try {
    const octokit = new Octokit();
    const { route, ...parameters } = getAllInputs();

    core.info(route);
    for (const [name, value] of Object.entries(parameters)) {
      core.info(`> ${name}: ${value}`);
    }

    // workaround for https://github.com/octokit/request-action/issues/71
    // un-encode "repo" in /repos/{repo} URL when "repo" parameter is set to ${{ github.repository }}
    const { url, body, ...options } = octokit.request.endpoint(
      route,
      parameters
    );
    const requestOptions = {
      ...options,
      data: body,
      url: url.replace(
        /\/repos\/([^/]+)/,
        (_, match) => "/repos/" + decodeURIComponent(match)
      ),
    };

    core.debug(`route: ${inspect(route)}`);
    core.debug(`parameters: ${inspect(parameters)}`);
    core.debug(`parsed request options: ${inspect(requestOptions)}`);

    const { status, headers, data } = await octokit.request(requestOptions);

    core.info(`< ${status} ${Date.now() - time}ms`);

    core.setOutput("status", status);
    core.setOutput("headers", JSON.stringify(headers, null, 2));
    core.setOutput(
      "data",
      typeof data === "string" ? data : JSON.stringify(data, null, 2)
    );
  } catch (error) {
    if (error.status) {
      core.info(`< ${error.status} ${Date.now() - time}ms`);
    }

    core.setOutput("status", error.status);
    core.debug(inspect(error));
    core.setFailed(error.message);
  }
}

function getAllInputs() {
  return Object.entries(process.env).reduce((result, [key, value]) => {
    if (!/^INPUT_/.test(key)) return result;

    const inputName =
      key.toLowerCase() === "input_mediatype"
        ? "mediaType"
        : key.substr("INPUT_".length).toLowerCase();
    result[inputName] = yaml.load(value);

    return result;
  }, {});
}
