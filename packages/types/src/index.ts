// Placeholder for shared types
export type User = {
  id: string;
  email: string;
  name: string;
};

export type ApiResponse<T> = {
  data: T;
  error?: string;
};
