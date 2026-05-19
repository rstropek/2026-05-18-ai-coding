import * as z from "zod/v4";

export const DishSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(["main", "soup", "dessert", "salad"]),
  description: z.string(),
  price: z.number().nonnegative(),
  vegetarian: z.boolean(),
  vegan: z.boolean(),
  allergens: z.array(z.string().min(1))
});

export const DayMenuSchema = z.object({
  date: z.iso.date(),
  weekday: z.string().min(1),
  menu: z.array(DishSchema)
});

export const LunchPlanSchema = z.object({
  week: z.object({
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    calendarWeek: z.number().int().positive(),
    timezone: z.string().min(1)
  }),
  canteen: z.object({
    name: z.string().min(1),
    currency: z.string().min(1)
  }),
  days: z.array(DayMenuSchema),
  allergenLegend: z.record(z.string().min(1), z.string().min(1))
});

export type Dish = z.infer<typeof DishSchema>;
export type DayMenu = z.infer<typeof DayMenuSchema>;
export type LunchPlan = z.infer<typeof LunchPlanSchema>;

export const ResponseFormatSchema = z.enum(["markdown", "json"]);
export type ResponseFormat = z.infer<typeof ResponseFormatSchema>;

export const DishOutputSchema = DishSchema;
export const DayMenuOutputSchema = DayMenuSchema;

export const AllergenOutputSchema = z.object({
  code: z.string(),
  name: z.string()
});

export type AllergenOutput = z.infer<typeof AllergenOutputSchema>;
