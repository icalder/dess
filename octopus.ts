import { padHoursOrMins } from "./utils.ts";

const octopusApiUrl = "https://api.octopus.energy/v1";

const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
});

export class Tariff {
  private validFrom: Date;
  private validTo: Date;

  constructor(validFrom: string, validTo: string, private valueIncVat: number) {
    this.validFrom = new Date(validFrom);
    this.validTo = new Date(validTo);
  }

  public getValueIncVatInPounds(): number {
    return this.valueIncVat / 100;
  }

  // Sunday = 0
  public getDay(): number {
    return this.validFrom.getDay();
  }

  public getDayStr(): string {
    return dayFormatter.format(this.validFrom);
  }

  public getHour(): number {
    return this.validFrom.getHours();
  }

  public getMinute(): number {
    return this.validFrom.getMinutes();
  }

  // half hour slot within the day, from 0-47
  public getSlot(): number {
    return this.getHour() * 2 + (this.getMinute() == 30 ? 1 : 0);
  }

  public getFrom(): string {
    return (
      padHoursOrMins(this.validFrom.getHours()) +
      ":" +
      padHoursOrMins(this.validFrom.getMinutes())
    );
  }

  public getTo(): string {
    return (
      padHoursOrMins(this.validTo.getHours()) +
      ":" +
      padHoursOrMins(this.validTo.getMinutes())
    );
  }

  public toString(): string {
    return `${this.getDayStr()} ${this.getFrom()} - ${this.getTo()}: £${this.getValueIncVatInPounds().toFixed(
      2
    )}`;
  }
}

export async function getTariffs(apiKey: string): Promise<Tariff[]> {
  const url = `${octopusApiUrl}/products/AGILE-FLEX-22-11-25/electricity-tariffs/E-1R-AGILE-FLEX-22-11-25-E/standard-unit-rates/`;
  const resp = await fetch(url, {
    headers: {
      Authorization: "Basic " + btoa(apiKey + ":"),
    },
  });

  if (!resp.ok) {
    throw new Error(`Failed to get tariff: ${resp.statusText}`);
  }

  const data = await resp.json();
  return data.results.map(
    (result: { valid_from: string; valid_to: string; value_inc_vat: number }) =>
      new Tariff(result.valid_from, result.valid_to, result.value_inc_vat)
  );
}
