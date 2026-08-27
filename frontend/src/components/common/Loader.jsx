import React from "react";
import { Loader2 } from "lucide-react";

export const Loader = ({
  size = "md",
  text = "Loading...",
  fullScreen = false,
  className = "",
  showColdStartNotice = true,
}) => {
  const [isSlow, setIsSlow] = React.useState(false);

  React.useEffect(() => {
    if (!showColdStartNotice) return;
    const timer = setTimeout(() => {
      setIsSlow(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [showColdStartNotice]);

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
      {isSlow && (
        <p className="text-xs text-slate-400 max-w-xs animate-in fade-in duration-300">
          Connecting to backend server... (It may take a moment if the server is warming up)
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
