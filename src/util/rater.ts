export function debounce(func: (...args: any[]) => void, delay: number): (...args: any[]) => void {
    let timeoutId: NodeJS.Timeout;

    return function (...args: any[]) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

export function throttle(func: (...args: any[]) => void, delay: number): (...args: any[]) => void {
    let timeoutId: NodeJS.Timeout;
    let lastExecTime = 0;

    return function (...args: any[]) {
        const currentTime = Date.now();

        if (currentTime - lastExecTime < delay) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                lastExecTime = currentTime;
                func.apply(this, args);
            }, delay);
        } else {
            lastExecTime = currentTime;
            func.apply(this, args);
        }
    };
}