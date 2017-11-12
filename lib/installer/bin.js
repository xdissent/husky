"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var execa = require("execa");
var path = require("path");
var _1 = require("./");
// Action can be "install" or "uninstall"
// huskyDir is ONLY used in dev, don't use this arguments
var _a = process.argv, action = _a[2], _b = _a[3], huskyDir = _b === void 0 ? path.join(__dirname, '../..') : _b;
// Find Git dir
var _c = execa.sync('git', ['rev-parse', '--git-dir']), status = _c.status, stdout = _c.stdout, stderr = _c.stderr;
var gitDir = path.resolve(stdout); // Needed to normalize path on Windows
if (status !== 0) {
    console.log(stderr);
    process.exit(1);
}
// Run installer
if (action === 'install') {
    _1.install(gitDir, huskyDir);
}
else {
    _1.uninstall(gitDir, huskyDir);
}
