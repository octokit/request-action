const { inspect } = require("util");
const yaml = require("js-yaml");

const core = require("@actions/core");
const { Octokit } = require("@octokit/action");

main();

async function main() {
  if (!process.env.GITHUB_REPOSITORY) {
    core.setFailed(
      'GITHUB_REPOSITORY missing, must be set to "<repo owner>/<repo name>"'
    );
    return;
  }

  try {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
    const octokit = new Octokit();
    const { route, ...parameters } = getAllInputs();

    core.info(route);
    for (const [name, value] of Object.entries(parameters)) {
      core.info(`> ${name}: ${value}`);
    }

    if (/:owner/.test(route)) {
      parameters.owner = owner;
    }
    if (/:repo/.test(route)) {
      parameters.repo = repo;
    }

    core.debug(`route: ${inspect(route)}`);
    core.debug(`parameters: ${inspect(parameters)}`);
    core.debug(
      `parsed request options: ${inspect(
        octokit.request.endpoint(route, parameters)
      )}`
    );

    const time = Date.now();
    const { status, headers, data } = await octokit.request(route, parameters);

    core.info(`< ${status} ${Date.now() - time}ms`);

    core.setOutput("status", status);
    core.setOutput("headers", JSON.stringify(headers, null, 2));
    core.setOutput("data", JSON.stringify(data, null, 2));
  } catch (error) {
    core.debug(inspect(error));
    core.setFailed(error.message);
  }
}

function getAllInputs() {
  return Object.entries(process.env).reduce((result, [key, value]) => {
    if (!/^INPUT_/.test(key)) return result;

    const inputName = key.substr("INPUT_".length).toLowerCase();
    result[inputName] = yaml.safeLoad(value);
    return result;
  }, {});
}
