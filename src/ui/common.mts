import type {ComponentProps} from 'melvor';

export function createPageContainerId(templateId: string): string {
  return `${templateId}-container`;
}

export function makeComponent<T extends object>($template: string, def: T): T & ComponentProps {
  return Object.assign(def, {$template});
}

