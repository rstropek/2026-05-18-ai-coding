import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as z from "zod/v4";
import {
  AllergenOutput,
  DayMenu,
  Dish,
  LunchPlan,
  LunchPlanSchema,
  ResponseFormat
} from "./types.js";

export interface TodaysMenuResult extends Record<string, unknown> {
  date: string;
  weekday: string | null;
  canteen: LunchPlan["canteen"];
  timezone: string;
  menu: Dish[];
}

export interface WeeklyOverviewDay {
  date: string;
  weekday: string;
  itemCount: number;
  dishes: Array<Pick<Dish, "id" | "name" | "category" | "price" | "vegetarian" | "vegan">>;
}

export interface WeeklyOverviewResult extends Record<string, unknown> {
  week: LunchPlan["week"];
  canteen: LunchPlan["canteen"];
  days: WeeklyOverviewDay[];
}

export interface AllergenInfoResult extends Record<string, unknown> {
  dish: Pick<Dish, "id" | "name" | "category">;
  allergens: AllergenOutput[];
}

const currentFile = fileURLToPath(import.meta.url);
const defaultLunchPlanPath = resolve(dirname(currentFile), "..", "lunch-plan.json");

export function getDefaultLunchPlanPath(): string {
  return process.env.LUNCH_PLAN_PATH ?? defaultLunchPlanPath;
}

export async function loadLunchPlan(path = getDefaultLunchPlanPath()): Promise<LunchPlan> {
  const rawContent = await readFile(path, "utf8");
  const parsedJson: unknown = JSON.parse(rawContent);
  return parseUnknownPlan(parsedJson);
}

export function getTodaysMenu(plan: LunchPlan, now = new Date()): TodaysMenuResult {
  const today = formatDateInTimeZone(now, plan.week.timezone);
  const day = plan.days.find((candidate) => candidate.date === today);

  return {
    date: today,
    weekday: day?.weekday ?? null,
    canteen: plan.canteen,
    timezone: plan.week.timezone,
    menu: day?.menu ?? []
  };
}

export function getWeeklyOverview(plan: LunchPlan): WeeklyOverviewResult {
  return {
    week: plan.week,
    canteen: plan.canteen,
    days: plan.days.map((day) => ({
      date: day.date,
      weekday: day.weekday,
      itemCount: day.menu.length,
      dishes: day.menu.map((dish) => ({
        id: dish.id,
        name: dish.name,
        category: dish.category,
        price: dish.price,
        vegetarian: dish.vegetarian,
        vegan: dish.vegan
      }))
    }))
  };
}

export function getAllergenInfo(plan: LunchPlan, dishId: string): AllergenInfoResult {
  const dish = findDishById(plan, dishId);

  if (!dish) {
    throw new Error(
      `Speise mit ID '${dishId}' wurde nicht gefunden. Rufe getWeeklyOverview oder getTodaysMenu auf, um gueltige Speise-IDs zu sehen.`
    );
  }

  return {
    dish: {
      id: dish.id,
      name: dish.name,
      category: dish.category
    },
    allergens: dish.allergens.map((code) => ({
      code,
      name: plan.allergenLegend[code] ?? "Unbekanntes Allergen"
    }))
  };
}

export function formatTodaysMenu(result: TodaysMenuResult, format: ResponseFormat): string {
  if (format === "json") {
    return JSON.stringify(result, null, 2);
  }

  const lines = [`# Speiseplan fuer ${result.date}`, "", `Kantine: ${result.canteen.name}`];

  if (!result.menu.length) {
    lines.push("", "Fuer heute ist kein Speiseplan hinterlegt.");
    return lines.join("\n");
  }

  for (const dish of result.menu) {
    lines.push(
      "",
      `## ${dish.name} (${dish.id})`,
      `- Kategorie: ${dish.category}`,
      `- Preis: ${formatPrice(dish.price, result.canteen.currency)}`,
      `- Vegetarisch: ${dish.vegetarian ? "ja" : "nein"}`,
      `- Vegan: ${dish.vegan ? "ja" : "nein"}`,
      `- Allergene: ${dish.allergens.join(", ") || "keine angegeben"}`,
      `- Beschreibung: ${dish.description}`
    );
  }

  return lines.join("\n");
}

export function formatWeeklyOverview(result: WeeklyOverviewResult, format: ResponseFormat): string {
  if (format === "json") {
    return JSON.stringify(result, null, 2);
  }

  const lines = [
    `# Wochenuebersicht KW ${result.week.calendarWeek}`,
    "",
    `${result.canteen.name}, ${result.week.startDate} bis ${result.week.endDate}`
  ];

  for (const day of result.days) {
    lines.push("", `## ${day.weekday}, ${day.date}`);
    for (const dish of day.dishes) {
      lines.push(
        `- ${dish.name} (${dish.id}) - ${dish.category}, ${formatPrice(dish.price, result.canteen.currency)}`
      );
    }
  }

  return lines.join("\n");
}

export function formatAllergenInfo(result: AllergenInfoResult, format: ResponseFormat): string {
  if (format === "json") {
    return JSON.stringify(result, null, 2);
  }

  const lines = [`# Allergene fuer ${result.dish.name} (${result.dish.id})`, ""];

  if (!result.allergens.length) {
    lines.push("Keine Allergene angegeben.");
    return lines.join("\n");
  }

  for (const allergen of result.allergens) {
    lines.push(`- ${allergen.code}: ${allergen.name}`);
  }

  return lines.join("\n");
}

function findDishById(plan: LunchPlan, dishId: string): Dish | undefined {
  for (const day of plan.days) {
    const dish = day.menu.find((candidate) => candidate.id === dishId);
    if (dish) {
      return dish;
    }
  }

  return undefined;
}

function formatDateInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const year = getDatePart(parts, "year");
  const month = getDatePart(parts, "month");
  const day = getDatePart(parts, "day");
  return `${year}-${month}-${day}`;
}

function getDatePart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  const part = parts.find((candidate) => candidate.type === type);
  if (!part) {
    throw new Error(`Datumsteil '${type}' konnte nicht formatiert werden.`);
  }

  return part.value;
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency
  }).format(price);
}

export function parseUnknownPlan(value: unknown): LunchPlan {
  try {
    return LunchPlanSchema.parse(value);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`lunch-plan.json ist ungueltig: ${z.prettifyError(error)}`);
    }

    throw error;
  }
}
