import { motion, AnimatePresence } from "framer-motion";
import { useDeleteUserAndHisVotedMutation } from "../../../../redux/apis/AdminApis";
import { useState, useCallback, useEffect } from "react";

export const ShowPopUpForDeleteUser = ({ refetch, user, showPopUp, onClose }) => {
  const [deleteUserAndHisVoted, { isLoading }] = useDeleteUserAndHisVotedMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showPopUp && !isDeleting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showPopUp, onClose, isDeleting]);

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (showPopUp) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPopUp]);

  const handleDelete = useCallback(async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteUserAndHisVoted(user._id).unwrap();
      await refetch();
      onClose();
    } catch (error) {
      console.error('Failed to delete user:', error);
      // You might want to show an error toast here
    } finally {
      setIsDeleting(false);
    }
  }, [deleteUserAndHisVoted, user._id, refetch, onClose, isDeleting]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  }, [onClose, isDeleting]);

  // Animation variants for better performance
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: -50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: -50,
      transition: {
        duration: 0.2
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <AnimatePresence mode="wait">
      {showPopUp && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onClick={handleBackdropClick}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Delete User
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  disabled={isDeleting}
                  className="text-white hover:text-red-200 transition-colors disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {/* Warning Icon */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 20, stiffness: 300 }}
                className="flex justify-center mb-4"
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </motion.div>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-6"
              >
                <p className="text-gray-700 text-lg mb-2">
                  Are you sure you want to delete this user?
                </p>
                <p className="text-gray-500 text-sm">
                  <span className="font-semibold text-gray-700">{user?.name}</span> and all their associated data will be permanently removed. This action cannot be undone.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3 justify-start"
              >
                
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
                >
                  {isDeleting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete User
                    </>
                  )}
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={onClose}
                  disabled={isDeleting}
                  className="px-6 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </motion.button>
            </motion.div>
              </div>

            {/* Loading overlay */}
            <AnimatePresence>
              {isDeleting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};