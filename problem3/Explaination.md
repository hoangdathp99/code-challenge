# WalletPage Code Review & Refactor

This document explains the **code review** and **refactored version** with improvements.

---

## 🔎 Issues and Anti-Patterns

### 1. Loose Typing (`any`)

- `getPriority` accepts `blockchain: any`.
- Loses TypeScript safety and may cause runtime errors.
- **Fix:** Use a union type (`'Osmosis' | 'Ethereum' | ...`) or an enum.

---

### 2. Incorrect Filtering Logic

```ts
balances.filter((balance: WalletBalance) => {
  const balancePriority = getPriority(balance.blockchain);
  if (lhsPriority > -99) {
    // lhsPriority not defined
    if (balance.amount <= 0) {
      return true;
    }
  }
  return false;
});
```

- `lhsPriority` is `undefined` (bug).

- Keeps balances with amount <= 0 (likely unintended).

- **Fix:** Keep only balances with valid priority and amount > 0.

### 3. Sorting Comparator Missing Equality

```ts
const leftPriority = getPriority(lhs.blockchain);
const rightPriority = getPriority(rhs.blockchain);
if (leftPriority > rightPriority) {
  return -1;
} else if (rightPriority > leftPriority) {
  return 1;
}
```

- Missing return 0 for equal `priorities` → unstable sort.
- **Fix:** Use return rightPriority - leftPriority;

### 4. Unnecessary Dependencies in useMemo

```ts
const sortedBalances = useMemo(() => {
  return balances
    .filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);
      if (lhsPriority > -99) {
        if (balance.amount <= 0) {
          return true;
        }
      }
      return false;
    })
    .sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      if (leftPriority > rightPriority) {
        return -1;
      } else if (rightPriority > leftPriority) {
        return 1;
      }
    });
}, [balances, prices]);
```

- `useMemo` depends on `[balances, prices]`, but `prices` is not used.
- Causes wasted recalculations when prices change.
- **Fix:** Remove prices from dependency array

### 5. Rendering Rows Without Memoization

```ts
    const rows = sortedBalances.map(...)
```

- Recomputed on every render.
- **Fix:** Wrap in useMemo

### 6. Using Index as Key

```ts
const rows = sortedBalances.map(
  (balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        className={classes.row}
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  }
);
```

- Anti-pattern in React. Causes reconciliation issues
- **Fix:** Use stable identifiers (e.g., balance.currency).

### 7. Improper Number Formatting

```ts
formatted: balance.amount.toFixed();
```
- Defaults to 0 decimals
- **Fix:** Explicitly format (toFixed(2) for money).
