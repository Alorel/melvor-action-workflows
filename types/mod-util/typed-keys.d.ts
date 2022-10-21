/**
 * Return those keys of "O" where the key's type defined on the "O" interface (O[key]) is T
 * E.g. `TypedKeys<IProfileConfig, string>` means "return all keys of IProfileConfig where the key's type is string"
 */
export type TypedKeys<O extends object, T> = {[K in keyof O]: O[K] extends T ? K : never}[keyof O];
