import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "./Button";

export const ErrorState = ({
  title = "Something went wrong",
  message = "Failed to load data from the server. Please try again.",
  onRetry,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-rose-100 bg-rose-50/50 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 font-heading mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="dangerOutline"
          leftIcon={RefreshCw}
          size="sm"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
