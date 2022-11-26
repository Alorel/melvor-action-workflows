import {readFile} from "node:fs/promises";
import axios, {AxiosError} from "axios";
import yargs from "yargs";

export const baseUrl = 'https://api.mod.io/v1/games/2869/mods/2407492';

export const shouldPrompt = yargs(process.argv.slice(2))
  .option('prompt', {
    boolean: true,
    default: false,
    describe: 'Prompt for inputs',
  })
  .parse()
  .prompt;

export async function listModVersions(token) {
  const tok = await loadToken(token);
  const {data: {data}} = await axios
    .get(`${baseUrl}/files?_sort=-date_added&_limit=100`, {
      headers: baseHeaders(tok),
    });

  return data.map(({id, version}) => ({id, version}));
}

export function baseHeaders(token) {
  return {Authorization: `Bearer ${token}`};
}

export async function loadToken(rawToken) {
  if (rawToken !== 'auto') {
    return rawToken;
  }

  try {
    return (await readFile('./api-token', 'utf8')).trim();
  } catch {
    throw new Error('API token local file not found');
  }
}

export function onErr(e) {
  console.error('ERR');

  if (e instanceof AxiosError) {
    console.error(e.response.data);
  } else {
    console.error(e);
  }

  process.exit(1);
}
