import React from "react";

const Loader = ({ fullPage = false }) => {
  return (
    <div
      className={`flex items-center justify-center ${
        fullPage ? "min-h-[85vh]" : "py-12"
      }`}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-650 border-t-transparent shadow-sm"></div>
    </div>
  );
};

export default Loader;
