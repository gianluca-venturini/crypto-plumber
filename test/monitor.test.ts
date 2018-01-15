import { CurrencyPairTradesCounter } from "../src/currency_pair";
import { Monitor } from "../src/monitor";
import { TestMarket } from "./utils";


describe("Monitor", () => {

    it("should flag the test currency pair", () => {
      const testMarket = new TestMarket();
      const symbol = 'tstbtc';
      const currencyPair = new CurrencyPairTradesCounter(
        symbol, testMarket
      );
      const monitor = new Monitor();
      monitor.addCurrencyPairTradeCounter(currencyPair);
      monitor.startMonitoring();

      testMarket.dispatchTrades(symbol, 0, {firstId: 1, lastId: 1, numberOfTrades: 1});
      testMarket.dispatchTrades(symbol, 1000, {firstId: 1, lastId: 1, numberOfTrades: 200});

      expect(monitor.flaggedPairs.has(symbol)).toBe(true);
    });

  });