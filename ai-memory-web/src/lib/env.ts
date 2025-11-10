import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_EMBEDDING_MODEL: z.string().default("text-embedding-3-large"),
  OPENAI_CHAT_MODEL: z.string().default("gpt-4o"),
  OPENAI_SUMMARY_MODEL: z.string().default("gpt-4o-mini"),
  WHISPER_MODEL: z.string().default("whisper-1"),
  AES_ENCRYPTION_KEY: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_ENABLE_ENCRYPTION: z
    .string()
    .transform((value) => value === "true")
    .optional(),
});

export const serverEnv = serverSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL,
  OPENAI_CHAT_MODEL: process.env.OPENAI_CHAT_MODEL,
  OPENAI_SUMMARY_MODEL: process.env.OPENAI_SUMMARY_MODEL,
  WHISPER_MODEL: process.env.WHISPER_MODEL,
  AES_ENCRYPTION_KEY: process.env.AES_ENCRYPTION_KEY,
});

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_ENABLE_ENCRYPTION: process.env.NEXT_PUBLIC_ENABLE_ENCRYPTION,
});
