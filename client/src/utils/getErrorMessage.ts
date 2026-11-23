import { isAxiosError } from "axios";

interface ApiErrorBody {
  message?: string;
  errors?: { field: string; message: string }[];
}

export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) return "Can't reach the server. Is the backend running?";

    const data = error.response.data as ApiErrorBody | undefined;
    if (data?.errors?.length) return data.errors.map((e) => e.message).join(". ");
    if (data?.message) return data.message;
  }
  return "Something went wrong. Please try again.";
}