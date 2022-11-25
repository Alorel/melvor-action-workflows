import yargs from 'yargs';
import {onErr} from "./modio/common.mjs";
import cmdUpload from "./modio/cmd-upload.mjs";
import cmdRmModfileVersions from "./modio/cmd-rm-modfile-versions.mjs";
import cmdNextDevVersion from "./modio/cmd-next-dev-version.mjs";
import cmdListVersions from "./modio/cmd-list-versions.mjs";

yargs(process.argv.slice(2))
  .option('token', {
    demandOption: false,
    describe: 'mod.io API token',
    string: true,
  })
  .command(cmdUpload)
  .command(cmdRmModfileVersions)
  .command(cmdNextDevVersion)
  .command(cmdListVersions)
  .demandCommand()
  .strictCommands()
  .parseAsync()
  .catch(onErr);
