export function swapSave<T>(arr: T[], current: number, next: number): void {
    if (current < 0 || current >= arr.length || next < 0 || next >= arr.length) {
        return;
    }
    const temp = arr[next];
    arr[next] = arr[current];
    arr[current] = temp;
}