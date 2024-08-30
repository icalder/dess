//import { vrmLogin, getDynamicESSSettings } from "./vrm.ts";
import { getTariffs } from "./octopus.ts";

export function add(a: number, b: number): number {
  return a + b;
}

const vrmUsername = "iain.calder@gmail.com";
const vrmPassword = Deno.env.get("VRM_PASSWORD");
const siteId = 449463;
const octopusApiKey = Deno.env.get("OCTOPUS_API_KEY");

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  // const apiToken = await vrmLogin(vrmUsername, vrmPassword!);
  // const settings = await getDynamicESSSettings(apiToken, siteId.toString());
  // console.log(settings.buyPriceSchedule);

  const tariffs = await getTariffs(octopusApiKey!, siteId.toString());
  for (const tariff of tariffs) {
    console.log(tariff.toString());
  }
}
