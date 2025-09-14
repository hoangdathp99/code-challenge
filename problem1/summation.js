// Summation using a for loop
function summationForLoop(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

// Summation using recursion
function summationRecursion(n) {
  if (n === 0) {
    return 0;
  } else {
    return n + summationRecursion(n - 1);
  }
}

// Summation using reduce
function summationReduce(n) {
  return Array.from({ length: n }, (_, i) => i + 1).reduce((sum, current) => sum + current, 0);
}

