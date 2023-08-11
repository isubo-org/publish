import yargs from 'yargs';
import { main } from '../main.js';

yargs(process.argv.slice(2))
  .usage(
    `$0`,
    `Exec default cmd: 'isubo publish' to select posts for publishing.`,
    function builder(yargs) {
      return yargs;
    },
    async function handler(argv) {
      await main(argv);
    }
  )
  .option('skin-login', {
    demandOption: true,
    default: false,
    describe: 'Skin login with password',
    type: 'boolean'
  })
  .option('skin-build', {
    demandOption: true,
    default: false,
    describe: 'Skin exec build script at packsge.json',
    type: 'boolean'
  })
  .parse()
