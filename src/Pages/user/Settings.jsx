import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, User, Mail, CreditCard, Save } from 'lucide-react';
import { useEditProfileMutation } from '../../redux/apis/UserApis';
import { editUser } from '../../redux/slices/authSlice';

export const Settings = () => {
  const { user: authuser } = useSelector((state) => state.auth);
  const [editProfile, { isLoading }] = useEditProfileMutation();
  const [formData, setFormData] = useState({ ...authuser });
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    show: false,
  });
  const [errors, setErrors] = useState({});
  
  const dispatch = useDispatch();

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = async () => {
    if (!validateForm()) {
      showNotification("Please fix the errors in the form", "error", 5000);
      return;
    }

    if (isLoading) return;

    try {
      const res = await editProfile(formData).unwrap();
      dispatch(editUser(res.user));
      
      showNotification(
        "✅ Profile updated successfully!",
        "success",
        4000
      );
    } catch (error) {
      console.error('Profile update error:', error);
      
      let errorMessage = "❌ Failed to update profile. Please try again.";
      
      if (error?.status === 400) {
        errorMessage = error?.data?.message || "Invalid data provided. Please check your inputs.";
      } else if (error?.status === 401) {
        errorMessage = "Session expired. Please login again.";
      } else if (error?.status === 409) {
        errorMessage = "Email already exists. Please use a different email.";
      } else if (error?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }

      showNotification(errorMessage, "error", 6000);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
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
  };

  // Get notification colors based on type
  const getNotificationStyles = (type) => {
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
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(authuser);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Enhanced Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-50 ${getNotificationStyles(
              notification.type
            )} text-white rounded-xl border-2 shadow-2xl max-w-md w-full mx-4 backdrop-blur-sm`}
          >
            <div className="flex items-start gap-3 p-4">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: notification.type === "success" ? [0, 10, -10, 0] : 0,
                }}
                transition={{
                  duration: notification.type === "success" ? 0.6 : 0.3,
                  repeat: notification.type === "success" ? 2 : 0,
                }}
              >
                {getNotificationIcon(notification.type)}
              </motion.div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-relaxed break-words">
                  {notification.message}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeNotification}
                className="flex-shrink-0 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded-full p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <User className="w-6 h-6 text-emerald-600" />
          Settings
        </h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Profile Settings
              </h3>
              
              <div className="space-y-4">
                {/* Name Field */}
                <motion.div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      onChange={handleChange}
                      value={formData.name || ''}
                      name="name"
                      disabled={isLoading}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                        errors.name ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4 flex-shrink-0" />
                      {errors.name}
                    </motion.p>
                  )}
                </motion.div>

                {/* Email Field */}
                <motion.div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      name="email"
                      disabled={isLoading}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                        errors.email ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4 flex-shrink-0" />
                      {errors.email}
                    </motion.p>
                  )}
                </motion.div>

                {/* Employee ID Field */}
                <motion.div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      disabled
                      value={formData.emp_id || ''}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-500"
                      readOnly
                      placeholder="Employee ID (cannot be changed)"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Employee ID cannot be modified for security reasons.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {hasChanges ? (
                <span className="text-amber-600 font-medium">You have unsaved changes</span>
              ) : (
                <span>All changes saved</span>
              )}
            </div>
            
            <motion.button
              whileHover={!isLoading && hasChanges ? { scale: 1.02, y: -1 } : {}}
              whileTap={!isLoading && hasChanges ? { scale: 0.98 } : {}}
              onClick={handleEdit}
              disabled={isLoading || !hasChanges}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};