const octopusApiUrl = "https://api.octopus.energy/v1";

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

  public getDay(): number {
    return this.validFrom.getDay();
  }

  public getFrom(): string {
    return this.validFrom.getHours() + ":" + this.validFrom.getMinutes();
  }

  public getTo(): string {
    return this.validTo.getHours() + ":" + this.validTo.getMinutes();
  }

  public toString(): string {
    return `${this.getFrom()} - ${this.getTo()}: £${this.getValueIncVatInPounds()}`;
  }
}

export async function getTariffs(
  apiKey: string,
  siteId: string
): Promise<Tariff[]> {
  const url = `${octopusApiUrl}/products/AGILE-18-02-21/electricity-tariffs/E-1R-AGILE-18-02-21-${siteId}/standard-unit-rates/`;
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
