import type {Observable, OperatorFunction} from 'rxjs';
import {catchError, concat, throwError} from 'rxjs';

/** Emt the given mapped value before throwing the error */
export default function prependErrorWith<I, O>(mapper: (e: Error) => Observable<O>): OperatorFunction<I, I | O> {
  return catchError((e: Error): Observable<O> => concat(mapper(e), throwError(() => e)));
}
