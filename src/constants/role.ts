export const Role = {
  ADMIN: "ADMIN",
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
  USER: "USER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
  