import type {Subscriber} from 'rxjs';
import type {TriggerDefinitionContext} from '../../data/trigger-definition-context.mjs';

export class TriggerListener<T extends object = {}> {
  readonly #sub: Subscriber<void>;

  public constructor(
    public readonly ctx: TriggerDefinitionContext<T>,
    public readonly data: T,
    sub: Subscriber<void>
  ) {
    this.#sub = sub;
  }

  public notify(): void {
    this.#sub.next();
  }
}
