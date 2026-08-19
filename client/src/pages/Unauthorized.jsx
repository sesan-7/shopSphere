import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center space-y-6 text-left">
      <div className="text-6xl text-center">🔒</div>
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight m-0">Access Denied</h1>
        <p className="mt-4 text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
          You do not have the required administrative credentials to access this protected management resource.
        </p>
      </div>
      <div className="pt-4 flex gap-4 justify-center">
        <Link
          to="/login"
          className="rounded-xl bg-blue-650 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 shadow transition active:scale-98 text-center"
        >
          Admin Login
        </Link>
        <Link
          to="/"
          className="rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-wider px-6 py-3 transition text-center"
        >
          Back to Shop
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
