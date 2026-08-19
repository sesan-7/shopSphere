import React from "react";

const ErrorMessage = ({
  message = "Unable to process request. Please try again.",
  onRetry,
}) => {
  return (
    <div className="mx-auto max-w-md px-6 py-12 text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 border border-red-200 text-xl font-bold">
        ⚠️
      </div>
      <h3 className="text-base font-bold text-gray-900">Error Occurred</h3>
      <p className="mt-2 text-xs font-semibold text-gray-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 rounded-lg bg-black px-5 py-2.5 text-xs font-bold text-white hover:bg-gray-800 transition active:scale-98"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
