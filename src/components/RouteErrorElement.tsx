"use client";

import React from "react";
import { useRouteError, useNavigate, isRouteErrorResponse } from "react-router-dom";

/**
 * Route-level error UI for React Router's errorElement prop.
 * Renders when an error is thrown during route rendering, or in a loader/action.
 * Uses useRouteError() to access the thrown error.
 */
export function RouteErrorElement(): React.ReactElement {
  const error = useRouteError();
  const navigate = useNavigate();

  const message = isRouteErrorResponse(error)
    ? (error.statusText || error.data?.message) ?? "Request failed"
    : error instanceof Error
      ? error.message
      : "An unexpected error occurred";

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-red-600 font-semibold">Something went wrong</span>
      </div>
      <p className="text-sm text-red-700 mb-2">{message}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-red-600 hover:text-red-800 underline"
        >
          Go back
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-sm text-red-600 hover:text-red-800 underline"
        >
          Reload page
        </button>
      </div>
    </div>
  );
}

export default RouteErrorElement;
