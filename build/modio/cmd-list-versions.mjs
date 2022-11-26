import {listModVersions, onErr} from "./common.mjs";

export default {
  command: 'list-versions',
  describe: 'List published versions',
  async handler({token}) {
    try {
      for (const {version, id} of await listModVersions(token)) {
        console.log(id, '~', version);
      }
    } catch (e) {
      onErr(e);
    }
  },
};
