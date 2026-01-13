export const Role = {
  ADMIN: "ADMIN",
  STUDENT: "STUDENT",
  USER: "USER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
