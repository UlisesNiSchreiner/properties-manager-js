/**
 * Sum numbers.
 * @example
 * sum(2, 3) // => 5
 */
export function sum(a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new TypeError("Both arguments must be finite numbers");
  }

  return a + b;
}
