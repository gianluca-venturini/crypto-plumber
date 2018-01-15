import * as express from "express";
import * as config from "config";
import * as _ from "underscore";
import { CurrencyPairTradesCounter } from "./currency_pair";
import { BinanceMarket } from "./markets/binance";
import { Monitor } from "./monitor";

// Create Express server
const app = express();

const MAX_EXPORTED_SECONDS = 20 * 60; // 20 minutes

app.get('/', function(req, res) {
  res.setHeader('Content-Type', 'text/csv');

  const symbols = _.keys(monitor.currencyPairs);

  symbols.forEach((symbol: string) => {
    res.write(',');
    res.write(symbol);
  });
  res.write('\r\n');

  let oldestBucketStored = Number.MAX_SAFE_INTEGER;
  let newestBucketStored = 0;
  symbols.forEach((symbol: string) => {
    oldestBucketStored = Math.min(
      monitor.currencyPairs[symbol].oldestBucketStored || Number.MAX_SAFE_INTEGER, 
      oldestBucketStored,
    );
    newestBucketStored = Math.max(
      monitor.currencyPairs[symbol].newestBucketStored || 0,
      newestBucketStored,
    );
  });
  console.log(oldestBucketStored, newestBucketStored);

  for (let bucket = oldestBucketStored; bucket <= newestBucketStored; bucket += 1) {
    res.write(`${bucket}`);
    
    symbols.forEach((symbol: string) => {
      const currencyPair = monitor.currencyPairs[symbol];
      const messageRate = currencyPair.countTradesInBucket(bucket);
      res.write(',');
      res.write(`${messageRate}`);
    });
    res.write('\r\n');
  }
  
  res.end();
});

app.listen(3000);

const monitor = new Monitor();

function initMonitor() {
  const binance = new BinanceMarket();
  config.get<string[]>("currencyPairs").forEach(symbol => {
    const currencyPair = new CurrencyPairTradesCounter(symbol, binance);
    monitor.addCurrencyPairTradeCounter(currencyPair);
  });
  monitor.startMonitoring();
}

initMonitor();

