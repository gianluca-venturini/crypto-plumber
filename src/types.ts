export interface MarketTrades {
  firstId: number;
  lastId: number;
  numberOfTrades: number;
}

export interface Market {
  /**
   * Start listening on a certain symbol of the market.
   */
  subscribeToSymbol(
    symbol: string, 
    callback: (time: number, trades: MarketTrades) => void
  ): void;
}