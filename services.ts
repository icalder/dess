/*
we want to be able to synthesise the buyPriceSchedule to POST to the VRM API

    "buyPriceSchedule": "[{\u0022days\u0022:[0,1,2,3,4,5,6],\u0022schedule\u0022:[{\u0022from\u0022:\u002200:00\u0022,\u0022to\u0022:\u002200:00\u0022,\u0022price\u0022:0.2169}]}]",

[{"days":[0,1,2,3,4,5,6],"schedule":[{"from":"00:00","to":"00:00","price":0.2169}]}]

*/

import { padHoursOrMins } from "./utils.ts";
import { Period, Tariff } from "./vrm.ts";
import { Tariff as OctopusTariff } from "./octopus.ts";

const FIXED_UNIT_PRICE = 0.2169;

export class BuyPriceScheduleBuilder {
  private tariff: number[][] = [];
  constructor() {
    // 7 days
    for (let i = 0; i != 7; ++i) {
      // 48 half-hour slots in each day
      this.tariff.push(new Array(48).fill(FIXED_UNIT_PRICE));
    }
  }

  private getDailyTariff(day: number): Tariff[] {
    const result = [] as Tariff[];
    const prices = this.tariff[day];
    for (let i = 0; i != 48; ++i) {
      let hour = ~~(i / 2) % 24;
      let minute = (i % 2) * 30;
      const from = padHoursOrMins(hour) + ":" + padHoursOrMins(minute);
      const j = i + 1;
      hour = ~~(j / 2) % 24;
      minute = (j % 2) * 30;
      const to = padHoursOrMins(hour) + ":" + padHoursOrMins(minute);
      result.push({ from, to, price: prices[i] });
    }
    return result;
  }

  public addTariffs(tariffs: OctopusTariff[]) {
    for (const tariff of tariffs) {
      const day = tariff.getDay();
      const daySlots = this.tariff[day];
      const slot = tariff.getSlot();
      daySlots[slot] = tariff.getValueIncVatInPounds();
    }
  }

  public build(): Period[] {
    const result = [] as Period[];
    for (let i = 0; i < 7; ++i) {
      const period: Period = {
        days: [i],
        schedule: this.getDailyTariff(i),
      };
      result.push(period);
    }

    return result;
  }
}
