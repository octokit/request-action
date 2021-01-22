const { inspect } = require("util");
const yaml = require("js-yaml");

const core = require("@actions/core");
const { Octokit } = require("@octokit/action");

main();

async function main() {
  try {
    const octokit = new Octokit();
    const { route, ...parameters } = getAllInputs();

    core.info(route);
    for (const [name, value] of Object.entries(parameters)) {
      core.info(`> ${name}: ${value}`);
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

    const inputName =
      key.toLowerCase() === "input_mediatype"
        ? "mediaType"
        : key.substr("INPUT_".length).toLowerCase();
    result[inputName] = yaml.load(value);

    return result;
  }, {});
}
