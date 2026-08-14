import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .transform((value) => value.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const groupNameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9-]{3,32}$/,
    "Use 3-32 characters: lowercase letters, numbers and dashes only",
  );

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Display name is required")
  .max(32, "Display name must be at most 32 characters");

export const createGroupSchema = z.object({
  name: groupNameSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
});

export const joinGroupSchema = z.object({
  name: groupNameSchema,
  password: z.string().min(1, "Group password is required"),
  displayName: displayNameSchema,
});

const localDateTimeSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid date");

export const appointmentSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(100, "Title must be at most 100 characters"),
    startsAt: localDateTimeSchema,
    endsAt: localDateTimeSchema,
  })
  .refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
    message: "End must be after start",
    path: ["endsAt"],
  });

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}
