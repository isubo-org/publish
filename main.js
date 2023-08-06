import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import prompts from 'prompts';
import { enumPublishTagType } from "./src/constant/index.js";
import { hinter } from './src/util/index.js';
import { isReleaseVersion, parseTagFrom } from './src/util/common.js';
import { execSync, spawnSync } from 'child_process';
import { conf } from './src/constant/conf.js';

function getPkgData() {
  const ret = JSON.parse(fs.readFileSync(conf.pkgJsonPath, 'utf8'));
  return ret;
}

function loginIf() {
  // const warn = (val) => streamlog(`\n${chalk.bgYellowBright(chalk.black('WARN'))} ${val}`);
  const { owner } = getPkgData();
  const ret = spawnSync('npm', ['whoami'], {
    encoding: 'utf8'
  });
  const username = ret.stdout.replace('\n', '')
  // const username = 'isaacgan';

  if (!username) {
    hinter.warn('No login information');
  }

  if (username !== owner) {
    hinter.warn(`Expected ${chalk.greenBright(owner)}, but currently has login information for ${chalk.greenBright(username)}`)
  }

  if (!username || username !== owner) {
    execSync('npm login', { stdio: 'inherit' });
  }
}

async function selectTag() {
  const { version } = getPkgData();
  const choices = Object.values(enumPublishTagType).map(tag => ({
    title: tag,
    value: tag
  }));
  const tag = (await prompts({
    type: 'select',
    name: 'value',
    message: `${chalk.greenBright('The current version is')} ${chalk.bgWhite(chalk.black(` ${version} `))}`,
    choices
  })).value;

  return tag;
}

export function execmdSync(cmd, cwd) {
  hinter.cmd(cmd);
  execSync(cmd, {
    stdio: 'inherit',
    cwd: cwd || conf.distDirPath
  });
}

export async function getPublishCmdBy({ version }) {
  let tag = parseTagFrom({ version });
  const cmdMade = (tag) => `npm publish --tag ${tag}`;

  if (tag) {
    return cmdMade(tag);
  }

  if (isReleaseVersion(version)) {
    return cmdMade(enumPublishTagType.LATEST);
  }

  tag = await selectTag();
  return cmdMade(tag);
}

function excludepRrops(src, ...keys) {
  const ret = {};
  for (const [key, val] of Object.entries(src)) {
    if (!keys.includes(key)) {
      ret[key] = val;
    }
  }
  return ret;
}

export function deleteScripts() {
  const pkgJson = getPkgData();
  let distPkg = pkgJson;
  const PUBLISH_CWD = conf.distDirPath;
  const distPkgPath = path.join(PUBLISH_CWD, 'package.json');
  let shouldUpdate = false;

  if (!fs.existsSync(distPkgPath)) {
    throw new Error(`${distPkgPath} not exist!`);
  }

  if (pkgJson?.scripts) {
    distPkg = {
      ...pkgJson,
      scripts: excludepRrops(
        pkgJson.scripts,
        'build',
        'prepare',
        'publish',
        'postversion'
      )
    };

    shouldUpdate = true;
  }

  if (shouldUpdate) {
    fs.writeFileSync(distPkgPath, JSON.stringify(distPkg, null, 2));
  }
}

export function runBuildScriptIf() {
  const { scripts } = getPkgData();

  if (!scripts?.build) {
    return;
  }

  execmdSync(scripts.build, process.cwd());
}

export async function prepare() {
  let cmd = '';
  try {
    runBuildScriptIf();

    const { version } = getPkgData();
    const PUBLISH_CWD = conf.distDirPath;

    if (!fs.existsSync(PUBLISH_CWD)) {
      hinter.error(chalk.redBright(`${PUBLISH_CWD} missing build artifacts!`));
      return;
    }

    loginIf();

    cmd = await getPublishCmdBy({ version });

    deleteScripts();
  } catch (error) {
    hinter.error(chalk.redBright(error.message));
  }

  return cmd;
}

export async function main() {
  try {
    const cmd = await prepare();
    if (!cmd) {
      return;
    }

    execmdSync(cmd);
  } catch (error) {
    console.info(`✖ ${chalk.redBright(error.message)}`);
  }
}