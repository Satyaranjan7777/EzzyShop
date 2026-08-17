import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";

/**
 * ScrollToTop Component
 * 1. Smoothly restores scroll position to top on page navigation.
 * 2. Renders a butter-smooth floating action button with interactive scroll progress ring.
 */
export const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Smoothly scroll to top on route change
  useEffect(() => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [pathname, search]);

  // Track scroll position for floating action button & progress ring
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const scrollHeight =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight;

          if (scrollHeight > 0) {
            const progress = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
            setScrollProgress(progress);
          }

          if (scrollTop > 280) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    try {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible
          ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
          : "opacity-0 scale-75 translate-y-6 pointer-events-none"
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        className="relative w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xl shadow-indigo-600/35 hover:shadow-indigo-600/50 border border-indigo-400/30 transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center group cursor-pointer"
        aria-label="Scroll smoothly to top"
        title={`Scroll to top (${scrollProgress}%)`}
      >
        {/* Animated Progress Ring SVG */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1"
          viewBox="0 0 44 44"
        >
          <circle
            cx="22"
            cy="22"
            r="19"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-indigo-400/25"
          />
          <circle
            cx="22"
            cy="22"
            r="19"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray={119.38}
            strokeDashoffset={119.38 - (119.38 * scrollProgress) / 100}
            strokeLinecap="round"
            className="text-white transition-all duration-200 ease-out"
          />
        </svg>

        {/* Arrow Icon with Hover Micro-Animation */}
        <ArrowUp className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:-translate-y-1" />
      </button>
    </div>
  );
};

export default ScrollToTop;
