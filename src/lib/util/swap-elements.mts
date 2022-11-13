export default function swapElements(arr: any[], idxA: number, idxB: number): void {
  const oldA = arr[idxA];
  arr[idxA] = arr[idxB];
  arr[idxB] = oldA;
}
