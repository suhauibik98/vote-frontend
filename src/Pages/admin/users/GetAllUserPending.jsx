/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar, 
  User, 
  Hash, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Building2,
  UserCheck,
  UserX
} from "lucide-react";
import { 
  useApproveRequestMutation, 
  usePendingRequestsQuery, 
  useRejectRequestMutation 
} from "../../../redux/apis/AdminApis";
import { Spinner } from "../../../components/Spinner";

export const GetAllUserPending = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("pending");
  const [processingIds, setProcessingIds] = useState(new Set());
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    show: false,
  });
  
  const { data, isLoading, refetch, error: queryError } = usePendingRequestsQuery({ page , status });
  const [approveRequest] = useApproveRequestMutation();
  const [rejectRequest] = useRejectRequestMutation();
  
  const [pendingUser, setPendingUser] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

   useEffect(() => {
    refetchData()
  }, []);
  // Enhanced notification system
  const showNotification = useCallback((message, type = "info", duration = 4000) => {
    setNotification({ message, type, show: true });
    
    if (duration > 0) {
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, duration);
    }
  }, []);

  const closeNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, show: false }));
  }, []);

  useEffect(() => {
    setPendingUser(data?.requests || []);
  }, [data]);

  // Filter and sort users
  useEffect(() => {
    let filtered = [...pendingUser];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.emp_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.ref_Name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'birth_date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  }, [pendingUser, searchTerm, filterStatus, sortBy, sortOrder]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
 

  const refetchData = useCallback(async() => {
   await refetch();
    setErrors({});
    setSuccessMessage('');
  }, [refetch]);

  const approveRequestFun = useCallback(async (id) => {
    setProcessingIds(prev => new Set([...prev, id]));
    setErrors(prev => ({ ...prev, [id]: null }));
    
    try {
      await approveRequest(id).unwrap();
      showNotification("🎉 Request approved successfully!", "success", 3500);
      refetch();
    } catch (error) {
      const errorMessage = error?.data?.message || 'Failed to approve request';
      setErrors(prev => ({ 
        ...prev, 
        [id]: errorMessage
      }));
      showNotification(`❌ ${errorMessage}`, "error", 6000);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [approveRequest, refetch, showNotification]);

  const rejectRequestFun = useCallback(async (id) => {
    setProcessingIds(prev => new Set([...prev, id]));
    setErrors(prev => ({ ...prev, [id]: null }));
    
    try {
      await rejectRequest(id).unwrap();
      showNotification("✅ Request rejected successfully!", "success", 3500);
      refetch();
    } catch (error) {
      const errorMessage = error?.data?.message || 'Failed to reject request';
      setErrors(prev => ({ 
        ...prev, 
        [id]: errorMessage
      }));
      showNotification(`❌ ${errorMessage}`, "error", 6000);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [rejectRequest, refetch, showNotification]);

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleStatusChange = useCallback((value) => {    
    setStatus(value);
  }, []);

  
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // Animation variants
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.08,
      },
    },
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }), []);

  const cardVariants = useMemo(() => ({
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: (index) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
      },
    }),
    hover: {
      scale: 1.02,
      y: -5,
      transition: { duration: 0.2 },
    },
  }), []);

  const snackbarVariants = useMemo(() => ({
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
  }), []);

  // Get notification icon and styles
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

  if (isLoading) return <Spinner />;

  if (queryError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-teal-50 to-cyan-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-100 p-8 text-center">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -10, 10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <AlertCircle className="w-8 h-8 text-red-500" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-6">{queryError?.data?.message || 'Something went wrong while fetching pending requests'}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refetchData}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Try Again
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 relative overflow-hidden">
      {/* Enhanced Snackbar Notification */}
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
                  {getNotificationIcon(notification.type)}
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
                className="flex-shrink-0 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded-full p-1"
                aria-label="Close notification"
              >
                <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-10 w-8 h-8 bg-emerald-200/20 rounded-full blur-sm"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/3 right-16 w-6 h-6 bg-teal-200/20 rounded-full blur-sm"
        />
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 left-1/4 w-4 h-4 bg-cyan-200/20 rounded-full blur-sm"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/3 right-1/4 w-5 h-5 bg-emerald-300/20 rounded-full blur-sm"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8"
      >
        
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-8 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg"
                >
                  <Users className="w-6 h-6 text-white" />
                </motion.div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Pending User Requests
                </h1>
              </motion.div>
              <p className="text-gray-600 text-sm lg:text-base ml-15">
                Manage and review user registration requests
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.00, y: 0 }}
              whileTap={{ scale: 0.95 }}
              onClick={refetchData}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:cursor-pointer px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 w-full lg:w-auto justify-center"
            >
              <motion.div
                animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                <RefreshCw className="w-5 h-5" />
              </motion.div>
              Refresh Data
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12"
        >
          {[
            { 
              title: `Total ${status}`, 
              value: data?.totalPendingRequsest || 0, 
              color: "emerald", 
              icon: Users,
              gradient: "from-emerald-500 to-emerald-600"
            },
            { 
              title: "Current Page", 
              value: page, 
              color: "blue", 
              icon: Hash,
              gradient: "from-blue-500 to-blue-600"
            },
            { 
              title: "Total Pages", 
              value: data?.totalPages || 0, 
              color: "purple", 
              icon: Building2,
              gradient: "from-purple-500 to-purple-600"
            },
            { 
              title: "Filtered Results", 
              value: filteredUsers.length, 
              color: "orange", 
              icon: Filter,
              gradient: "from-orange-500 to-orange-600"
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    duration: 0.5,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                  },
                },
              }}
              whileHover={{ 
                scale: 1.00, 
                y: 0,
                transition: { duration: 0.2 }
              }}
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                    {stat.title}
                  </p>
                  <motion.p 
                    className={`text-2xl lg:text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  >
                    {stat.value}
                  </motion.p>
                </div>
                <motion.div 
                  className={`p-3 bg-gradient-to-r ${stat.gradient} rounded-full shadow-lg group-hover:shadow-xl transition-shadow`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-8 lg:mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-600" />
                Search
              </label>
              <div className="relative">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  placeholder="Search by name, ID, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                />
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                Sort By
              </label>
              <motion.select
                whileFocus={{ scale: 1.02 }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
              >
                <option value="createdAt">Date Created</option>
                <option value="name">Name</option>
                <option value="emp_id">Employee ID</option>
                <option value="birth_date">Birth Date</option>
              </motion.select>
            </div> */}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Sort Order
              </label>
              <motion.select
                whileFocus={{ scale: 1.02 }}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </motion.select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                status
              </label>
              <motion.select
                whileFocus={{ scale: 1.02 }}
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
              >
                <option value="pending">Pinding</option>
                <option value="rejected">Rejected</option>
                <option value="approved">approved</option>
              </motion.select>
            </div>
          </div>
        </motion.div>

        {/* User Cards */}
        {filteredUsers.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-12 text-center"
          >
            <div className="max-w-md mx-auto">
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Users className="w-12 h-12 text-gray-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Requests Found</h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No requests match your current filters. Try adjusting your search criteria.'
                  : 'There are no pending requests at this time.'
                }
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
          >
            {filteredUsers.map((item, index) => (
              <motion.div 
                key={item._id} 
                custom={index}
                variants={cardVariants}
                whileHover="hover"
                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 group overflow-hidden"
              >
                <div className="p-6 lg:p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <motion.h3 
                        className="text-xl font-bold text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                      >
                        {item.name}
                      </motion.h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        Employee ID: {item.emp_id}
                      </p>
                    </div>
                    <motion.span 
                      whileHover={{ scale: 1.1 }}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        item.status === 'pending' 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : item.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {item.status}
                    </motion.span>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    {[
                      { icon: User, label: "Reference", value: item.ref_Name },
                      { icon: User, label: "Email", value: item.email },
                      { icon: Calendar, label: "Birth Date", value: formatDate(item.birth_date) },
                      { icon: Clock, label: "Created", value: formatDate(item.createdAt) }
                    ].map((detail, idx) => (
                      <motion.div 
                        key={detail.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <detail.icon className="w-4 h-4 text-emerald-600" />
                          {detail.label}
                        </span>
                        <span className="text-sm font-medium text-gray-800">{detail.value}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {errors[item._id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ 
                              scale: [1, 1.2, 1],
                              rotate: [0, -10, 10, 0]
                            }}
                            transition={{ 
                              duration: 0.5,
                              repeat: 2
                            }}
                          >
                            <XCircle className="w-5 h-5 text-red-500" />
                          </motion.div>
                          <p className="text-sm text-red-700 font-medium">{errors[item._id]}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => approveRequestFun(item._id)}
                      disabled={processingIds.has(item._id)}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium"
                    >
                      {processingIds.has(item._id) ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <UserCheck className="w-5 h-5" />
                          Approve
                        </>
                      )}
                    </motion.button>
                    
                    {status !=="rejected" &&<motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => rejectRequestFun(item._id)}
                      disabled={processingIds.has(item._id)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg hover:from-red-600 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium"
                    >
                      {processingIds.has(item._id) ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <UserX className="w-5 h-5" />
                          Reject
                        </>
                      )}
                    </motion.button>}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Enhanced Pagination */}
        {data?.totalPages > 1 && (
          <motion.div
            variants={itemVariants}
            className="flex justify-center mt-12"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-2">
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handlePageChange(e, 1)}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
                >
                  <ChevronsLeft className="w-4 h-4" />
                  First
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handlePageChange(e, page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </motion.button>
                
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, data.totalPages))].map((_, index) => {
                    const pageNum = Math.max(1, Math.min(data.totalPages - 4, page - 2)) + index;
                    if (pageNum > data.totalPages) return null;
                    
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handlePageChange(e, pageNum)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          page === pageNum
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg transform scale-105'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handlePageChange(e, page + 1)}
                  disabled={page === data.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handlePageChange(e, data.totalPages)}
                  disabled={page === data.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
                >
                  Last
                  <ChevronsRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer Information */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-8 space-y-4"
        >
          <motion.div 
            className="pt-4 border-t border-gray-200/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs text-gray-400">
              🔒 All user data is secure and protected
            </p>
          </motion.div>

          {/* Processing status */}
          <AnimatePresence>
            {processingIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full"
                />
                Processing {processingIds.size} request{processingIds.size > 1 ? 's' : ''}...
              </motion.div>
            )}
          </AnimatePresence>

          {/* Admin helper text */}
          <motion.div 
            className="pt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-emerald-50/50 border border-emerald-200/30 rounded-lg p-3 max-w-md mx-auto">
              <div className="flex items-center gap-2 justify-center mb-1">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-emerald-600 text-center">
                Review and manage user registration requests. Take action carefully as decisions affect user access.
              </p>
            </div>
          </motion.div>

          {/* Quick summary */}
          <motion.div 
            className="pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs max-w-lg mx-auto">
              {[
                { label: 'Pending', value: pendingUser.filter(u => u.status === 'pending').length, color: 'text-amber-600' },
                { label: 'Approved', value: pendingUser.filter(u => u.status === 'approved').length, color: 'text-emerald-600' },
                { label: 'Rejected', value: pendingUser.filter(u => u.status === 'rejected').length, color: 'text-red-600' },
                { label: 'Total', value: pendingUser.length, color: 'text-gray-600' }
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <div className={`text-lg font-bold ${color}`}>
                    {value}
                  </div>
                  <div className="text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};