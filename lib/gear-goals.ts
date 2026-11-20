import type { GearPriority } from "./editorial";

export const shoeGoals: { value: GearPriority; label: string }[] = [
  { value: "support", label: "Secure stops" },
  { value: "cushioning", label: "Cushioned feel" },
  { value: "handling", label: "Light-feeling movement" },
  { value: "room", label: "More forefoot room" },
  { value: "durability", label: "Wear resistance" },
];
export const racquetGoals: { value: GearPriority; label: string }[] = [
  { value: "power", label: "Easier depth" },
  { value: "spin", label: "More spin" },
  { value: "control", label: "Placement & control" },
  { value: "handling", label: "Easier handling" },
];
