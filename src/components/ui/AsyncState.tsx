import type { ReactNode } from "react";

interface AsyncStateProps {
  isLoading?: boolean;
  isFetching?: boolean;
  error?: unknown;
  empty?: boolean;
  loadingText?: string;
  errorText?: string;
  emptyText?: string;
  children: ReactNode;
}

export const AsyncState = ({
  isLoading,
  isFetching,
  error,
  empty,
  loadingText = "Loading...",
  errorText = "Failed to load.",
  emptyText = "No data found.",
  children,
}: AsyncStateProps) => {
  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 animate-pulse">
        <span>{loadingText}</span>
      </div>
    );
  }
  if (error) {
    const message = error instanceof Error ? error.message : String(error);
    return (
      <div className="flex items-center justify-center h-32 text-red-500">
        <span>
          {errorText} {message}
        </span>
      </div>
    );
  }
  if (empty) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400">
        <span>{emptyText}</span>
      </div>
    );
  }
  return <>{children}</>;
};
