import React, { forwardRef } from "react";

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftAddon,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      onRightIconClick,
      className = "",
      containerClassName = "",
      required = false,
      id,
      name,
      type = "text",
      ...props
    },
    ref
  ) => {
    const inputId = id || name || Math.random().toString(36).substring(7);

    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center justify-between"
          >
            <span>
              {label}
              {required && <span className="text-rose-500 ml-1">*</span>}
            </span>
          </label>
        )}

        <div className="relative flex items-stretch">
          {leftAddon && (
            <div className="flex items-center justify-center px-3.5 bg-slate-100 border border-r-0 border-slate-200 text-slate-700 text-xs font-bold select-none shrink-0 rounded-l-xl">
              {leftAddon}
            </div>
          )}

          <div className="relative flex-1 flex items-center">
            {LeftIcon && !leftAddon && (
              <div className="absolute left-3.5 pointer-events-none text-slate-400">
                <LeftIcon className="w-4 h-4" />
              </div>
            )}

            <input
              id={inputId}
              name={name}
              type={type}
              ref={ref}
              className={`w-full bg-white border text-slate-900 text-sm transition-all duration-150 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
                leftAddon ? "rounded-r-xl rounded-l-none" : "rounded-xl"
              } ${LeftIcon && !leftAddon ? "pl-10" : "pl-3.5"} ${
                RightIcon ? "pr-10" : "pr-3.5"
              } py-2.5 ${
                error
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
              } ${className}`}
              {...props}
            />

            {RightIcon && (
              <button
                type="button"
                tabIndex={-1}
                onClick={onRightIconClick}
                className={`absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none ${
                  onRightIconClick ? "cursor-pointer" : "pointer-events-none"
                }`}
              >
                <RightIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="text-xs font-medium text-rose-600 animate-in fade-in duration-150">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
