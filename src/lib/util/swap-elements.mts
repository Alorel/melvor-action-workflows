/** Swap the two array elements */
export default function swapElements(arr: any[], idxA: number, idxB: number): boolean {
  if (idxA < 0 || idxB < 0 || idxA === idxB || idxA >= arr.length || idxB >= arr.length) {
    return false;
  }

  const oldA = arr[idxA];
  arr[idxA] = arr[idxB];
  arr[idxB] = oldA;

  return true;
}
