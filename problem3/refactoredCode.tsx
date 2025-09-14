//This is Refactored Code

//TODO: import necessary module
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

interface Props extends BoxProps {}

const priorityMap: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const WalletPage = ({ children, ...rest }: Props) => {
  const balances = useWalletBalances();
  const prices = usePrices();
  const getPriority = (blockchain: Blockchain): number =>
    priorityMap[blockchain] ?? -99;
  // Step 1: filter + sort balances
  const sortedBalances = useMemo(() => {
    return balances
      .filter((b) => getPriority(b.blockchain) > -99 && b.amount <= 0)
      .sort(
        (lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain)
      );
  }, [balances]);

  // Step 2: format balances
  const formattedBalances: FormattedWalletBalance[] = useMemo(
    () =>
      sortedBalances.map((b) => ({
        ...b,
        formatted: b.amount.toFixed(2), // e.g. 2 decimal places
      })),
    [sortedBalances]
  );

  // Step 3: build rows
  const rows = useMemo(
    () =>
      formattedBalances.map((balance) => {
        const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
        return (
          <WalletRow
            className={classes.row}
            key={balance.currency} // stable key
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.formatted}
          />
        );
      }),
    [formattedBalances, prices]
  );

  return <div {...rest}>{rows}</div>;
};
export default WalletPage;
