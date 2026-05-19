import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getAllergenInfo,
  getTodaysMenu,
  getWeeklyOverview,
  parseUnknownPlan
} from "./menuService.js";
import lunchPlanJson from "../lunch-plan.json" with { type: "json" };

const lunchPlan = parseUnknownPlan(lunchPlanJson);

describe("menu service", () => {
  it("returns the menu for the current day in the canteen timezone", () => {
    const result = getTodaysMenu(lunchPlan, new Date("2026-05-19T10:32:00.000Z"));

    assert.equal(result.date, "2026-05-19");
    assert.equal(result.weekday, "Tuesday");
    assert.deepEqual(
      result.menu.map((dish) => dish.id),
      ["2026-05-19-main-1", "2026-05-19-main-2", "2026-05-19-soup-1"]
    );
  });

  it("returns a weekly overview with dish IDs", () => {
    const result = getWeeklyOverview(lunchPlan);

    assert.equal(result.week.calendarWeek, 21);
    assert.equal(result.days.length, 5);
    assert.equal(result.days[0]?.dishes[0]?.id, "2026-05-18-main-1");
  });

  it("returns expanded allergen information for a dish ID", () => {
    const result = getAllergenInfo(lunchPlan, "2026-05-22-main-2");

    assert.equal(result.dish.name, "Falafel-Bowl mit Hummus und Couscous");
    assert.deepEqual(result.allergens, [
      { code: "A", name: "Glutenhaltiges Getreide" },
      { code: "N", name: "Sesam" }
    ]);
  });

  it("throws an actionable error for an unknown dish ID", () => {
    assert.throws(
      () => getAllergenInfo(lunchPlan, "missing"),
      /getWeeklyOverview oder getTodaysMenu/
    );
  });
});
