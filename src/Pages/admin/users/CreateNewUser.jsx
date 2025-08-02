import React, { useState, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Calendar, 
  UserPlus, 
  Building2, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  Hash,
  Mail
} from "lucide-react";
import { useCreateNewUserMutation } from "../../../redux/apis/AdminApis";

// Memoized animation variants to prevent recreation
const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.08,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 0 },
    visible: {
      opacity: 1,
      y: 10,
      transition: { duration: 1, delay: 1.2 },
    },
  },
  snackbar: {
    hidden: { 
      opacity: 0, 
      y: -100, 
      scale: 0.8,
      rotateX: -90
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
        duration: 0.6
      }
    },
    exit: { 
      opacity: 0, 
      y: -100, 
      scale: 0.8,
      rotateX: -90,
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  }
};

// Memoized notification icon component
const NotificationIcon = memo(({ type }) => {
  const iconProps = { className: "w-5 h-5 flex-shrink-0" };
  
  switch (type) {
    case "success":
      return <CheckCircle {...iconProps} />;
    case "error":
      return <XCircle {...iconProps} />;
    case "warning":
      return <AlertCircle {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
});

// Memoized floating elements component
const FloatingElements = memo(() => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    {[
      { top: "25%", left: "10%", duration: 20, size: "w-8 h-8", color: "bg-emerald-200/20" },
      { top: "33%", right: "16%", duration: 25, size: "w-6 h-6", color: "bg-teal-200/20" },
      { bottom: "25%", left: "25%", duration: 30, size: "w-4 h-4", color: "bg-cyan-200/20" },
      { bottom: "33%", right: "25%", duration: 15, size: "w-5 h-5", color: "bg-emerald-300/20" }
    ].map((element, index) => (
      <motion.div
        key={index}
        animate={{
          x: [0, index % 2 === 0 ? 100 : -80, 0],
          y: [0, index % 2 === 0 ? -50 : 60, 0],
          rotate: [0, index % 2 === 0 ? 180 : -180, index % 2 === 0 ? 360 : -360],
        }}
        transition={{
          duration: element.duration,
          repeat: Infinity,
          ease: "linear",
        }}
        className={`absolute ${Object.entries(element).filter(([key]) => 
          ['top', 'bottom', 'left', 'right'].includes(key)
        ).map(([key, value]) => `${key}-[${value}]`).join(' ')} ${element.size} ${element.color} rounded-full blur-sm`}
        style={{
          [Object.keys(element).find(key => ['top', 'bottom'].includes(key))]: 
            Object.values(element).find((_, i) => ['top', 'bottom'].includes(Object.keys(element)[i])),
          [Object.keys(element).find(key => ['left', 'right'].includes(key))]: 
            Object.values(element).find((_, i) => ['left', 'right'].includes(Object.keys(element)[i]))
        }}
      />
    ))}
  </div>
));

// Memoized validation status component
const ValidationStatus = memo(({ formData, errors }) => {
  const fields = [
    { field: 'name', label: 'Name' },
    { field: 'email', label: 'Email' },
    { field: 'emp_id', label: 'ID' },
    { field: 'birth_date', label: 'Birth Date' },
    { field: 'ref_Name', label: 'Reference' }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
      {fields.map(({ field, label }) => (
        <div key={field} className="flex items-center gap-1 justify-center">
          {formData[field] && !errors[field] ? (
            <CheckCircle className="w-3 h-3 text-emerald-500" />
          ) : errors[field] ? (
            <XCircle className="w-3 h-3 text-red-400" />
          ) : (
            <div className="w-3 h-3 border border-gray-300 rounded-full" />
          )}
          <span className={`text-xs ${
            formData[field] && !errors[field] 
              ? 'text-emerald-600' 
              : errors[field] 
              ? 'text-red-500' 
              : 'text-gray-400'
          }`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
});

export const CreateNewUser = () => {
  // Mock mutation hook for demo
  
  
  const [createNewUser, { isLoading }] = useCreateNewUserMutation();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    emp_id: "",
    birth_date: "",
    ref_Name: "",
  });

  const [errors, setErrors] = useState({});
  const [showEmpIdHelp, setShowEmpIdHelp] = useState(false);
  const [showRefHelp, setShowRefHelp] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    show: false,
  });

  // Memoized notification styles function
  const getNotificationStyles = useCallback((type) => {
    const styles = {
      success: "bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-700 shadow-emerald-500/30",
      error: "bg-gradient-to-r from-red-500 to-red-600 border-red-700 shadow-red-500/30",
      warning: "bg-gradient-to-r from-amber-500 to-orange-600 border-orange-700 shadow-amber-500/30",
      default: "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-700 shadow-blue-500/30"
    };
    return styles[type] || styles.default;
  }, []);

  // Enhanced notification system with auto-dismiss and manual close
  const showNotification = useCallback((message, type = "info", duration = 4000) => {
    setNotification({ message, type, show: true });
    
    if (duration > 0) {
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, duration);
    }
  }, []);

  // Close notification manually
  const closeNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, show: false }));
  }, []);

  // Optimized input validation with debouncing
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;

    // Handle specific input restrictions
    let processedValue = value;

    if (name === "emp_id") {
      // Only allow numbers and max 6 digits
      processedValue = value.replace(/\D/g, "").slice(0, 6);
    } else if (name === "name" || name === "ref_Name") {
      // Only allow letters and spaces, max 20 characters
      processedValue = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 20);
    } else if (name === "email") {
      // Basic email cleanup - remove spaces and limit length
      processedValue = value.trim().slice(0, 50);
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: processedValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Must be at least 2 characters";
    } else if (formData.name.length > 20) {
      newErrors.name = "Must be maximum 20 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = "Only letters and spaces allowed";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (formData.email.length > 50) {
      newErrors.email = "Email must be maximum 50 characters";
    }

    // Employee ID validation
    if (!formData.emp_id.trim()) {
      newErrors.emp_id = "Employee ID is required";
    } else if (formData.emp_id.length !== 6) {
      newErrors.emp_id = "Employee ID must be exactly 6 digits";
    } else if (!formData.emp_id.startsWith("951") && !formData.emp_id.startsWith("950") && !formData.emp_id.startsWith("952")) {
      newErrors.emp_id = "Employee ID must start with 950, 951, or 952 followed by 3 digits";
    }

    // Birth date validation
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

    // Reference name validation (optional but same rules as name if provided)
    if (formData.ref_Name.trim()) {
      if (formData.ref_Name.length < 2) {
        newErrors.ref_Name = "Must be at least 2 characters";
      } else if (formData.ref_Name.length > 20) {
        newErrors.ref_Name = "Must be maximum 20 characters";
      } else if (!/^[a-zA-Z\s]+$/.test(formData.ref_Name)) {
        newErrors.ref_Name = "Only letters and spaces allowed";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateEmail]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification("🚨 Please fix the errors in the form", "error", 4000);
      return;
    }

    if (isLoading) return;

    try {
      await createNewUser(formData).unwrap();

      // Success notification
      showNotification(
        "🎉 User created successfully!", 
        "success", 
        3500
      );

      // Reset form after successful creation
      setFormData({
        name: "",
        email: "",
        emp_id: "",
        birth_date: "",
        ref_Name: "",
      });
      setErrors({});

    } catch (error) {
      console.error("Create user error:", error);
      
      // Enhanced error handling for the specific error format
      let errorMessage = "❌ Failed to create user. Please try again.";
      
      if (error?.status === 400) {
        if (error?.data?.details && Array.isArray(error.data.details)) {
          const detailMessages = error.data.details.join(". ");
          errorMessage = `🚨 ${detailMessages}`;
        } else if (error?.data?.message) {
          errorMessage = `🚨 ${error.data.message}`;
        }
      } else if (error?.status === 409) {
        errorMessage = "🔄 Employee ID or email already exists. Please use different values.";
      } else if (error?.status === 429) {
        errorMessage = "⏳ Too many requests. Please try again later.";
      } else if (error?.status >= 500) {
        errorMessage = "🔧 Server error. Please try again later.";
      } else if (error?.data?.message) {
        errorMessage = `❌ ${error.data.message}`;
      } else if (error?.message) {
        errorMessage = `❌ ${error.message}`;
      }

      showNotification(errorMessage, "error", 6000);
    }
  }, [formData, validateForm, createNewUser, isLoading, showNotification]);

  // Handle Enter key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit(e);
    }
  }, [handleSubmit, isLoading]);

  // Memoized form completion percentage
  const formCompletionPercentage = useMemo(() => {
    const requiredFields = ['name', 'email', 'emp_id', 'birth_date'];
    const completedFields = requiredFields.filter(field => formData[field].trim() !== '');
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }, [formData]);

  // Memoized form validation status
  const isFormReadyToSubmit = useMemo(() => {
    const requiredFields = ['name', 'email', 'emp_id', 'birth_date'];
    return requiredFields.every(field => formData[field].trim() !== '') && 
           Object.keys(errors).length === 0;
  }, [formData, errors]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
      {/* Enhanced Snackbar Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            variants={ANIMATION_VARIANTS.snackbar}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-50 ${getNotificationStyles(
              notification.type
            )} text-white rounded-xl sm:rounded-2xl border-2 shadow-2xl max-w-[calc(100vw-1rem)] sm:max-w-md w-full mx-2 sm:mx-4 backdrop-blur-sm`}
          >
            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4">
              <div className="flex-shrink-0 mt-0.5">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: notification.type === "success" ? [0, 10, -10, 0] : 0
                  }}
                  transition={{ 
                    duration: notification.type === "success" ? 0.6 : 0.3,
                    repeat: notification.type === "success" ? 2 : 0
                  }}
                >
                  <NotificationIcon type={notification.type} />
                </motion.div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium leading-relaxed break-words">
                  {notification.message}
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeNotification}
                className="flex-shrink-0 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded-full p-1 touch-manipulation"
                aria-label="Close notification"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
            
            {notification.type === "success" && (
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 3.5, ease: "linear" }}
                className="h-1 bg-white/30 rounded-b-xl sm:rounded-b-2xl"
              />
            )}

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
        variants={ANIMATION_VARIANTS.container}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl"
      >
        {/* Header */}
        <motion.div className="text-center mb-4 sm:mb-6 md:mb-8">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg sm:rounded-xl mb-2 sm:mb-3 md:mb-4 shadow-lg"
          >
            <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" />
          </motion.div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
            Create New User
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 px-4">
            Add a new team member to the system
          </p>
        </motion.div>

        {/* Status Section */}
        <div className="text-center mt-3 sm:mt-4 md:mt-6 lg:mt-8 space-y-1 sm:space-y-2">
          <motion.div 
            className="pt-2 sm:pt-3 border-t border-gray-200/50 mt-3 sm:mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs text-gray-400">
              🔒 All user data is secure and protected
            </p>
          </motion.div>

          {/* Form completion status */}
          <motion.div 
            className="pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <span>Form completion:</span>
              <div className="flex items-center gap-1">
                <div className="w-16 sm:w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${formCompletionPercentage}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-xs font-medium">
                  {formCompletionPercentage}%
                </span>
              </div>
            </div>
          </motion.div>

          {/* Success/Error Status Animation */}
          <AnimatePresence>
            {isFormReadyToSubmit && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="pt-2"
              >
                <div className="flex items-center justify-center gap-2 text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Ready to submit!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Field validation summary */}
          <motion.div 
            className="pt-2 space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <ValidationStatus formData={formData} errors={errors} />
          </motion.div>

          {/* Admin helper text */}
          <motion.div 
            className="pt-3 sm:pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="bg-emerald-50/50 border border-emerald-200/30 rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-2 justify-center mb-1">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                <span className="text-xs sm:text-sm font-medium text-emerald-700">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-emerald-600 text-center">
                You are creating a new user account. Ensure all information is accurate before submission.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Form Card */}
        <motion.div
          variants={ANIMATION_VARIANTS.item}
          className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-5 md:p-6 lg:p-8"
        >
          <form onSubmit={handleSubmit} onKeyPress={handleKeyPress} noValidate>
            <div className="space-y-4 sm:space-y-5">
              {/* Name Field */}
              <motion.div variants={ANIMATION_VARIANTS.item}>
                <label
                  htmlFor="name"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
                >
                  Full Name <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-1">
                    (Max 20 characters)
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400" />
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    maxLength="20"
                    disabled={isLoading}
                    className={`w-full pl-7 sm:pl-8 md:pl-9 lg:pl-10 pr-12 sm:pr-16 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation ${
                      errors.name
                        ? "border-red-400 focus:ring-red-500"
                        : "border-gray-200"
                    }`}
                    placeholder="Enter full name"
                    autoComplete="name"
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
                    <span className={`text-xs ${formData.name.length >= 18 ? 'text-amber-600' : 'text-gray-400'}`}>
                      {formData.name.length}/20
                    </span>
                  </div>
                </div>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center gap-1"
                  >
                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    {errors.name}
                  </motion.p>
                )}
              </motion.div>

              {/* Email Field - NEW */}
              <motion.div variants={ANIMATION_VARIANTS.item}>
                <label
                  htmlFor="email"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
                >
                  Email Address <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-1">
                    (Max 50 characters)
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400" />
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    maxLength="50"
                    disabled={isLoading}
                    className={`w-full pl-7 sm:pl-8 md:pl-9 lg:pl-10 pr-12 sm:pr-16 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation ${
                      errors.email
                        ? "border-red-400 focus:ring-red-500"
                        : "border-gray-200"
                    }`}
                    placeholder="Enter email address"
                    autoComplete="email"
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
                    <span className={`text-xs ${formData.email.length >= 45 ? 'text-amber-600' : 'text-gray-400'}`}>
                      {formData.email.length}/50
                    </span>
                  </div>
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center gap-1"
                  >
                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>

              {/* Employee ID Field */}
              <motion.div variants={ANIMATION_VARIANTS.item}>
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
                        📝 Employee ID format:
                      </p>
                      <ul className="text-xs sm:text-sm text-emerald-600 mt-1 space-y-1">
                        <li>• Must start with <strong>950</strong>, <strong>951</strong>, or <strong>952</strong></li>
                        <li>• Followed by exactly 3 more digits</li>
                        <li>• Total: 6 digits (950XXX, 951XXX, 952XXX)</li>
                        <li>• Examples: 950001, 951123, 952999</li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <Hash className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400" />
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="text"
                    id="emp_id"
                    name="emp_id"
                    value={formData.emp_id}
                    onChange={handleChange}
                    maxLength="6"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    disabled={isLoading}
                    className={`w-full pl-7 sm:pl-8 md:pl-9 lg:pl-10 pr-12 sm:pr-16 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation ${
                      errors.emp_id
                        ? "border-red-400 focus:ring-red-500"
                        : "border-gray-200"
                    }`}
                    placeholder="950000"
                    autoComplete="off"
                    style={{
                      WebkitAppearance: "none",
                      appearance: "none",
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center">
                    <span className={`text-xs ${
                      formData.emp_id.length === 6 && (formData.emp_id.startsWith('950') || formData.emp_id.startsWith('951') || formData.emp_id.startsWith('952'))
                        ? 'text-emerald-600' 
                        : formData.emp_id.length === 6 
                        ? 'text-amber-600' 
                        : 'text-gray-400'
                    }`}>
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

              {/* Birth Date Field */}
              <motion.div variants={ANIMATION_VARIANTS.item}>
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
                    onChange={handleChange}
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

              {/* Reference Name Field */}
              <motion.div variants={ANIMATION_VARIANTS.item}>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <label
                    htmlFor="ref_Name"
                    className="block text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Reference Name{" "}
                    <span className="text-gray-400 text-xs">
                      (Optional)
                    </span>
                  </label>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowRefHelp(!showRefHelp)}
                    className="text-emerald-600 hover:text-emerald-700 text-xs sm:text-sm font-medium flex items-center gap-1 touch-manipulation"
                  >
                    <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                    Help
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showRefHelp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="mb-3 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <p className="text-xs sm:text-sm text-blue-700">
                        👥 Reference Person Info:
                      </p>
                      <ul className="text-xs sm:text-sm text-blue-600 mt-1 space-y-1">
                        <li>• Name of someone who referred this person</li>
                        <li>• Current employee or contact person</li>
                        <li>• This field is optional</li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400" />
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="text"
                    id="ref_Name"
                    name="ref_Name"
                    value={formData.ref_Name}
                    onChange={handleChange}
                    maxLength="20"
                    disabled={isLoading}
                    className={`w-full pl-7 sm:pl-8 md:pl-9 lg:pl-10 pr-12 sm:pr-16 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation ${
                      errors.ref_Name
                        ? "border-red-400 focus:ring-red-500"
                        : "border-gray-200"
                    }`}
                    placeholder="Enter reference person's name"
                    autoComplete="off"
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
                    <span className={`text-xs ${formData.ref_Name.length >= 18 ? 'text-amber-600' : 'text-gray-400'}`}>
                      {formData.ref_Name.length}/20
                    </span>
                  </div>
                </div>
                {errors.ref_Name && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center gap-1"
                  >
                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    {errors.ref_Name}
                  </motion.p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={ANIMATION_VARIANTS.item} className="pt-2 sm:pt-3">
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
                      <span className="text-xs sm:text-sm md:text-base">Creating User...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      <span className="text-xs sm:text-sm md:text-base">Create User</span>
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Form Progress Indicator */}
              <motion.div 
                variants={ANIMATION_VARIANTS.item} 
                className="pt-2"
              >
                <div className="flex justify-center space-x-2">
                  {['name', 'email', 'emp_id', 'birth_date'].map((field, index) => (
                    <motion.div
                      key={field}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        formData[field] && !errors[field] 
                          ? 'bg-emerald-500' 
                          : errors[field] 
                          ? 'bg-red-400' 
                          : 'bg-gray-300'
                      }`}
                      animate={{
                        scale: formData[field] && !errors[field] ? [1, 1.3, 1] : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  <span className="text-red-500">*</span> Required fields
                </p>
              </motion.div>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={ANIMATION_VARIANTS.item}
          className="text-center mt-3 sm:mt-4 md:mt-6 lg:mt-8 space-y-1 sm:space-y-2"
        >
          <p className="text-xs sm:text-sm text-gray-500 px-4">
            Creating user accounts for team management
          </p>
        </motion.div>
      </motion.div>

      {/* Floating background elements */}
      <FloatingElements />
    </div>
  );
};