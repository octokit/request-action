// See: https://rollupjs.org/introduction/

import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const config = {
  input: "index.js",
  output: {
    esModule: true,
    file: "dist/index.js",
    format: "es",
    sourcemap: false,
  },
  plugins: [commonjs(), nodeResolve({ preferBuiltins: true })],
};

export default config;
