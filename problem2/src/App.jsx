import { useQuery } from "@tanstack/react-query";
import { Button, Form, Image, Input, message, Select, Spin, Card } from "antd";
import { useCallback, useState } from "react";
import "./App.css";
import "@ant-design/v5-patch-for-react-19";

function App() {
  const [result, setResult] = useState(0);
  const [calculating, setCalcuating] = useState(false);
  const {
    data: tokenPrices,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tokenPrices"],
    queryFn: async () => {
      const response = await fetch(
        "https://interview.switcheo.com/prices.json"
      );
      const data = await response.json();
      // Filter out tokens without a price and convert the array to an object with symbol as key
      const tokenObject = data
        .filter((item) => item.price !== null && item.price !== undefined)
        .reduce((obj, item) => {
          obj[item.currency] = item;
          return obj;
        }, {});
      return tokenObject;
    },
  });

  const getTokenImageUrl = useCallback((symbol) => {
    return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`;
  }, []);

  const handleSwap = useCallback(
    (values) => {
      const { fromCurrency, toCurrency, amount } = values;
      setCalcuating(true)
      if (
        !tokenPrices ||
        !tokenPrices[fromCurrency] ||
        !tokenPrices[toCurrency]
      ) {
        message.error("Invalid currency selection.");
        setResult(0);
        return;
      }
      const fromPrice = tokenPrices[fromCurrency]?.price || 0;
      const toPrice = tokenPrices[toCurrency]?.price || 0;
      const exchangeRate = fromPrice / toPrice;
      setTimeout(() => {
        setResult(amount * exchangeRate);
        setCalcuating(false);
      }, 2000);
    },
    [tokenPrices]
  );

  if (isLoading) return <Spin fullscreen spinning></Spin>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="App">
      <Card
        title="Currency Swap"
        style={{
          width: "100%",
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Form
          name="currencySwapForm"
          layout="vertical"
          style={{ width: "100%" }}
          onFinish={handleSwap}
        >
          <Form.Item
            label="From:"
            name="fromCurrency"
            rules={[{ required: true, message: "Please select a currency" }]}
          >
            {tokenPrices && Object.keys(tokenPrices).length > 0 ? (
              <Select
                showSearch
                placeholder="Select a currency"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                optionRender={(option) => (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={option.data.image}
                      width={20}
                      style={{ marginRight: 8 }}
                    />
                    {option.data.label}
                  </div>
                )}
                options={Object.keys(tokenPrices).map((symbol) => ({
                  value: symbol,
                  label: symbol,
                  image: getTokenImageUrl(symbol),
                }))}
              />
            ) : (
              <div>Loading...</div>
            )}
          </Form.Item>

          <Form.Item
            label="Amount:"
            name="amount"
            rules={[{ required: true, message: "Please enter an amount" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="To:"
            name="toCurrency"
            rules={[{ required: true, message: "Please select a currency" }]}
          >
            {tokenPrices && Object.keys(tokenPrices).length > 0 ? (
              <Select
                showSearch
                placeholder="Select a currency"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                optionRender={(option) => (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={option.data.image}
                      width={20}
                      style={{ marginRight: 8 }}
                    />
                    {option.data.label}
                  </div>
                )}
                options={Object.keys(tokenPrices).map((symbol) => ({
                  value: symbol,
                  label: symbol,
                  image: getTokenImageUrl(symbol),
                }))}
              />
            ) : (
              <div>Loading...</div>
            )}
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={calculating}>
              Swap
            </Button>
          </Form.Item>

          <Spin spinning={calculating}>
            <div className="result" style={{ marginTop: 24, fontSize: "1.2rem" }}>
              Result: {result.toFixed(6)}
            </div>
          </Spin>
        </Form>
      </Card>
    </div>
  );
}

export default App;
