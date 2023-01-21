import {Observable} from 'rxjs';
import type {SweetAlertOptions} from 'sweetalert2';

const baseOpts: Partial<SweetAlertOptions> = {
  cancelButtonColor: '#d33',
  cancelButtonText: 'Cancel',
  showCancelButton: true,
  showConfirmButton: true,
};

/** Make an error alert message */
export function alertError(text: string, title = 'Uh oh'): void {
  Swal
    .fire({
      ...baseOpts,
      cancelButtonText: 'Oh no',
      confirmButtonText: 'OK',
      showConfirmButton: false,
      text,
      title,
    })
    .catch(console.error);
}

/** Make an error info message */
export function alertInfo(text: string, title = 'Action Workflows'): void {
  Swal
    .fire({
      ...baseOpts,
      showCancelButton: false,
      showCloseButton: true,
      showConfirmButton: false,
      text,
      title,
    })
    .catch(console.error);
}

/** Make an confirmation alert message. Emits if the confirmation is confirmed. */
export function alertConfirm(text: string, title = 'Confirmation'): Observable<void> {
  return new Observable<void>(subscriber => {
    Swal
      .fire({
        ...baseOpts,
        text,
        title,
      })
      .then(
        v => {
          if (v.isConfirmed) {
            subscriber.next();
          }
          subscriber.complete();
        },
        e => {
          console.error(e);
          subscriber.complete();
        }
      );
  });
}
