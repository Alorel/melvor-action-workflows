interface ToJSON<T = unknown> {
  toJSON(): T;
}

export function toJsonMapper<T extends ToJSON<any>>(value: T): ReturnType<T['toJSON']> {
  return value.toJSON();
}

export class DeserialisationError<T = unknown> extends Error {
  public constructor(public readonly data: T, message?: string) {
    super(message);
    this.name = 'DeserialisationError';
  }
}
