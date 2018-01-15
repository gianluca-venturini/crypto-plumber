import { Market, MarketTrades } from "../src/types";

export class TestMarket implements Market {
  incomingTradesCallbacks?: {
    [symbol: string]: (time: number, trades: MarketTrades) => void
  } = {};

  public subscribeToSymbol(
    symbol: string, 
    callback: (time: number, trades: MarketTrades) => void
  ) {
    this.incomingTradesCallbacks[symbol] = callback;
  }

  public dispatchTrades(symbol: string, time: number, trades: MarketTrades) {
    if (this.incomingTradesCallbacks[symbol]) {
      this.incomingTradesCallbacks[symbol](time, trades);
    }
  }
}