import {Observable} from 'rxjs';
import type {SweetAlertOptions} from 'sweetalert2';

const baseOpts: Partial<SweetAlertOptions> = {
  cancelButtonColor: '#d33',
  cancelButtonText: 'Cancel',
  showCancelButton: true,
  showConfirmButton: true,
};

export function alertError(text: string, title = 'Confirmation'): void {
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
