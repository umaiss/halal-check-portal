import { z } from "zod";

export const productUpdateSchema = z.object({
  status: z.enum(["halal", "haram", "mushbooh"]),
  ingredients: z.string().min(1, "Ingredients text cannot be empty."),
  analysis: z.string().min(1, "Analysis text cannot be empty."),
  overrideAI: z.boolean(),
});

export type ProductUpdateValues = z.infer<typeof productUpdateSchema>;
