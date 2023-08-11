import chalk from 'chalk'

export function streamlog(text) {
  process.stderr.write(text + '\n');
}

export function info(text) {
  const prefix = chalk.bgGreen(chalk.black(' INFO '));
  streamlog(`${prefix} ${text}`);
}

export function warn(text) {
  const prefix = chalk.bgGreen(chalk.black(' WARN '));
  streamlog(`${prefix} ${text}`);
}

export function error(text) {
  const prefix = chalk.bgRedBright(chalk.black(' ERROR '));
  streamlog(`${prefix} ${chalk.redBright(text)}`);
}

export function cmd(text) {
  const prefix = chalk.bgGreenBright(chalk.black(' CMD '));
  streamlog(`${prefix} ${text}`);
}