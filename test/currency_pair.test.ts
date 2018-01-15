import { CurrencyPairTradesCounter, RETENTION_TIME } from "../src/currency_pair";
import { TestMarket } from "./utils";

describe("CurrencyPairTransactionCounter", () => {
    it("should return the number of trades in the current bucket", () => {
      const testMarket = new TestMarket();
      const symbol = 'tstbtc';
      const currencyPair = new CurrencyPairTradesCounter(
        symbol, testMarket
      );
      testMarket.dispatchTrades(symbol, 1, {firstId: 1, lastId: 1, numberOfTrades: 1});
      const trades = currencyPair.countTradesInBucket(currencyPair.newestBucketStored);
      expect(trades).toBe(1);
    });

    it("should return the number of trades in the current bucket for two symbols", () => {
      const testMarket = new TestMarket();
      const symbol1 = 'tst1btc';
      const symbol2 = 'tst2btc';
      const currencyPair1 = new CurrencyPairTradesCounter(
        symbol1, testMarket
      );
      const currencyPair2 = new CurrencyPairTradesCounter(
        symbol2, testMarket
      );
      testMarket.dispatchTrades(symbol1, 1, {firstId: 1, lastId: 11, numberOfTrades: 11});
      testMarket.dispatchTrades(symbol2, 1, {firstId: 1, lastId: 7, numberOfTrades: 7});
      const trades1 = currencyPair1.countTradesInBucket(currencyPair1.newestBucketStored);
      const trades2 = currencyPair2.countTradesInBucket(currencyPair2.newestBucketStored);
      expect(trades1).toBe(11);
      expect(trades2).toBe(7);
    });

    it("should return the rate with zero offset", () => {
      const testMarket = new TestMarket();
      const symbol = 'tstbtc';
      const currencyPair = new CurrencyPairTradesCounter(
        symbol, testMarket
      );
      testMarket.dispatchTrades(symbol, 0, {firstId: 1, lastId: 1, numberOfTrades: 50});
      testMarket.dispatchTrades(symbol, 1000, {firstId: 1, lastId: 1, numberOfTrades: 30});
      testMarket.dispatchTrades(symbol, 2000, {firstId: 1, lastId: 1, numberOfTrades: 10});
      testMarket.dispatchTrades(symbol, 5000, {firstId: 1, lastId: 1, numberOfTrades: 10});

      expect(currencyPair.getRate(1, 0)).toBe(10);
      expect(currencyPair.getRate(2, 0)).toBe(5);
      expect(currencyPair.getRate(5, 0)).toBe(20);
    });

    it("should return the rate with default offset", () => {
      const testMarket = new TestMarket();
      const symbol = 'tstbtc';
      const currencyPair = new CurrencyPairTradesCounter(
        symbol, testMarket
      );
      testMarket.dispatchTrades(symbol, 0, {firstId: 1, lastId: 1, numberOfTrades: 50});
      testMarket.dispatchTrades(symbol, 1000, {firstId: 1, lastId: 1, numberOfTrades: 30});
      testMarket.dispatchTrades(symbol, 2000, {firstId: 1, lastId: 1, numberOfTrades: 10});
      testMarket.dispatchTrades(symbol, 5000, {firstId: 1, lastId: 1, numberOfTrades: 10});
      testMarket.dispatchTrades(symbol, 6000, {firstId: 1, lastId: 1, numberOfTrades: 1});

      expect(currencyPair.getRate(5)).toBe(20);
    });

    it("should return the maximum", () => {
      const testMarket = new TestMarket();
      const symbol = 'tstbtc';
      const currencyPair = new CurrencyPairTradesCounter(
        symbol, testMarket
      );
      testMarket.dispatchTrades(symbol, 0, {firstId: 1, lastId: 1, numberOfTrades: 50});
      testMarket.dispatchTrades(symbol, 1000, {firstId: 1, lastId: 1, numberOfTrades: 30});
      testMarket.dispatchTrades(symbol, 2000, {firstId: 1, lastId: 1, numberOfTrades: 10});
      testMarket.dispatchTrades(symbol, 5000, {firstId: 1, lastId: 1, numberOfTrades: 10});
      testMarket.dispatchTrades(symbol, 6000, {firstId: 1, lastId: 1, numberOfTrades: 100});

      expect(currencyPair.getMaximum(5)).toBe(50);
      expect(currencyPair.getMaximum(5, 0)).toBe(100);
    });

    it("should clean old entries for preventing memory leaks", () => {
      const testMarket = new TestMarket();
      const symbol = 'tstbtc';
      const currencyPair = new CurrencyPairTradesCounter(
        symbol, testMarket
      );
      for (let i = 0; i < RETENTION_TIME + 10; i++) {
        testMarket.dispatchTrades(symbol, i * 1000, {firstId: 1, lastId: 1, numberOfTrades: 1});
      }

      expect(currencyPair.countTradesInBucket(currencyPair.newestBucketStored)).toBe(1);
      expect(currencyPair.countTradesInBucket(currencyPair.newestBucketStored - RETENTION_TIME - 5)).toBe(0);
    });
  });