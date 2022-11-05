import type {Subscriber} from 'rxjs';
import type {TriggerDefinitionContext} from '../data/trigger-definition-context.mjs';

export const TRIGGER_REGISTRY = new NamespaceRegistry<TriggerDefinitionContext<any>>(game.registeredNamespaces);

export class TriggerListener<T extends object = {}> {
  private readonly _sub: Subscriber<void>;

  public constructor(
    public readonly ctx: TriggerDefinitionContext<T>,
    public readonly data: T,
    sub: Subscriber<void>
  ) {
    this._sub = sub;
  }

  public check(): boolean {
    return this.ctx.def.check(this.data);
  }

  public notify(): void {
    this._sub.next();
  }
}
