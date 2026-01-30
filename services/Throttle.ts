import Discord from "./Discord";

const throttles: Record<string, Throttle> = {};

type ThrottleOptions = {
  maxRequests: number;
  timeWindowMiliseconds: number;
};

export class Throttle {
  private readonly maxRequests: number;
  private readonly timeWindow: number;
  private requestTimes: number[] = [];
  private key: string;

  constructor(key: string, options: ThrottleOptions) {
    this.maxRequests = options.maxRequests;
    this.timeWindow = options.timeWindowMiliseconds;
    this.key = key;
    if (throttles[key]) {
      return throttles[key];
    }
    throttles[key] = this;
    return this;
  }

  async isThrottled() {
    const now = Date.now();
    const startOfWindow = now - this.timeWindow;
    this.requestTimes = this.requestTimes.filter(
      (time) => time > startOfWindow,
    );
    this.requestTimes.push(now);
    const isThrottled = this.requestTimes.length >= this.maxRequests;
    if (isThrottled) {
      Discord.sendMessageWithLimit(
        `throttle-${this.key}`,
        1000 * 60 * 60 * 1, // 1 hour
        `Hit throttle limit for key: "${this.key}"`,
      );
    }
    return isThrottled;
  }
}
