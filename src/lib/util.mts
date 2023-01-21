export const EMPTY_OBJ: any = Object.freeze({});
export const EMPTY_ARR = Object.freeze<any[]>([]) as any[];

export function isFalsy(v: any): v is (0 | false | null | undefined | '') {
  return !v;
}

export function githubAsset(path: string, tag: string): string {
  return `https://raw.githubusercontent.com/Alorel/melvor-action-workflows/${tag}/${path}`;
}

