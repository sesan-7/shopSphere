import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const ConfirmContext = createContext(null);

export const useConfirm = () => {
  return useContext(ConfirmContext);
};

export const ConfirmProvider = ({ children }) => {
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "confirm" });
  const resolverRef = useRef(null);

  const confirm = (title, message) => {
    setModal({ isOpen: true, title, message, type: "confirm" });
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  };

  const alertFn = (title, message) => {
    setModal({ isOpen: true, title, message, type: "alert" });
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  };

  const handleConfirm = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) resolverRef.current(true);
  };

  const handleCancel = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) resolverRef.current(false);
  };

  // Attach alert function to confirm for backward compatibility
  const confirmFn = confirm;
  confirmFn.alert = alertFn;

  return (
    <ConfirmContext.Provider value={confirmFn}>
      {children}
      {modal.isOpen && (
        <ConfirmationModal
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  );
};

const ConfirmationModal = ({ title, message, type, onConfirm, onCancel }) => {
  useEffect(() => {
    // Prevent background scrolling
    document.body.style.overflow = "hidden";
    
    // Handle ESC key press
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  const isAlert = type === "alert";
  const isErrorOrFailed = title?.toLowerCase().includes("error") || title?.toLowerCase().includes("failed") || title?.toLowerCase().includes("cannot");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Visual Backdrop Overlay */}
      <div 
        className="absolute inset-0 bg-black/45 backdrop-blur-xs cursor-pointer animate-fade-in"
        onClick={onCancel}
      ></div>

      {/* Dialog Body Container */}
      <div className="relative bg-white dark:bg-[#1f2028] border border-gray-150 dark:border-[#2e303a] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left animate-zoom-in">
        <div className="flex items-center gap-3">
          {isErrorOrFailed ? (
            <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100 dark:border-red-900/30 text-lg font-bold">
              🚫
            </div>
          ) : isAlert ? (
            <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-500 border border-blue-100 dark:border-blue-900/30 text-lg font-bold">
              ℹ️
            </div>
          ) : (
            <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-500 border border-amber-100 dark:border-amber-900/30 text-lg font-bold">
              ⚠️
            </div>
          )}
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{title || "Notification"}</h3>
        </div>
        
        <p className="text-xs font-semibold text-gray-550 dark:text-gray-400 leading-relaxed whitespace-pre-line">
          {message}
        </p>

        <div className="flex gap-3 justify-end pt-2">
          {!isAlert && (
            <button
              onClick={onCancel}
              className="rounded-xl border border-gray-250 dark:border-[#2e303a] bg-white dark:bg-[#16171d] hover:bg-gray-50 dark:hover:bg-gray-800 px-5 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 transition cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            className="rounded-xl bg-black dark:bg-[#f3f4f6] hover:bg-gray-800 dark:hover:bg-white text-white dark:text-black px-5 py-2.5 text-xs font-bold transition cursor-pointer"
          >
            {isAlert ? "OK" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};
