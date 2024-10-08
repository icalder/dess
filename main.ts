import {
  vrmLogin,
  getDynamicESSSettings,
  updateDynamicESSSettings,
} from "./vrm.ts";
import { getTariffs } from "./octopus.ts";
import { BuyPriceScheduleBuilder, scheduleComparer } from "./services.ts";

export function add(a: number, b: number): number {
  return a + b;
}

const vrmUsername = "iain.calder@gmail.com";
const vrmPassword = Deno.env.get("VRM_PASSWORD");
const siteId = 449463;
const octopusApiKey = Deno.env.get("OCTOPUS_API_KEY");

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const apiToken = await vrmLogin(vrmUsername, vrmPassword!);
  const settings = await getDynamicESSSettings(apiToken, siteId.toString());
  // console.log(settings.buyPriceSchedule);
  const tariffs = await getTariffs(octopusApiKey!);
  // for (const tariff of tariffs) {
  //   console.log(tariff.toString());
  // }

  const scheduler = new BuyPriceScheduleBuilder();
  scheduler.addTariffs(tariffs);
  const schedule = scheduler.build();
  //console.log(schedule);

  const tariffsMatch = scheduleComparer(schedule, settings.buyPriceSchedule);
  if (tariffsMatch) {
    console.log("tariffs match - exiting");
    Deno.exit(0);
  }

  console.log("updating dynamic ESS settings");

  settings.buyPriceSchedule = schedule;
  //settings.isOn = false;
  updateDynamicESSSettings(apiToken, siteId.toString(), settings);
}
