const vrmApiUrl = "https://vrmapi.victronenergy.com/v2";

export type VRMAPIToken = {
  token: string;
  idUser: number;
};

export type Tariff = {
  // ex. 00:00
  from: string;
  // ex. 00:00
  to: string;
  // ex. 0.2169
  price: number;
};

export type Period = {
  days: number[];
  schedule: Tariff[];
};

export type DynamicESSSettings = {
  [key: string]: unknown;
  isOn: boolean;
  buyPriceSchedule: Period[];
};

export async function vrmLogin(
  username: string,
  password: string
): Promise<VRMAPIToken> {
  const body = JSON.stringify({
    username,
    password,
  });

  const resp = await fetch(vrmApiUrl + "/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  if (!resp.ok) {
    throw new Error(`Failed to login to VRM: ${resp.statusText}`);
  }

  const data = await resp.json();
  return data as VRMAPIToken;
}

export async function getDynamicESSSettings(
  apiToken: VRMAPIToken,
  siteId: string
): Promise<DynamicESSSettings> {
  const url = `${vrmApiUrl}/installations/${siteId}/dynamic-ess-settings`;
  const resp = await fetch(url, {
    headers: {
      "X-Authorization": `Bearer ${apiToken.token}`,
    },
  });

  if (!resp.ok) {
    throw new Error(`Failed to get dynamic ESS settings: ${resp.statusText}`);
  }

  const data = await resp.json();
  if (!data.success) {
    throw new Error(`Failed to get dynamic ESS settings: ${data}}`);
  }

  return data.data as DynamicESSSettings;
}

export async function updateDynamicESSSettings(
  apiToken: VRMAPIToken,
  siteId: string,
  settings: DynamicESSSettings
) {
  // Remove fields not applicable to POST
  delete settings["idSite"];
  delete settings["createdOn"];
  delete settings["updatedOn"];
  delete settings["apiKey"];
  delete settings["accountName"];

  const url = `${vrmApiUrl}/installations/${siteId}/dynamic-ess-settings`;
  const body = JSON.stringify(settings, null, 2);
  console.log(body);
  const resp = await fetch(url, {
    method: "PATCH",
    headers: {
      "X-Authorization": `Bearer ${apiToken.token}`,
      "Content-Type": "application/json",
    },
    body,
  });

  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(
      `Failed to update ESS settings(${resp.statusText}): ${msg}`
    );
  }
}
