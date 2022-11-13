export type Writable<T extends object> = {
  -readonly [P in keyof T]: T[P];
};
