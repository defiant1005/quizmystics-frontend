import { AxiosError } from "axios";

export function errorHandler(error: Error | unknown | AxiosError) {
  let errorMessage: string | undefined;

  if (error instanceof AxiosError) {
    errorMessage = error.response?.data?.error?.message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = String(error);
  }

  console.error(errorMessage);

  return errorMessage;
}

export function neverHandler(x: never): never {
  throw new Error(`Didn't ${x} expect to get here`);
}
