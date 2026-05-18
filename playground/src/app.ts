/**
 * Returns the first n numbers in the Fibonacci sequence.
 * @param n The number of Fibonacci numbers to generate.
 * @returns An array containing the first n Fibonacci numbers.
 */
function fibonacci(n: number): number[] {
    const fibSequence: number[] = [];
    for (let i = 0; i < n; i++) {
        if (i === 0) {
            fibSequence.push(0);
        } else if (i === 1) {
            fibSequence.push(1);
        } else {
            fibSequence.push(fibSequence[i - 1] + fibSequence[i - 2]);
        }
    }
    return fibSequence;
}

const firstTenFibonacci = fibonacci(10);
console.log(firstTenFibonacci);
