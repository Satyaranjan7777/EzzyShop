import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import Button from "../../components/common/Button";

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-24 h-24 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 font-extrabold text-4xl shadow-inner font-heading">
        404
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading mb-2">
        Page Not Found
      </h1>
      <p className="text-slate-500 max-w-md mb-8 text-sm sm:text-base leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="primary" leftIcon={Home}>
            Back to Home
          </Button>
        </Link>
        <Link to="/products">
          <Button variant="outline">Browse Store</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
