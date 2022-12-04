import {setDefaultLogger} from '@aloreljs/rxutils';
import type {Signal} from '@preact/signals';
import {signal} from '@preact/signals';
import {render} from 'preact';
import './actions/actions.mjs';
import {TRIGGER_REGISTRY} from './lib/registries/trigger-registry.mjs';
import {errorLog} from './lib/util/log.mjs';
import './option-types/option-types.mjs';
import './triggers/index.mjs';
import App from './ui/app';
import {SIDENAV_ITEM} from './ui/sidebar-mgr.mjs';
import './ui/ui.mjs';

// ctx.api<Readonly<Api>>(api); // rollup will freeze it

setDefaultLogger(errorLog);

let sidenavIconContainer: Signal<HTMLSpanElement | null>;

ctx.onInterfaceReady(() => {
  // Don't start checking triggers for offline time
  for (const {def, id} of TRIGGER_REGISTRY.registeredObjects.values()) {
    try {
      def.init();
    } catch (e) {
      errorLog(`Failed to initialise trigger ${id}:`, e);
    }
  }

  sidenavIconContainer = signal<HTMLSpanElement | null>(null);
  render(<App sidenavIcon={sidenavIconContainer}/>, document.createElement('div'));

  sidebar
    .category('')
    .item('Action Workflows', {
      after: 'melvorD:Bank',
    });

  const iconContainer = SIDENAV_ITEM.value.iconEl;
  iconContainer.classList.remove('nav-img');
  iconContainer.innerHTML = '';

  sidenavIconContainer.value = iconContainer;
});
