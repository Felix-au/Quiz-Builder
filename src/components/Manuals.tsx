import React from "react";
import { Link } from "react-router-dom";

const Manuals: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold mb-3">Sorry, Not Available Yet!</h1>
        <p className="text-muted-foreground mb-8">To be added later.</p>
        <Link
          to="/"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 transition"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default Manuals;
