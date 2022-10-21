export interface Class<T> extends Function {
  new(...args: any[]): T;
}

export type InstanceOf<T> = T extends Class<infer O> ? O : never;
