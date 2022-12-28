import {memo} from 'preact/compat';
import {useCallback} from 'preact/hooks';
import {EMPTY_ARR} from '../../lib/util.mjs';
import {BlockDiv} from './block';

interface Props {
  err: Error;
}

export const UncaughtErrorBoilerplate = memo<Props>(
  function UncaughtErrorBoilerplate({children, err}) {
    const focusTA = useCallback((e: Event) => {
      (e.target as HTMLTextAreaElement).select();
    }, EMPTY_ARR);

    return (
      <BlockDiv>
        <div class={'alert alert-danger text-center'}>
          <div class={'font-w600'}>An uncaught error occurred</div>
          <span>{'Please open a bug report on the mod\'s '}</span>
          <a href={'https://github.com/Alorel/melvor-action-workflows/issues/new/choose'}
            target={'_blank'}
            rel={'noopener'}>GitHub</a>
          <span>{' and include the stack trace below:'}</span>
        </div>
        <textarea class={'form-control'} readonly={true} onClick={focusTA}>{err.stack}</textarea>
        {children}
      </BlockDiv>
    );
  }
);
