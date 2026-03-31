export const USERTYPES = [
  'Admin',
  'Voluntário'
] as const;

export type UserType = typeof USERTYPES[number];