// src/pages/Unauthorized.jsx
import { Link } from "react-router-dom";
import { ShieldX, Home, ArrowLeft } from "lucide-react";

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse delay-500"></div>
      </div>

      {/* Main content - Much smaller box */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 text-center transform transition-all duration-300 ease-out">
          {/* Icon - smaller */}
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mb-4 sm:mb-5 shadow-lg animate-bounce">
            <ShieldX className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>

          {/* Error code - smaller */}
          <div className="mb-3 sm:mb-4">
            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent mb-2 tracking-tight">
              403
            </h1>
            <div className="h-1 w-16 sm:w-20 bg-gradient-to-r from-red-500 to-rose-500 mx-auto rounded-full"></div>
          </div>

          {/* Title - smaller */}
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
            Access Denied
          </h2>

          {/* Description - more compact */}
          <p className="text-gray-600 mb-5 sm:mb-6 text-sm sm:text-base leading-relaxed">
            You don't have permission to access this page.
          </p>

          {/* Action buttons - smaller and more compact */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <Link
              to="/"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 transform hover:-translate-y-1 transition-all duration-200 ease-out"
            >
              <Home className="w-4 h-4  transition-transform" />
              Go to Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="group inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-lg font-semibold text-sm border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-200 ease-out shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="w-4 h-4  transition-transform" />
              Go Back
            </button>
          </div>

          {/* Support link - smaller */}
          <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Need help?{" "}
              <a 
                href="mailto:support@example.com" 
                className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 hover:underline-offset-4 transition-all"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-red-300 rounded-full opacity-20 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Unauthorized;