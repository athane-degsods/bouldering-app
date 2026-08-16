/* global require, module, __dirname */
/* eslint-disable @typescript-eslint/no-require-imports */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// 1. Define paths to the project root and monorepo workspace root
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 2. Watch all files in the monorepo root
config.watchFolders = [workspaceRoot];

// 3. Force Metro to resolve packages from both project and root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 4. Configure server to serve static files from public directory
config.server = {
  ...config.server,
  rewriteRequestUrl: (url) => {
    if (url.startsWith('/index.html')) {
      return url;
    }
    return url;
  },
};

module.exports = config;