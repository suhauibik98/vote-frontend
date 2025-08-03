import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";

import {
  User,
  Calendar,
  Building2,
  LogIn,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Info,
  ArrowLeft,
  Shield,
  Clock,
  RefreshCw,
} from "lucide-react";
import {
  useCheckUserValidationMutation,
  useLoginMutation,
  useSendOtpMutation,
} from "../../redux/apis/AuthApis";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../../redux/slices/authSlice";

export const SignIn = () => {
  const [formData, setFormData] = useState({
    emp_id: "",
    birth_date: "",
  });
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [showEmpIdHelp, setShowEmpIdHelp] = useState(false);

  const [showOtp, setShowOtp] = useState(false);
  const [otpData, setOtpData] = useState({
    otp: "",
  });
  const [otpErrors, setOtpErrors] = useState({});

  // Timer state for OTP
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  const [notification, setNotification] = useState({
    message: "",
    type: "",
    show: false,
  });

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [checkUserValidation, { isLoading: isValidationLoading }] = useCheckUserValidationMutation();
  const [sendOtp, { isLoading: isOtpSendLoading }] = useSendOtpMutation();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Combined loading state
  const isLoading = isLoginLoading || isValidationLoading || isOtpSendLoading;

  // Timer effect for OTP
  useEffect(() => {
    if (showOtp && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [showOtp, timeLeft]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Format timer display
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Enhanced notification system with auto-dismiss and manual close
  const showNotification = useCallback(
    (message, type = "info", duration = 4000) => {
      setNotification({ message, type, show: true });

      if (duration > 0) {
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, show: false }));
        }, duration);
      }
    },
    []
  );

  const closeNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, show: false }));
  }, []);

  // Enhanced input change handler with restrictions
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      let processedValue = value;

      // Apply same restrictions as signup
      if (name === "emp_id") {
        // Only allow numbers and max 6 digits
        processedValue = value.replace(/\D/g, "").slice(0, 6);
      }

      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));

      // Clear errors when user starts typing
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // OTP input handler
  const handleOtpChange = useCallback(
    (e) => {
      const { value } = e.target;
      // Only allow numbers and max 6 digits
      const processedValue = value.replace(/\D/g, "").slice(0, 6);

      setOtpData({ otp: processedValue });

      if (otpErrors.otp) {
        setOtpErrors({});
      }
    },
    [otpErrors]
  );

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Employee ID validation - Same as signup
    if (!formData.emp_id.trim()) {
      newErrors.emp_id = "Employee ID is required";
    } else if (formData.emp_id.length !== 6) {
      newErrors.emp_id = "Employee ID must be exactly 6 digits";
    } else if (
      !formData.emp_id.startsWith("950") &&
      !formData.emp_id.startsWith("951") &&
      !formData.emp_id.startsWith("952")
    ) {
      newErrors.emp_id = "Employee ID must start with 950, 951, or 952";
    }

    // Birth date validation (only if not in OTP mode)
    if (!showOtp) {
      if (!formData.birth_date) {
        newErrors.birth_date = "Birth date is required";
      } else {
        const birthDate = new Date(formData.birth_date);
        const today = new Date();
        const minAge = new Date();
        minAge.setFullYear(today.getFullYear() - 16);

        if (isNaN(birthDate.getTime())) {
          newErrors.birth_date = "Invalid date format";
        } else if (birthDate > today) {
          newErrors.birth_date = "Cannot be in the future";
        } else if (birthDate > minAge) {
          newErrors.birth_date = "Must be at least 16 years old";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, showOtp]);

  const validateOtp = useCallback(() => {
    const newErrors = {};

    if (!otpData.otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (otpData.otp.length !== 6) {
      newErrors.otp = "OTP must be exactly 6 digits";
    }

    setOtpErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [otpData]);

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      if (!validateForm()) {
        showNotification("Please fix the errors in the form", "error", 4000);
        return;
      }

      if (isLoading) return;

      try {
        dispatch(loginStart());

        const response = await checkUserValidation(formData).unwrap();

        // Check if response indicates OTP is needed
        if (response.success && response?.email) {
          // Send OTP

          //impoirttant *****************
          
          await sendOtp({ email: response.email }).unwrap();
          // ******************************
          // Toggle to OTP form and start timer
          setEmail(response.email);
          setShowOtp(true);
          setTimeLeft(300); // Reset to 5 minutes
          setCanResend(false);
          
          showNotification(
            "✅ Credentials verified! Please enter the OTP sent to your device.",
            "success",
            3000
          );
          return;
        }

        // Complete login if no OTP required
        handleCompleteLogin(response);
      } catch (error) {
        console.error("Login error:", error);
        dispatch(loginFailure());

        let errorMessage = "❌ Login failed. Please try again.";

        if (error?.status === 401) {
          errorMessage =
            error?.data?.message ||
            "🔒 Invalid credentials. Please check your Employee ID and birth date.";
        } else if (error?.status === 429) {
          errorMessage = "⏳ Too many login attempts. Please try again later.";
        } else if (error?.status >= 500) {
          errorMessage = "🔧 Server error. Please try again later.";
        } else if (error?.data?.message) {
          errorMessage = error.data.message;
        } else if (error?.data?.details) {
          errorMessage = Array.isArray(error.data.details)
            ? error.data.details.join(", ")
            : error.data.details;
        }

        showNotification(errorMessage, "error", 6000);
      }
    },
    [validateForm, isLoading, showNotification, dispatch, checkUserValidation, formData, sendOtp]
  );

  const handleOtpSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      if (!validateOtp()) {
        showNotification("Please enter a valid 6-digit OTP", "error", 4000);
        return;
      }

      if (timeLeft === 0) {
        showNotification("OTP has expired. Please request a new one.", "error", 4000);
        return;
      }

      if (isLoading) return;

      try {
        dispatch(loginStart());

        // Combine original form data with OTP
        const completeData = { email, otp: otpData.otp };

        const response = await login(completeData).unwrap();

        handleCompleteLogin(response);
      } catch (error) {
        console.error("OTP verification error:", error);
        dispatch(loginFailure());

        let errorMessage = "❌ Invalid OTP. Please try again.";

        if (error?.status === 401) {
          errorMessage = "🔒 Invalid OTP. Please check the code and try again.";
        } else if (error?.status === 429) {
          errorMessage = "⏳ Too many OTP attempts. Please try again later.";
        } else if (error?.data?.message) {
          errorMessage = error.data.message;
        }

        showNotification(errorMessage, "error", 5000);

        // Clear OTP field on error
        setOtpData({ otp: "" });
      }
    },
    [
      otpData,
      validateOtp,
      email,
      timeLeft,
      login,
      dispatch,
      showNotification,
      isLoading,
    ]
  );

  const handleResendOtp = useCallback(
    async () => {
      if (!canResend || isLoading) return;

      try {
        await sendOtp({ email }).unwrap();
        
        // Reset timer
        setTimeLeft(300);
        setCanResend(false);
        
        showNotification("✅ New OTP sent successfully!", "success", 3000);
      } catch (error) {
        console.error("Resend OTP error:", error);
        showNotification("❌ Failed to resend OTP. Please try again.", "error", 4000);
      }
    },
    [canResend, isLoading, email, sendOtp, showNotification]
  );

  const handleCompleteLogin = useCallback(
    (response) => {
      // Clear form and errors on success
      setFormData({ emp_id: "", birth_date: "" });
      setOtpData({ otp: "" });
      setErrors({});
      setOtpErrors({});
      // setShowOtp(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setTimeLeft(300);
      setCanResend(false);

      // Decode token and prepare payload
      const decoded = jwtDecode(response.token);

      const loginPayload = {
        token: response.token,
        user: decoded,
        expiresIn: decoded.exp ? decoded.exp * 1000 - Date.now() : 86400000,
      };

      // Dispatch login success
      dispatch(loginSuccess(loginPayload));

      const isAdmin = decoded?.isAdmin;

      console.log("User role:", { isAdmin, decoded }); // Debug log

      // Show notification first
      showNotification("🎉 Login successful! Redirecting...", "success", 2500);

      // Navigate with a small delay to ensure Redux state is updated
      setTimeout(() => {
        // console.log(
        //   "Navigating to:",
        //   isAdmin ? "/admin/dashboard" : "/dashboard"
        // ); // Debug log

        if (isAdmin) {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }, 3000);
    },
    [dispatch, navigate, showNotification]
  );

  const handleBackToLogin = useCallback(() => {
    setShowOtp(false);
    setOtpData({ otp: "" });
    setOtpErrors({});
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimeLeft(300);
    setCanResend(false);
  }, []);

  // Handle Enter key press
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !isLoading) {
        if (showOtp) {
          handleOtpSubmit();
        } else {
          handleSubmit();
        }
      }
    },
    [handleSubmit, handleOtpSubmit, isLoading, showOtp]
  );

  // Memoized animation variants
  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0, scale: 0.95 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.4,
          staggerChildren: 0.08,
        },
      },
    }),
    []
  );

  const itemVariants = useMemo(
    () => ({
      hidden: { opacity: 1, y: 15 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 },
      },
    }),
    []
  );

  const snackbarVariants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        y: -100,
        scale: 0.8,
        rotateX: -90,
      },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: {
          type: "spring",
          stiffness: 500,
          damping: 30,
          duration: 0.6,
        },
      },
      exit: {
        opacity: 0,
        y: -100,
        scale: 0.8,
        rotateX: -90,
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      },
    }),
    []
  );

  // Get notification icon based on type
  const getNotificationIcon = useCallback((type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 flex-shrink-0" />;
      case "error":
        return <XCircle className="w-5 h-5 flex-shrink-0" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 flex-shrink-0" />;
    }
  }, []);

  // Get notification colors based on type (matching emerald theme)
  const getNotificationStyles = useCallback((type) => {
    switch (type) {
      case "success":
        return "bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-700 shadow-emerald-500/30";
      case "error":
        return "bg-gradient-to-r from-red-500 to-red-600 border-red-700 shadow-red-500/30";
      case "warning":
        return "bg-gradient-to-r from-amber-500 to-orange-600 border-orange-700 shadow-amber-500/30";
      default:
        return "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-700 shadow-blue-500/30";
    }
  }, []);

  // Memoized OTP Form Component for better performance
  const OtpForm = useMemo(
    () => (
      <motion.div
        key="otp-form"
        initial={{ opacity: 0, x: 50, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -50, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="space-y-4 sm:space-y-5"
      >
        {/* Back button */}
        <motion.button
          type="button"
          onClick={handleBackToLogin}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </motion.button>

        {/* OTP instructions */}
        <motion.div className="text-center py-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl mb-3">
            <Shield className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Enter Verification Code
          </h3>
          <p className="text-sm text-gray-600 px-4">
            Please enter the 6-digit code sent to your registered device for
            Employee ID{" "}
            <span className="font-mono font-medium text-emerald-600">
              {formData.emp_id}
            </span>
          </p>
          
          {/* Timer Display */}
          <div className="flex items-center justify-center gap-2 mt-3 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className={`font-mono ${timeLeft <= 60 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
              {formatTime(timeLeft)}
            </span>
            {timeLeft === 0 && (
              <span className="text-red-600 text-xs ml-2">Expired</span>
            )}
          </div>
        </motion.div>

        {/* OTP Input */}
        <motion.div>
          <label
            htmlFor="otp"
            className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 text-center"
          >
            Verification Code <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              id="otp"
              name="otp"
              value={otpData.otp}
              onChange={handleOtpChange}
              maxLength="6"
              disabled={isLoading || timeLeft === 0}
              className={`w-full px-4 py-3 sm:py-4 text-center text-lg sm:text-xl font-mono tracking-[0.3em] border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation ${
                otpErrors.otp
                  ? "border-red-400 focus:ring-red-500"
                  : timeLeft === 0
                  ? "border-red-300"
                  : "border-gray-200"
              }`}
              placeholder="000000"
              autoComplete="one-time-code"
              autoFocus
              style={{
                WebkitAppearance: "none",
                appearance: "none",
              }}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span
                className={`text-xs ${
                  otpData.otp.length === 6
                    ? "text-emerald-600 font-medium"
                    : "text-gray-400"
                }`}
              >
                {otpData.otp.length}/6
              </span>
            </div>
          </div>
          {otpErrors.otp && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-600 flex items-center justify-center gap-1"
            >
              <XCircle className="w-4 h-4 flex-shrink-0" />
              {otpErrors.otp}
            </motion.p>
          )}
          {timeLeft === 0 && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-600 flex items-center justify-center gap-1"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              OTP has expired. Please request a new one.
            </motion.p>
          )}
        </motion.div>

        {/* Verify Button */}
        <motion.div className="pt-2">
          <motion.button
            whileHover={!isLoading && timeLeft > 0 ? { scale: 1.02, y: -1 } : {}}
            whileTap={!isLoading && timeLeft > 0 ? { scale: 0.98 } : {}}
            type="submit"
            disabled={isLoading || otpData.otp.length !== 6 || timeLeft === 0}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 sm:py-3.5 px-4 rounded-xl font-medium text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 min-h-[44px] touch-manipulation"
            style={{
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
            }}
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>{timeLeft === 0 ? "Expired" : "Verify Code"}</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Resend OTP */}
        <motion.div variants={itemVariants} className="text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Didn't receive the code?{" "}
            <button
              type="button"
              disabled={!canResend || isLoading}
              className={`font-medium underline underline-offset-2 transition-colors ${
                canResend && !isLoading
                  ? "text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              onClick={handleResendOtp}
            >
              {isOtpSendLoading ? (
                <span className="inline-flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Sending...
                </span>
              ) : (
                "Resend OTP"
              )}
            </button>
          </p>
          {!canResend && timeLeft > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              Resend available in {formatTime(timeLeft)}
            </p>
          )}
        </motion.div>
      </motion.div>
    ),
    [
      otpData,
      otpErrors,
      isLoading,
      isOtpSendLoading,
      formData.emp_id,
      timeLeft,
      canResend,
      handleBackToLogin,
      handleOtpChange,
      handleResendOtp,
      formatTime,
      itemVariants,
    ]
  );

  // Memoized Login Form Component for better performance
  const LoginForm = useMemo(
    () => (
      <motion.div
        key="login-form"
        initial={{ opacity: 0, x: -50, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="space-y-4 sm:space-y-5"
      >
        {/* Employee ID Field - Enhanced */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <label
              htmlFor="emp_id"
              className="block text-xs sm:text-sm font-medium text-gray-700"
            >
              Employee ID <span className="text-red-500">*</span>
            </label>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEmpIdHelp(!showEmpIdHelp)}
              className="text-emerald-600 hover:text-emerald-700 text-xs sm:text-sm font-medium flex items-center gap-1 touch-manipulation"
            >
              <Info className="w-3 h-3 sm:w-4 sm:h-4" />
              Help
            </motion.button>
          </div>

          <AnimatePresence>
            {showEmpIdHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mb-3 p-2 sm:p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
              >
                <p className="text-xs sm:text-sm text-emerald-700">
                  📝 Your Employee ID should be:
                </p>
                <ul className="text-xs sm:text-sm text-emerald-600 mt-1 space-y-1">
                  <li>• Exactly 6 digits long</li>
                  <li>• Start with 950, 951, or 952</li>
                  <li>• Example: 950123, 951456, 952789</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <User className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400" />
            </div>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              id="emp_id"
              name="emp_id"
              value={formData.emp_id}
              onChange={handleInputChange}
              maxLength="6"
              disabled={isLoading}
              className={`w-full pl-7 sm:pl-8 md:pl-9 lg:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation ${
                errors.emp_id
                  ? "border-red-400 focus:ring-red-500"
                  : "border-gray-200"
              }`}
              placeholder="950000"
              autoComplete="username"
              style={{
                WebkitAppearance: "none",
                appearance: "none",
              }}
            />

            {/* Character counter */}
            <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center">
              <span
                className={`text-xs ${
                  formData.emp_id.length === 6
                    ? "text-emerald-600"
                    : "text-gray-400"
                }`}
              >
                {formData.emp_id.length}/6
              </span>
            </div>
          </div>

          {errors.emp_id && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center gap-1"
            >
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
             {errors.emp_id}
           </motion.p>
         )}
       </motion.div>

       {/* Birth Date Field - Enhanced */}
       <motion.div variants={itemVariants}>
         <label
           htmlFor="birth_date"
           className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
         >
           Birth Date <span className="text-red-500">*</span>
           <span className="text-xs text-gray-500 ml-1">
             (Must be 16+ years old)
           </span>
         </label>
         <div className="relative">
           <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
             <Calendar className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400" />
           </div>
           <motion.input
             whileFocus={{ scale: 1.01 }}
             type="date"
             id="birth_date"
             name="birth_date"
             value={formData.birth_date}
             onChange={handleInputChange}
             disabled={isLoading}
             max={new Date().toISOString().split("T")[0]}
             className={`w-full pl-7 sm:pl-8 md:pl-9 lg:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation ${
               errors.birth_date
                 ? "border-red-400 focus:ring-red-500"
                 : "border-gray-200"
             }`}
             autoComplete="bday"
             style={{
               WebkitAppearance: "none",
               appearance: "none",
             }}
           />
         </div>
         {errors.birth_date && (
           <motion.p
             initial={{ opacity: 0, y: -5 }}
             animate={{ opacity: 1, y: 0 }}
             className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center gap-1"
           >
             <XCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
             {errors.birth_date}
           </motion.p>
         )}
       </motion.div>

       {/* Sign In Button - Enhanced */}
       <motion.div variants={itemVariants} className="pt-2 sm:pt-3">
         <motion.button
           whileHover={!isLoading ? { scale: 1.02, y: -1 } : {}}
           whileTap={!isLoading ? { scale: 0.98 } : {}}
           type="submit"
           disabled={isLoading}
           className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-2.5 sm:py-3 md:py-3.5 px-4 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm md:text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 touch-manipulation min-h-[44px]"
           style={{
             WebkitTapHighlightColor: "transparent",
             touchAction: "manipulation",
           }}
         >
           {isLoading ? (
             <>
               <motion.div
                 animate={{ rotate: 360 }}
                 transition={{
                   duration: 1,
                   repeat: Infinity,
                   ease: "linear",
                 }}
                 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full"
               />
               <span className="text-xs sm:text-sm md:text-base">
                 {isValidationLoading ? "Validating..." : "Signing In..."}
               </span>
             </>
           ) : (
             <>
               <LogIn className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
               <span className="text-xs sm:text-sm md:text-base">Sign In</span>
             </>
           )}
         </motion.button>
       </motion.div>

       {/* Required Fields Notice */}
       <motion.div variants={itemVariants} className="pt-1 sm:pt-2">
         <p className="text-xs sm:text-sm text-gray-500 text-center">
           <span className="text-red-500">*</span> Required fields
         </p>
       </motion.div>
     </motion.div>
   ),
   [
     formData,
     errors,
     showEmpIdHelp,
     isLoading,
     isValidationLoading,
     handleInputChange,
     itemVariants,
   ]
 );

 return (
   <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
     {/* Enhanced Snackbar Notification - Fully Responsive */}
     <AnimatePresence>
       {notification.show && (
         <motion.div
           variants={snackbarVariants}
           initial="hidden"
           animate="visible"
           exit="exit"
           className={`fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-50 ${getNotificationStyles(
             notification.type
           )} text-white rounded-xl sm:rounded-2xl border-2 shadow-2xl max-w-[calc(100vw-1rem)] sm:max-w-md w-full mx-2 sm:mx-4 backdrop-blur-sm`}
         >
           <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4">
             {/* Icon */}
             <div className="flex-shrink-0 mt-0.5">
               <motion.div
                 animate={{
                   scale: [1, 1.1, 1],
                   rotate:
                     notification.type === "success" ? [0, 10, -10, 0] : 0,
                 }}
                 transition={{
                   duration: notification.type === "success" ? 0.6 : 0.3,
                   repeat: notification.type === "success" ? 2 : 0,
                 }}
               >
                 {getNotificationIcon(notification.type)}
               </motion.div>
             </div>

             {/* Message */}
             <div className="flex-1 min-w-0">
               <p className="text-xs sm:text-sm font-medium leading-relaxed break-words">
                 {notification.message}
               </p>
             </div>

             {/* Close Button */}
             <motion.button
               whileHover={{ scale: 1.1, rotate: 90 }}
               whileTap={{ scale: 0.9 }}
               onClick={closeNotification}
               className="flex-shrink-0 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded-full p-1 touch-manipulation"
               aria-label="Close notification"
             >
               <svg
                 className="w-3 h-3 sm:w-4 sm:h-4"
                 fill="none"
                 stroke="currentColor"
                 viewBox="0 0 24 24"
               >
                 <path
                   strokeLinecap="round"
                   strokeLinejoin="round"
                   strokeWidth={2}
                   d="M6 18L18 6M6 6l12 12"
                 />
               </svg>
             </motion.button>
           </div>

           {/* Progress bar for success messages */}
           {notification.type === "success" && (
             <motion.div
               initial={{ width: "0%" }}
               animate={{ width: "100%" }}
               transition={{ duration: 2.5, ease: "linear" }}
               className="h-1 bg-white/30 rounded-b-xl sm:rounded-b-2xl"
             />
           )}

           {/* Pulse effect for error messages */}
           {notification.type === "error" && (
             <motion.div
               animate={{ opacity: [0.3, 0.6, 0.3] }}
               transition={{ duration: 1.5, repeat: Infinity }}
               className="absolute inset-0 bg-white/10 rounded-xl sm:rounded-2xl pointer-events-none"
             />
           )}
         </motion.div>
       )}
     </AnimatePresence>

     <motion.div
       variants={containerVariants}
       initial="hidden"
       animate="visible"
       className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl"
     >
       {/* Header - Fully Responsive */}
       <motion.div
         variants={itemVariants}
         className="text-center mb-4 sm:mb-6 md:mb-8"
       >
         <motion.div
           whileHover={{ rotate: 360, scale: 1.1 }}
           transition={{ duration: 0.6 }}
           className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg sm:rounded-xl mb-2 sm:mb-3 md:mb-4 shadow-lg"
         >
           <Building2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" />
         </motion.div>
         <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
           Employee Portal
         </h1>
         <p className="text-xs sm:text-sm md:text-base text-gray-600 px-4">
           {showOtp
             ? "Two-Factor Authentication"
             : "Sign in to access your account"}
         </p>
       </motion.div>

       {/* Form Card - Enhanced Responsiveness with AnimatePresence for smooth transitions */}
       <motion.div
         variants={itemVariants}
         className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-5 md:p-6 lg:p-8"
       >
         <form
           onSubmit={showOtp ? handleOtpSubmit : handleSubmit}
           onKeyPress={handleKeyPress}
           noValidate
         >
           <AnimatePresence mode="wait">
             {showOtp ? OtpForm : LoginForm}
           </AnimatePresence>
         </form>
       </motion.div>

       {/* Footer - Enhanced Responsiveness */}
       <motion.div
         variants={itemVariants}
         className="text-center mt-3 sm:mt-4 md:mt-6 lg:mt-8 space-y-1 sm:space-y-2"
       >
         {!showOtp && (
           <p className="text-xs sm:text-sm text-gray-500 px-4">
             Don't have an account?{" "}
             <Link
               className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors underline underline-offset-2"
               to="/registration"
             >
               Sign Up
             </Link>
           </p>
         )}
         <p className="text-xs sm:text-sm text-gray-500 px-4">
           Need help? Contact your system administrator
         </p>

         {/* Additional responsive footer info */}
         <motion.div
           className="pt-2 sm:pt-3 border-t border-gray-200/50 mt-3 sm:mt-4"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1 }}
         >
           <p className="text-xs text-gray-400">
             Secure • Private • Protected
           </p>
         </motion.div>
       </motion.div>
     </motion.div>
   </div>
 );
};