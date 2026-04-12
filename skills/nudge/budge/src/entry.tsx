import { createIsolet } from "isolet-js";
import { react } from "isolet-js/react";
import { Budge } from "./budge";

export type { BudgeConfig } from "./budge";

export const widget = createIsolet({
  name: "budge",
  mount: react(Budge),
  isolation: "none",
  zIndex: 2147483647,
});
