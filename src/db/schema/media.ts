import {InferSelectModel} from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {createInsertSchema} from "drizzle-zod";
import {z} from "zod/v4";

import {TransformationConfig} from "@/types";

import {mediaTypeEnum, timestamps} from "./columns-helpers";

export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),
  fileName: varchar("file_name", {length: 255}).notNull(),
  originalUrl: text("original_url").notNull(),
  transformedUrl: text("transformed_url").default(""),
  transformationConfig: jsonb("transformation_config")
    .$type<TransformationConfig>()
    .default({} as TransformationConfig),
  mediaType: mediaTypeEnum("type"),
  isPrivate: boolean("is_private").default(false).notNull(),
  ...timestamps,
});

const baseSchema = createInsertSchema(media, {
  fileName: schema =>
    schema
      .min(1, {message: "File name is required."})
      .max(255, {message: "File name cannot exceed 255 characters."})
      .regex(/^[^<>:"/\\|?*]+$/, {
        message: "File name contains invalid characters.",
      }),
  originalUrl: z.url({message: "Please provide a valid original URL."}),
  transformedUrl: z
    .url({message: "Please provide a valid transformed URL."})
    .optional(),
  mediaType: schema => schema,
  isPrivate: z.boolean().default(false),
}).pick({
  fileName: true,
  originalUrl: true,
  transformedUrl: true,
  mediaType: true,
  isPrivate: true,
});

export const createMediaSchema = z.object({
  fileName: baseSchema.shape.fileName,
  originalUrl: baseSchema.shape.originalUrl,
  mediaType: baseSchema.shape.mediaType,
  transformedUrl: baseSchema.shape.transformedUrl,
  transformationConfig: z.any().optional(),
  isPrivate: baseSchema.shape.isPrivate,
});

export const updateMediaSchema = z.object({
  id: z.uuid({message: "Please provide a valid media ID."}),
  fileName: baseSchema.shape.fileName.optional(),
  originalUrl: baseSchema.shape.originalUrl.optional(),
  transformedUrl: baseSchema.shape.transformedUrl,
  mediaType: baseSchema.shape.mediaType.optional(),
  transformationConfig: z.any().optional(),
  isPrivate: baseSchema.shape.isPrivate.optional(),
});

export const mediaQuerySchema = z.object({
  id: z.uuid({message: "Please provide a valid media ID."}),
});

export type SelectMediaModel = InferSelectModel<typeof media>;
export type CreateMediaParams = z.infer<typeof createMediaSchema>;
export type UpdateMediaParams = z.infer<typeof updateMediaSchema>;
export type MediaQueryParams = z.infer<typeof mediaQuerySchema>;
