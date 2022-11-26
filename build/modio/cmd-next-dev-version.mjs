import {listModVersions, onErr} from "./common.mjs";

export default {
  builder: {
    tag: {
      default: 'alpha',
      type: 'string',
    },
  },
  command: 'next-dev-version',
  describe: 'Fetch the latest published version',
  async handler({tag, token}) {

    try {
      const [inc, curr] = await Promise.all([
        import('semver/functions/inc.js').then(v => v.default),
        Promise
          .all([
            import('semver/functions/parse.js').then(v => v.default),
            listModVersions(token)
          ])
          .then(([parse, rawVersions]) => {
            const versions = rawVersions.map(({version}) => parse(version));
            versions.sort((a, b) => a.compare(b));

            return versions[versions.length - 1];
          }),
      ]);

      const next = inc(
        curr,
        curr.prerelease.length ? 'prerelease' : 'preminor',
        false,
        tag
      );

      console.log(next);
    } catch (e) {
      onErr(e);
    }
  },
};
