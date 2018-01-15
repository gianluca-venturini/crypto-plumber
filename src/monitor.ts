import { CurrencyPairTradesCounter } from "./currency_pair";

export class Monitor {
  public currencyPairs: {
    [symbol: string]: CurrencyPairTradesCounter
  } = {};

  public flaggedPairs = new Set<string>();
  
  public addCurrencyPairTradeCounter(currencyPair: CurrencyPairTradesCounter) {
    this.currencyPairs[currencyPair.symbol] = currencyPair;
  }

  private printOnScreen(elapsedSeconds: number) {
    this.clearScreen();

    for (let symbol in this.currencyPairs) {
      const rate1 = this.currencyPairs[symbol].getRate(1);
      const rate2 = this.currencyPairs[symbol].getRate(2);
      const max120 = this.currencyPairs[symbol].getMaximum(30);
      const average30d5 = this.currencyPairs[symbol].getRate(30, 5);
      if (rate2 >= 100) {
        this.flaggedPairs.add(symbol);
      }
      const flagged = this.flaggedPairs.has(symbol);
      console.log(`${symbol}: ${rate1}/${rate2}/${average30d5}/${max120}${flagged ? '/FLAGGED' : ''}`);
    }
    console.log(`Elapsed seconds: ${elapsedSeconds}`);
    console.log(`Time: ${new Date()}`);
    console.log(`Flagged: ${this.flaggedPairs.size}`);
  }

  private checkCondition(symbol: string) {
    const rate2 = this.currencyPairs[symbol].getRate(2, 0);
    if (rate2 >= 100) {
      this.flaggedPairs.add(symbol);
    }
  }

  private clearScreen() {
    process.stdout.write("\x1B[2J");
  }

  public startMonitoring() {
    for (let symbol in this.currencyPairs) {
      this.currencyPairs[symbol].subscribeToChange(() => {
        this.checkCondition(symbol);
      });
    }

    let elapsedSeconds = 0;
    setInterval(() => {
      elapsedSeconds += 1;
      this.printOnScreen(elapsedSeconds);
    }, 1000);
  }
}