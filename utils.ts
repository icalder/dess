export function padHoursOrMins(n: number) {
  return n.toString().padStart(2, "0");
}
