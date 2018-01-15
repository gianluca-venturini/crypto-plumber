import {Market, MarketTrades} from "./types";


export const RETENTION_TIME = 30 * 60; // Retention time is 30 minutes

export class CurrencyPairTradesCounter {

  private market: Market;
  public symbol: string;
  private lastBucketCleaned?: number;
  private timeMessages: Map<number, number>;
  public oldestBucketStored?: number;
  public newestBucketStored?: number;
  private onUpdate?: () => void;

  /**
   * You need to pass an initialized market in order to start
   * counting the number of transactions on a certain currency pair.
   */
  constructor(symbol: string, market: Market) {
    this.symbol = symbol;
    this.market = market;
    this.timeMessages = new Map<number, number>();
    this.market.subscribeToSymbol(symbol, this.incomingTrades);
  }

  /**
   * @param time in milliseconds
   */
  private timeToBucket(time: number) {
    return Math.floor(time / 1000);
  }

  private incomingTrades = (time: number, trades: MarketTrades) => {
    const bucket = this.timeToBucket(time);
    if (!this.timeMessages.has(bucket)) {
      this.timeMessages.set(bucket, 0);
    }
    if (!this.oldestBucketStored) {
      this.oldestBucketStored = bucket;
    }
    if (this.lastBucketCleaned === undefined) {
      this.lastBucketCleaned = bucket - 1;
    }
    
    this.timeMessages.set(bucket, this.timeMessages.get(bucket) + trades.numberOfTrades);
    this.newestBucketStored = bucket;
    if (this.onUpdate) {
      this.onUpdate();
    }

    /**
     * We must call a cleanup procedure in order to prevent the
     * infinite growth of the bucket counter
     */
    this.cleanup();
  }

  public countTradesInBucket(bucket: number) {
    if (this.timeMessages.has(bucket)) {
      return this.timeMessages.get(bucket)
    }
    return 0;
  }

  /**
   * Efficiently removes buckets that are older than RETENTION_TIME
   */
  private cleanup() {
    for (
      let bucket = this.lastBucketCleaned + 1; 
      bucket < this.newestBucketStored - RETENTION_TIME; 
      bucket += 1
    ) {
      this.timeMessages.delete(bucket);
      this.lastBucketCleaned = bucket;
    }
  }

  public getRate(numBuckets: number, offset: number = 1, lastBucket?: number) {
    let sum = 0;
    if (lastBucket === undefined) {
      lastBucket = this.newestBucketStored;
    }

    for (let second = lastBucket - offset; second >= lastBucket - offset - numBuckets; second -= 1) {
      sum += this.countTradesInBucket(second);
    }
    return sum / numBuckets;
  }
  
  public getMaximum(numBuckets: number, offset: number = 1, lastBucket?: number) {
    let max = 0;
    if (lastBucket === undefined) {
      lastBucket = this.newestBucketStored;
    }

    for (let second = lastBucket - offset; second >= lastBucket - offset - numBuckets; second -= 1) {
      max = Math.max(this.countTradesInBucket(second), max);
    }
    return max;
  }

  /**
   * Use this function in order to react to a change in
   * internal attributes.
   */
  public subscribeToChange(callback: () => void) {
    this.onUpdate = callback;
  }
}