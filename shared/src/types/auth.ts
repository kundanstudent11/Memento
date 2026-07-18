/**
 * Authenticated user profile returned by /auth/me and stored in frontend auth state.
 */
export type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
};
