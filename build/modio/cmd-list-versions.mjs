import {listModVersions, onErr} from "./common.mjs";

export default {
  command: 'list-versions',
  describe: 'List published versions',
  async handler({token}) {
    try {
      for (const v of await listModVersions(token)) {
        console.log(v);
      }
    } catch (e) {
      onErr(e);
    }
  },
};
