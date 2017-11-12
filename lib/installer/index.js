"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var is_ci_1 = require("is-ci");
var path = require("path");
var pkgDir = require("pkg-dir");
var readPkg = require("read-pkg");
var getScript_1 = require("./getScript");
var is_1 = require("./is");
var hookList = [
    'applypatch-msg',
    'pre-applypatch',
    'post-applypatch',
    'pre-commit',
    'prepare-commit-msg',
    'commit-msg',
    'post-commit',
    'pre-rebase',
    'post-checkout',
    'post-merge',
    'pre-push',
    'pre-receive',
    'update',
    'post-receive',
    'post-update',
    'push-to-checkout',
    'pre-auto-gc',
    'post-rewrite',
    'sendemail-validate'
];
function writeHook(filename, script) {
    fs.writeFileSync(filename, script, 'utf-8');
    fs.chmodSync(filename, parseInt('0755', 8));
}
function createHook(filename, script) {
    // Get name, used for logging
    var name = path.basename(filename);
    // Check if hook exist
    if (fs.existsSync(filename)) {
        var hook = fs.readFileSync(filename, 'utf-8');
        // Migrate
        if (is_1.isGhooks(hook)) {
            console.log("migrating existing ghooks script: " + name + " ");
            return writeHook(filename, script);
        }
        // Migrate
        if (is_1.isPreCommit(hook)) {
            console.log("migrating existing pre-commit script: " + name);
            return writeHook(filename, script);
        }
        // Update
        if (is_1.isHusky(hook)) {
            return writeHook(filename, script);
        }
        // Skip
        console.log("skipping existing user hook: " + name);
        return;
    }
    // Create hook if it doesn't exist
    writeHook(filename, script);
}
function createHooks(filenames, script) {
    filenames.forEach(function (filename) { return createHook(filename, script); });
}
function canRemove(filename) {
    if (fs.existsSync(filename)) {
        var data = fs.readFileSync(filename, 'utf-8');
        return is_1.isHusky(data);
    }
    return false;
}
function removeHook(filename) {
    fs.unlinkSync(filename);
}
function removeHooks(filenames) {
    filenames.filter(canRemove).forEach(removeHook);
}
function getHooks(gitDir, hooks) {
    var gitHooksDir = path.join(gitDir, 'hooks');
    return hooks.map(function (hookName) { return path.join(gitHooksDir, hookName); });
}
function getConf(huskyDir) {
    var pkg = readPkg.sync(huskyDir);
    var defaults = {
        hooks: {},
        skipCI: true
    };
    return __assign({}, defaults, pkg.husky);
}
exports.getConf = getConf;
function install(gitDir, huskyDir) {
    console.log('husky > setting up git hooks');
    var userDir = pkgDir.sync(path.join(huskyDir, '..'));
    var conf = getConf(userDir);
    if (is_ci_1.default && conf.skipCI) {
        console.log('CI detected, skipping Git hooks installation"');
        return;
    }
    if (userDir === null) {
        console.log("Can't find package.json, skipping Git hooks installation");
        return;
    }
    if (path.join(userDir, '.git') !== gitDir) {
        console.log("Expecting package.json to be at the same level than .git, skipping Git hooks installation");
        console.log("gitDir: " + gitDir);
        console.log("userDir: " + userDir);
        return;
    }
    // Create hooks
    var hooks = getHooks(gitDir, hookList.filter(function (hookName) { return hookName in conf.hooks; }));
    var script = getScript_1.default(userDir);
    createHooks(hooks, script);
    console.log("husky > done");
}
exports.install = install;
function uninstall(gitDir, huskyDir) {
    console.log('husky > uninstalling git hooks');
    var userDir = pkgDir.sync(path.join(huskyDir, '..'));
    var conf = getConf(userDir);
    if (path.join(userDir, '.git') === gitDir) {
        // Remove hooks
        var hooks = getHooks(gitDir, hookList.filter(function (hookName) { return hookName in conf.hooks; }));
        removeHooks(hooks);
    }
    console.log('husky > done');
}
exports.uninstall = uninstall;
