import {baseHeaders, baseUrl, loadToken} from "./common.mjs";
import axios, {AxiosError} from "axios";
import {chunk} from "lodash-es";

export default {
  builder: {
    versions: {
      demandOption: true,
      type: 'array',
    },
  },
  command: 'rm-modfiles',
  describe: 'Remove modfile versions',
  async handler({token, versions}) {
    const cfg = {
      headers: {
        ...baseHeaders(await loadToken(token)),
        'content-type': 'application/x-www-form-urlencoded',
      },
    };

    const runVersion = async versionId => {
      try {
        await axios.delete(`${baseUrl}/files/${versionId}`, cfg);
        console.log(versionId, 'deleted');
      } catch (e) {
        const msg = e instanceof AxiosError ? e.response.data : e;
        console.error('Error deleting', versionId, msg);
      }
    };

    const runChunk = async versionsChunk => {
      await Promise.all(versionsChunk.map(runVersion))
    };

    await Promise.all(chunk(versions, 3).map(runChunk));
  }
};
