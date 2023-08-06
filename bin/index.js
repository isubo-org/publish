import yargs from 'yargs';
import { main } from '../main.js';

yargs(process.argv.slice(2))
  .usage(
    `$0`,
    `Exec default cmd: 'isubo publish' to select posts for publishing.`,
    function builder(yargs) {
      return yargs;
    },
    async function handler() {
      await main();
    }
  )
  .parse()
