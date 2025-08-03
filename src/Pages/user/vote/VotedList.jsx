import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useGetVotedListUserQuery } from "../../../redux/apis/UserApis";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Calendar,
  Vote,
  User,
  TrendingUp,
  Award,
  ChevronDown,
  Filter,
  Search,
  BarChart3,
  RefreshCw,
  XCircle,
  Info,
} from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
export const VotedList = () => {
  // Pagination states
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_requests: 0,
    has_next: false,
    has_prev: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const {
    data,
    refetch,
    isLoading: isRefreshing,
  } = useGetVotedListUserQuery({ currentPage, itemsPerPage });

  const [votedListData, setVotedListData] = useState([]);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };
  useEffect(() => {
    if (data && Array.isArray(data.votedList)) {
      setVotedListData(data.votedList);
    }
    if (data?.pagination) {
      setPagination(data.pagination);
    }
    window.scrollTo(0, 0);
  }, [data]);
  useEffect(() => {
    refetch()
  }, []);

  // Memoized functions for better performance
  const getTimeStatus = useCallback((startDateTime, endDateTime) => {
    const now = new Date();
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (now < start)
      return { status: "upcoming", text: "Upcoming", color: "emerald" };
    if (now > end)
      return { status: "expired", text: "Completed", color: "gray" };
    return { status: "active", text: "Active", color: "teal" };
  }, []);

  const getUserVotedCandidate = useCallback((candidates) => {
    return candidates.find((candidate) => candidate.isVoted);
  }, []);

  const getVoteStats = useCallback(
    (candidates) => {
      const totalCandidates = candidates.length;
      const votedCandidate = getUserVotedCandidate(candidates);
      return {
        totalCandidates,
        votedCandidate,
        votedCandidateIndex: candidates.findIndex((c) => c.isVoted) + 1,
      };
    },
    [getUserVotedCandidate]
  );

  const toggleCardExpansion = useCallback((voteId) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(voteId)) {
        newSet.delete(voteId);
      } else {
        newSet.add(voteId);
      }
      return newSet;
    });
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Memoized filtered and sorted data
  const filteredAndSortedData = useMemo(() => {
    return votedListData
      .filter((vote) => {
        const matchesSearch = vote.voteSubject
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const timeStatus = getTimeStatus(vote.startDateTime, vote.endDateTime);

        if (filterStatus === "all") return matchesSearch;
        if (filterStatus === "active")
          return matchesSearch && timeStatus.status === "active";
        if (filterStatus === "expired")
          return matchesSearch && timeStatus.status === "expired";

        return matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return new Date(b.startDateTime) - new Date(a.startDateTime);
          case "oldest":
            return new Date(a.startDateTime) - new Date(b.startDateTime);
          case "subject":
            return a.voteSubject.localeCompare(b.voteSubject);
          default:
            return 0;
        }
      });
  }, [votedListData, searchTerm, filterStatus, sortBy, getTimeStatus]);

  // Memoized stats
  const stats = useMemo(() => {
    const totalVotes = pagination.total_requests;
    const activeVotes = votedListData.filter(
      (vote) =>
        getTimeStatus(vote.startDateTime, vote.endDateTime).status === "active"
    ).length;
    const expiredVotes = votedListData.filter(
      (vote) =>
        getTimeStatus(vote.startDateTime, vote.endDateTime).status === "expired"
    ).length;

    return { totalVotes, activeVotes, expiredVotes };
  }, [votedListData, getTimeStatus]);

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
        transition: { duration: 0.3 },
      },
    }),
    []
  );

  const cardVariants = useMemo(
    () => ({
      initial: { opacity: 0, y: 30, scale: 0.95 },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
      },
      hover: {
        y: -4,
        boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.15)",
        transition: { duration: 0.2 },
      },
    }),
    []
  );

  const expandVariants = useMemo(
    () => ({
      collapsed: {
        height: 0,
        opacity: 0,
        transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
      },
      expanded: {
        height: "auto",
        opacity: 1,
        transition: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] },
      },
    }),
    []
  );

  // Loading state
  if (isRefreshing) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center p-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            className="text-gray-600 text-lg font-medium"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading your voting history...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Empty state
  if (!votedListData.length) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center p-4">
        <motion.div
          className="text-center max-w-md mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="text-6xl mb-6"
            variants={itemVariants}
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📊
          </motion.div>
          <motion.h2
            className="text-2xl font-bold text-gray-800 mb-4"
            variants={itemVariants}
          >
            No Voting History
          </motion.h2>
          <motion.p className="text-gray-600 mb-8" variants={itemVariants}>
            You haven't participated in any votes yet. Check back later for new
            voting opportunities.
          </motion.p>
          <motion.button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            variants={itemVariants}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl mb-4 shadow-lg"
            variants={itemVariants}
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <Vote className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1
            className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2"
            variants={itemVariants}
          >
            Your Voting History
          </motion.h1>
          <motion.p className="text-gray-600" variants={itemVariants}>
            Track your participation and voting records
          </motion.p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            {
              title: "Total Votes",
              value: stats.totalVotes,
              icon: Vote,
              gradient: "from-emerald-500 to-emerald-600",
              bg: "bg-emerald-50",
              text: "text-emerald-700",
            },
            {
              title: "Active Votes",
              value: stats.activeVotes,
              icon: TrendingUp,
              gradient: "from-teal-500 to-teal-600",
              bg: "bg-teal-50",
              text: "text-teal-700",
            },
            {
              title: "Completed",
              value: stats.expiredVotes,
              icon: Award,
              gradient: "from-cyan-500 to-cyan-600",
              bg: "bg-cyan-50",
              text: "text-cyan-700",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6"
              variants={itemVariants}
              whileHover={{
                y: -4,
                boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.15)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <motion.p
                    className={`text-3xl font-bold ${stat.text}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {stat.value}
                  </motion.p>
                </div>
                <motion.div
                  className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className={`w-6 h-6 ${stat.text}`} />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <motion.input
                type="text"
                placeholder="Search votes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                whileFocus={{ scale: 1.01 }}
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <motion.select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none transition-all duration-200 bg-gray-50/50"
                whileFocus={{ scale: 1.01 }}
              >
                <option value="all">All Votes</option>
                <option value="active">Active Votes</option>
                <option value="expired">Completed Votes</option>
              </motion.select>
            </div>

            {/* Sort */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <motion.select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none transition-all duration-200 bg-gray-50/50"
                whileFocus={{ scale: 1.01 }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="subject">By Subject</option>
              </motion.select>
            </div>
          </div>
        </motion.div>

        {/* Vote Cards */}
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedData.map((vote, index) => {
              const timeStatus = getTimeStatus(
                vote.startDateTime,
                vote.endDateTime
              );
              const voteStats = getVoteStats(vote.candidates);
              const isExpanded = expandedCards.has(vote.voteMainId);

              return (
                <motion.div
                  key={vote.voteMainId || index}
                  className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden"
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, y: -30, transition: { duration: 0.3 } }}
                  whileHover="hover"
                  layout
                >
                  {/* Card Header */}
                  <motion.div
                    onClick={() => toggleCardExpansion(vote.voteMainId)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 cursor-pointer relative overflow-hidden"
                    whileHover={{
                      background: "linear-gradient(to right, #059669, #0d9488)",
                    }}
                    whileTap={{ y: 1 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <motion.div
                            className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0"
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Vote className="w-6 h-6" />
                          </motion.div>
                          <div className="min-w-0 flex-1">
                            <h2 className="text-xl font-bold truncate">
                              {vote.voteSubject}
                            </h2>
                            <p className="text-emerald-100 text-sm">
                              Choice {voteStats.votedCandidateIndex} of{" "}
                              {voteStats.totalCandidates} options
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <motion.div
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              timeStatus.color === "teal"
                                ? "bg-emerald-100 text-emerald-700"
                                : timeStatus.color === "emerald"
                                ? "bg-cyan-100 text-cyan-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                            whileHover={{ y: -2 }}
                          >
                            <Clock className="w-4 h-4 inline mr-1" />
                            {timeStatus.text}
                          </motion.div>

                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-6 h-6" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Your Vote - Always Visible */}
                  <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </motion.div>
                      <h3 className="font-semibold text-emerald-800">
                        Your Vote
                      </h3>
                    </div>
                    <motion.div
                      className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-lg p-4"
                      whileHover={{
                        boxShadow: "0 8px 25px rgba(16, 185, 129, 0.15)",
                        y: -2,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span className="font-medium text-gray-800">
                          {voteStats.votedCandidate?.description ||
                            "No vote recorded"}
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Expandable Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        variants={expandVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="overflow-hidden"
                      >
                        <div className="p-6 space-y-6">
                          {/* Date Information */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <motion.div
                              className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200"
                              whileHover={{ y: -2 }}
                            >
                              <Calendar className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-emerald-800">
                                  Start Date
                                </p>
                                <p className="text-sm text-emerald-700">
                                  {new Date(
                                    vote.startDateTime
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </motion.div>
                            <motion.div
                              className="flex items-center gap-3 p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg border border-teal-200"
                              whileHover={{ y: -2 }}
                            >
                              <Calendar className="w-5 h-5 text-teal-600 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-teal-800">
                                  End Date
                                </p>
                                <p className="text-sm text-teal-700">
                                  {new Date(vote.endDateTime).toLocaleString()}
                                </p>
                              </div>
                            </motion.div>
                          </div>

                          {/* All Candidates */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                              All Options
                            </h3>
                            <div className="space-y-3">
                              {vote.candidates.map((candidate, n) => (
                                <motion.div
                                  key={candidate._id || n}
                                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300 ${
                                    candidate.isVoted
                                      ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50"
                                      : "border-gray-200 bg-gray-50/50"
                                  }`}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: n * 0.1 }}
                                  whileHover={{
                                    x: 4,
                                    boxShadow: candidate.isVoted
                                      ? "0 8px 25px rgba(16, 185, 129, 0.2)"
                                      : "0 4px 15px rgba(0, 0, 0, 0.1)",
                                  }}
                                >
                                  <motion.div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      candidate.isVoted
                                        ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                                        : "bg-gray-300"
                                    }`}
                                    whileHover={{
                                      rotate: candidate.isVoted ? 360 : 0,
                                    }}
                                    transition={{ duration: 0.5 }}
                                  >
                                    {candidate.isVoted ? (
                                      <CheckCircle className="w-5 h-5 text-white" />
                                    ) : (
                                      <span className="text-white font-bold text-sm">
                                        {n + 1}
                                      </span>
                                    )}
                                  </motion.div>
                                  <div className="flex-1 min-w-0">
                                    <div
                                      className={`font-medium ${
                                        candidate.isVoted
                                          ? "text-emerald-800"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      {candidate.description}
                                    </div>
                                    {candidate.isVoted && (
                                      <motion.div
                                        className="text-sm text-emerald-600 font-medium"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                      >
                                        ✓ Your Choice
                                      </motion.div>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Vote Summary */}
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-3">
                              Vote Summary
                            </h4>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              {[
                                {
                                  label: "Total Options",
                                  value: voteStats.totalCandidates,
                                },
                                {
                                  label: "Your Choice",
                                  value: `Option #${voteStats.votedCandidateIndex}`,
                                },
                                {
                                  label: "Status",
                                  value: timeStatus.text,
                                  color: "text-emerald-600",
                                },
                                {
                                  label: "Participation",
                                  value: "Voted",
                                  color: "text-teal-600",
                                },
                              ].map((item, idx) => (
                                <motion.div
                                  key={item.label}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 * idx }}
                                >
                                  <span className="text-gray-600 block mb-1">
                                    {item.label}:
                                  </span>
                                  <div
                                    className={`font-semibold ${
                                      item.color || "text-gray-800"
                                    }`}
                                  >
                                    {item.value}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* No Results */}
        <AnimatePresence>
          {filteredAndSortedData.length === 0 && votedListData.length > 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="text-4xl mb-4"
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  transition: { duration: 2, repeat: Infinity },
                }}
              >
                🔍
              </motion.div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No votes found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Refresh Button */}
        <motion.div
          className="fixed bottom-8 right-8 z-50"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-4 rounded-full shadow-lg transition-all duration-300 ${
              isRefreshing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            }`}
            whileHover={{
              y: -4,
              boxShadow: "0 12px 24px rgba(16, 185, 129, 0.4)",
            }}
            whileTap={{ y: 0 }}
            animate={isRefreshing ? { rotate: 360 } : {}}
            transition={
              isRefreshing
                ? { duration: 1, repeat: Infinity, ease: "linear" }
                : {}
            }
          >
            <RefreshCw className="w-6 h-6" />
          </motion.button>
        </motion.div>

        {/* Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 rounded-full opacity-20"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200/30 rounded-full opacity-20"
            animate={{
              x: [0, -30, 0],
              y: [0, 50, 0],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-200/20 rounded-full opacity-10"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      </div>
      {/* Server-side Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex flex-col max-w-4xl my-4 lg:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Page {pagination.current_page} of {pagination.total_pages} (
              {pagination.total_requests} total votes)
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.has_prev}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(5, pagination.total_pages) },
                (_, i) => {
                  let pageNum;
                  if (pagination.total_pages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.total_pages - 2) {
                    pageNum = pagination.total_pages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? "bg-emerald-600 text-white"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.has_next}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
