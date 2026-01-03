import { z } from "zod";

const cabin = z.object({
  name: z.string(),
  maxCapacity: z.number().min(1),
  regularPrice: z.number().min(1),
  discount: z.number().min(0),
  description: z.string(),
  image: z.string(),
});
type Cabin = z.infer<typeof cabin>;
