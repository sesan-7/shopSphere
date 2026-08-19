import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center space-y-6 text-left">
      <div className="text-6xl text-center">🔍</div>
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight m-0">404 - Page Not Found</h1>
        <p className="mt-4 text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
          The requested page resource does not exist, has been deleted, or had its URL path restructured.
        </p>
      </div>
      <div className="pt-4 text-center">
        <Link
          to="/"
          className="rounded-xl bg-blue-650 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 shadow transition active:scale-98 inline-block"
        >
          Back to Home Screen
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
