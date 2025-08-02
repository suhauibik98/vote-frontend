/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Shield,
  ShieldCheck,
  Clock,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Building2,
  Hash,
  Settings,
  Mail,
} from "lucide-react";
import {
  useChangeUserActivationMutation,
  useEditUserMutation,
  useRequestsQuery,
} from "../../../redux/apis/AdminApis";
import { useSelector } from "react-redux";
import { PopUpUserView } from "./components/PopUpUserView";
import { ShowPopUpForDeleteUser } from "./components/ShowPopUpForDeleteUser";
import { useNavigate } from "react-router-dom";
import { PopUpUserEdit } from "./components/PopUpUserEdit";

// Memoized components for better performance
const StatusBadge = memo(({ isActive, onClick, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      {isActive ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5"></div>
          Active
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5"></div>
          Inactive
        </span>
      )}
    </motion.div>
  );
});

const RoleBadge = memo(({ isAdmin }) => {
  return isAdmin ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
      <ShieldCheck className="w-3 h-3 mr-1" />
      Admin
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
      <Shield className="w-3 h-3 mr-1" />
      User
    </span>
  );
});

const UserRow = memo(
  ({
    user,
    index,
    selectedUsers,
    loadingState,
    userAdmin,
    onSelectUser,
    onShowModal,
    onChangeActivation,
    formatDate,
    tableRowVariants,
  }) => {
    const handleSelectUser = useCallback(() => {
      onSelectUser(user._id);
    }, [onSelectUser, user._id]);

    const handleStatusClick = useCallback(() => {
      if (userAdmin.id !== user._id) {
        onChangeActivation(user._id);
      }
    }, [userAdmin.id, user._id, onChangeActivation]);

    const handleViewClick = useCallback(() => {
      onShowModal(user, "view");
    }, [onShowModal, user]);

    const handleDeleteClick = useCallback(() => {
      onShowModal(user, "delete");
    }, [onShowModal, user]);

    const handleEditClick = useCallback(() => {
      onShowModal(user, "edit");
    }, [onShowModal, user]);

    return (
      <motion.tr
        key={user._id}
        custom={index}
        variants={tableRowVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className={`transition-colors ${
          selectedUsers.includes(user._id) ? "bg-emerald-50" : ""
        }`}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <motion.input
            whileHover={{ scale: 1.1 }}
            type="checkbox"
            checked={selectedUsers.includes(user._id)}
            onChange={handleSelectUser}
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="flex-shrink-0 h-10 w-10"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            </motion.div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {user.name || "Unknown"}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Born: {formatDate(user.birth_date)}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Mail className="w-3 h-3 text-gray-400" />
            <span
              className="truncate max-w-[200px]"
              title={user.email || "N/A"}
            >
              {user.email || "N/A"}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
          <div className="flex items-center gap-1">
            <Hash className="w-3 h-3 text-gray-400" />
            {user.emp_id || "N/A"}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge
            isActive={user.isActive}
            onClick={handleStatusClick}
            isLoading={loadingState[user._id]}
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <RoleBadge isAdmin={user.isAdmin} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            {formatDate(user.createdAt)}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            {formatDate(user.lastLogin)}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex items-center space-x-1">
            <motion.button
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(59, 130, 246, 0.1)",
              }}
              whileTap={{ scale: 0.9 }}
              onClick={handleViewClick}
              className="text-blue-600 hover:text-blue-900 p-2 rounded-full transition-colors"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(34, 197, 94, 0.1)",
              }}
              onClick={handleEditClick}
              whileTap={{ scale: 0.9 }}
              className="text-emerald-600 hover:text-emerald-900 p-2 rounded-full transition-colors"
            >
              <Edit className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(239, 68, 68, 0.1)",
              }}
              onClick={handleDeleteClick}
              whileTap={{ scale: 0.9 }}
              className="text-red-600 hover:text-red-900 p-2 rounded-full transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </td>
      </motion.tr>
    );
  }
);

export const GetAllUsers = () => {
  // State for API parameters
  const { user: userAdmin } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");

  // API call with proper parameters
  const { data, refetch, isLoading, isError } = useRequestsQuery({
    status,
    page,
  });
  const [changeUserActivation] = useChangeUserActivationMutation();

  const [editUser] = useEditUserMutation()

  // Local state
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_requests: 0,
    has_next: false,
    has_prev: false,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loadingState, setLoadingState] = useState({});
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    show: false,
  });
  const [showModal, setShowModal] = useState(false);

  const [showModalDelete, setShowModalDelete] = useState(false);

  const [showModalEdit, setShowModalEdit] = useState(false);

  const [showUser, setShowModalUser] = useState({});

  // Optimized refresh function
  const refresh = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, [refetch]);

  // Initialize data on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Enhanced notification system with memoization
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

  // Update local state when data changes - optimized
  useEffect(() => {
    if (data?.requests && Array.isArray(data.requests)) {
      setUsers(data.requests);
      setPagination(
        data.pagination || {
          current_page: 1,
          total_pages: 1,
          total_requests: 0,
          has_next: false,
          has_prev: false,
        }
      );
    }
  }, [data]);

  // Update API status parameter when filter changes
  useEffect(() => {
    const newStatus = statusFilter === "all" ? "" : statusFilter;
    if (newStatus !== status) {
      setStatus(newStatus);
      setPage(1); // Reset to first page when filter changes
    }
  }, [statusFilter, status]);

  // Memoized filter and search logic
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];

    return users.filter((user) => {
      if (!user) return false;

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        user.name?.toLowerCase().includes(searchLower) ||
        user.emp_id?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower);

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "admin" && user.isAdmin) ||
        (roleFilter === "user" && !user.isAdmin);

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Memoized sort logic
  const sortedUsers = useMemo(() => {
    if (!Array.isArray(filteredUsers)) return [];

    return [...filteredUsers].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date fields
      if (sortBy === "createdAt" || sortBy === "lastLogin") {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredUsers, sortBy, sortOrder]);

  // Optimized callback functions
  const handleSelectUser = useCallback((userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedUsers((prev) => {
      if (prev.length === sortedUsers.length) {
        return [];
      } else {
        return sortedUsers.map((user) => user._id);
      }
    });
  }, [sortedUsers]);

  const handlePageChange = useCallback(
    (newPage) => {
      if (
        newPage !== page &&
        newPage >= 1 &&
        newPage <= pagination.total_pages
      ) {
        setPage(newPage);
      }
    },
    [page, pagination.total_pages]
  );

  // Memoized format date function
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Never";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  }, []);

  // Modal handlers
  const handleHideModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleHidePopUpDeleteUser = useCallback(() => {
    setShowModalDelete(false);
  }, []);

  const handleHidePopUpEditUser = useCallback(() => {
    setShowModalEdit(false);
  }, []);

  const handleShowModel = useCallback((user, type) => {
    if (type === "view") {
      setShowModal(true);
    }
    if (type === "delete") {
      setShowModalDelete(true);
    }
    if (type === "edit") {
      setShowModalEdit(true);
    }
    setShowModalUser(user);
  }, []);

  // Optimized refresh data function
  const refreshData = useCallback(async () => {
    try {
      await refetch();
      showNotification("🔄 Data refreshed successfully!", "success", 3000);
    } catch (error) {
      showNotification("❌ Failed to refresh data", "error", 4000);
      console.error("Refresh error:", error);
    }
  }, [refetch, showNotification]);

  // Optimized user activation function
  const changeUserActivationFun = useCallback(
    async (userId) => {
      if (!userId || userAdmin.id === userId) return;

      try {
        setLoadingState((prev) => ({ ...prev, [userId]: true }));
        const res = await changeUserActivation(userId);

        if (res.error) {
          throw new Error(res.error.message || "Failed to update user status");
        }

        await refreshData();
        const user = users.find((u) => u._id === userId);
        const newStatus = user?.isActive ? "deactivated" : "activated";
        showNotification(`✅ User ${newStatus} successfully!`, "success", 3500);
      } catch (error) {
        showNotification("❌ Failed to update user status", "error", 4000);
        console.error("Activation error:", error);
      } finally {
        setLoadingState((prev) => ({ ...prev, [userId]: false }));
      }
    },
    [changeUserActivation, refreshData, showNotification, users, userAdmin.id]
  );

  // Memoized animation variants
  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
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
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 },
      },
    }),
    []
  );

  const tableRowVariants = useMemo(
    () => ({
      hidden: { opacity: 0, x: -20 },
      visible: (index) => ({
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.4,
          delay: index * 0.05,
        },
      }),
      hover: {
        scale: 1.0,
        backgroundColor: "rgba(5, 150, 105, 0.05)",
        transition: { duration: 0.1 },
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

  // Memoized notification functions
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

  // Memoized statistics
  const userStats = useMemo(() => {
    if (!Array.isArray(users))
      return { total: 0, active: 0, inactive: 0, admins: 0 };

    return {
      total: users.length,
      active: users.filter((u) => u?.isActive).length,
      inactive: users.filter((u) => !u?.isActive).length,
      admins: users.filter((u) => u?.isAdmin).length,
    };
  }, [users]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading users...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, -10, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <AlertCircle className="w-8 h-8 text-red-500" />
          </motion.div>
          <p className="text-red-600 mb-4">Error loading users</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshData}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // No data state
  if (!users || users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-600 mb-6">
              There are no users to display at the moment.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshData}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
            >
              Refresh
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
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
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  All Users
                </h1>
              </motion.div>
              <p className="text-gray-600 mt-1 ml-15">
                Manage and monitor all user accounts
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.0, y: 0 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshData}
                className="inline-flex hover:cursor-pointer items-center px-4 py-2 bg-white/90 backdrop-blur-sm border border-white/20 rounded-lg text-gray-700 hover:bg-white transition-all duration-200 shadow-lg"
              >
                <motion.div
                  animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                  transition={
                    isLoading
                      ? { duration: 1, repeat: Infinity, ease: "linear" }
                      : {}
                  }
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                </motion.div>
                Refresh
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.0, y: 0 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/admin/users/create")}
                className="inline-flex hover:cursor-pointer items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </motion.button>
            </div>
          </div>

          {/* Stats Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            {[
              {
                title: "Total Users",
                value: userStats.total,
                color: "emerald",
                icon: Users,
                gradient: "from-emerald-500 to-emerald-600",
              },
              {
                title: "Active Users",
                value: userStats.active,
                color: "green",
                icon: UserCheck,
                gradient: "from-green-500 to-green-600",
              },
              {
                title: "Inactive Users",
                value: userStats.inactive,
                color: "red",
                icon: UserX,
                gradient: "from-red-500 to-red-600",
              },
              {
                title: "Admins",
                value: userStats.admins,
                color: "purple",
                icon: ShieldCheck,
                gradient: "from-purple-500 to-purple-600",
              },
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
                  scale: 1.0,
                  y: 0,
                  transition: { duration: 0.2 },
                }}
                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                      {stat.title}
                    </p>
                    <motion.p
                      className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    >
                      {stat.value}
                    </motion.p>
                  </div>
                  <motion.div
                    className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Controls */}
          <motion.div
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    placeholder="Search users by name, email, or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  <motion.div
                    animate={{ rotate: showFilters ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {selectedUsers.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete ({selectedUsers.length})
                    </motion.button>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </motion.button>
              </div>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-emerald-600" />
                        Status
                      </label>
                      <motion.select
                        whileFocus={{ scale: 1.02 }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </motion.select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        Role
                      </label>
                      <motion.select
                        whileFocus={{ scale: 1.02 }}
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                      >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </motion.select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-emerald-600" />
                        Sort By
                      </label>
                      <motion.select
                        whileFocus={{ scale: 1.02 }}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                      >
                        <option value="createdAt">Created Date</option>
                        <option value="name">Name</option>
                        <option value="email">Email</option>
                        <option value="emp_id">Employee ID</option>
                        <option value="lastLogin">Last Login</option>
                      </motion.select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <motion.input
                      whileHover={{ scale: 1.1 }}
                      type="checkbox"
                      checked={
                        selectedUsers.length === sortedUsers.length &&
                        sortedUsers.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-emerald-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-emerald-700 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-emerald-700 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-emerald-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-emerald-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-emerald-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-emerald-700 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-emerald-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedUsers.map((user, index) => (
                  <UserRow
                    key={user._id}
                    user={user}
                    index={index}
                    selectedUsers={selectedUsers}
                    loadingState={loadingState}
                    userAdmin={userAdmin}
                    onSelectUser={handleSelectUser}
                    onShowModal={handleShowModel}
                    onChangeActivation={changeUserActivationFun}
                    formatDate={formatDate}
                    tableRowVariants={tableRowVariants}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-t border-emerald-200"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {sortedUsers.length} of {pagination.total_requests}{" "}
                users
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.has_prev}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronsLeft className="w-4 h-4 mr-1" />
                  First
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={!pagination.has_prev}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </motion.button>

                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, pagination.total_pages))].map(
                    (_, index) => {
                      const pageNum =
                        Math.max(
                          1,
                          Math.min(
                            pagination.total_pages - 4,
                            pagination.current_page - 2
                          )
                        ) + index;
                      if (pageNum > pagination.total_pages) return null;

                      return (
                        <motion.button
                          key={pageNum}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            pagination.current_page === pageNum
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg transform scale-105"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </motion.button>
                      );
                    }
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    handlePageChange(parseInt(pagination.current_page) + 1)
                  }
                  disabled={!pagination.has_next}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(pagination.total_pages)}
                  disabled={!pagination.has_next}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Last
                  <ChevronsRight className="w-4 h-4 ml-1" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

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
            {Object.keys(loadingState).filter((id) => loadingState[id]).length >
              0 && (
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
                Processing user status changes...
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selection counter */}
          <AnimatePresence>
            {selectedUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""}{" "}
                selected
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
                  User Management
                </span>
              </div>
              <p className="text-xs text-emerald-600 text-center">
                Monitor user activity and manage account permissions. Click on
                status badges to toggle user activation.
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
                {
                  label: "Active",
                  value: userStats.active,
                  color: "text-emerald-600",
                },
                {
                  label: "Inactive",
                  value: userStats.inactive,
                  color: "text-red-600",
                },
                {
                  label: "Admins",
                  value: userStats.admins,
                  color: "text-purple-600",
                },
                {
                  label: "Total",
                  value: userStats.total,
                  color: "text-gray-600",
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <motion.div
                    className={`text-lg font-bold ${color}`}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: Math.random(),
                    }}
                  >
                    {value}
                  </motion.div>
                  <div className="text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <PopUpUserView
        user={showUser}
        isOpen={showModal}
        onClose={handleHideModal}
      />
      <ShowPopUpForDeleteUser
        refetch={refetch}
        showPopUp={showModalDelete}
        user={showUser}
        onClose={handleHidePopUpDeleteUser}
      />
      <PopUpUserEdit
        isOpen={showModalEdit}
        onClose={handleHidePopUpEditUser}
        user={showUser}
        onSave={editUser}
        refetch={refresh}
      />
    </div>
  );
};
