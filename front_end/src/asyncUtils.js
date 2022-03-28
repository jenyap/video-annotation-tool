function runAsync(fn, ...args) {
    return new Promise(resolve => {
        setTimeout(() => {
            const res = fn(...args);
            resolve(res);
        }, 0);
    });
}

export default {
    runAsync
}