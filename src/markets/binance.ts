import * as WebSocket from "ws";
import {Market, MarketTrades} from "../types";

export class BinanceMarket implements Market {
  incomingTradesCallbacks?: {
    [symbol: string]: (time: number, trades: MarketTrades) => void
  } = {};

  private makeIncomingTrades(symbol: string) {
    return (data: WebSocket.Data) => {
      const parsedMessage = JSON.parse(`${data}`);
      if (this.incomingTradesCallbacks[symbol]) {
        this.incomingTradesCallbacks[symbol](Date.now(), {
          firstId: parsedMessage.f,
          lastId: parsedMessage.l,
          numberOfTrades: parsedMessage.l - parsedMessage.f,
        })
      }
    }
  }

  public subscribeToSymbol(
    symbol: string,
    callback: (time: number, trades: MarketTrades) => void,
  ) {
    const webSocketAggTrade = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@aggTrade`, {
        perMessageDeflate: false
    });
    webSocketAggTrade.on("message", this.makeIncomingTrades(symbol));

    this.incomingTradesCallbacks[symbol] = callback;
  }
}