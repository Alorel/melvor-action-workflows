import {Observable} from 'rxjs';
import type {SweetAlertOptions} from 'sweetalert2';

export function showExportModal(title: string, contents: any): void {
  const html = document.createElement('textarea');
  html.addEventListener('click', () => {
    html.select();
  });
  html.rows = 5;
  html.classList.add('form-control');
  html.textContent = JSON.stringify(contents);
  html.readOnly = true;

  Swal
    .fire({
      confirmButtonText: 'OK',
      html,
      showCancelButton: false,
      showConfirmButton: true,
      title,
    })
    .catch(console.error);
}

/** @return Pasted JSON */
export function showImportModal(
  title: string,
  validate: Exclude<SweetAlertOptions['inputValidator'], undefined>
): Observable<string> {
  return new Observable<string>(subscriber => {
    Swal
      .fire({
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Import',
        input: 'textarea',
        inputValidator: v => v ? validate(v) : 'Nothing typed in',
        showCancelButton: true,
        showConfirmButton: true,
        title,
      })
      .then(rsp => {
        if (rsp.isConfirmed) {
          subscriber.next(rsp.value);
        }
        subscriber.complete();
      })
      .catch(e => {
        subscriber.error(e);
      });
  });
}
