import React from "react";
import { Loader2 } from "lucide-react";

export const Loader = ({
  size = "md",
  text = "Loading...",
  fullScreen = false,
  className = "",
}) => {
  const sizeMap = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 p-6 text-center ${className}`}>
      <Loader2 className={`${sizeMap[size] || sizeMap.md} text-indigo-600 animate-spin`} />
      {text && (
        <p className="text-sm font-medium text-slate-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
