import {distinctWithInitial} from '@aloreljs/rxutils/operators';
import {memo} from 'preact/compat';
import {useEffect, useState} from 'preact/hooks';
import {map, skip} from 'rxjs';
import WorkflowRegistry from '../../lib/registries/workflow-registry.mjs';
import {EMPTY_ARR} from '../../lib/util.mjs';
import {PauseSvg, PlaySvg} from './svg';

const SidenavIcon = memo(() => {
  const [running, setRunning] = useState(false);
  useEffect(() => {
    const sub = WorkflowRegistry.inst.primaryExecution$
      .pipe(
        map(Boolean),
        distinctWithInitial(running),
        skip(1)
      )
      .subscribe(setRunning);
    return () => {
      sub.unsubscribe();
    };
  }, EMPTY_ARR);

  const Comp = running ? PlaySvg : PauseSvg;

  return <Comp class={'mr-1'}/>;
});

export default SidenavIcon;
