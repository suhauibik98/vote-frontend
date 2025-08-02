import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useGetUpcommingVoteQuery } from "../../../redux/apis/AdminApis";
import { 
  Clock, Calendar, Vote, CheckCircle, AlertCircle, Timer, RefreshCw, 
  User, ChevronLeft, ChevronRight, Search, Filter, Eye, Edit,
  MoreVertical, Trash2, Users, CalendarDays, Grid, List
} from "lucide-react";

export const UpcommingVote = () => {
  const [upcomingVotes, setUpcomingVotes] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_requests: 0,
    has_next: false,
    has_prev: false
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("startDateTime");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const { data, refetch, isLoading, error } = useGetUpcommingVoteQuery({
    currentPage,
    itemsPerPage
  });

  useEffect(() => {
    if (data?.comingVoteList) {
      setUpcomingVotes(data.comingVoteList || []);
    }
    if (data?.pagination) {
      setPagination(data.pagination);
    }
  }, [data]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTimeStatus = useCallback((startDateTime, endDateTime) => {
    const now = currentTime;
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (now < start) {
      const timeUntilStart = start - now;
      const days = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeUntilStart % (1000 * 60)) / 1000);
      
      return {
        status: "upcoming",
        text: days > 0 ? `Starts in ${days}d ${hours}h` : 
              hours > 0 ? `Starts in ${hours}h ${minutes}m` : 
              `Starts in ${minutes}m ${seconds}s`,
        urgent: timeUntilStart <= 3600000,
        timeObject: { days, hours, minutes, seconds }
      };
    }
    if (now > end) {
      return {
        status: "expired",
        text: "Expired",
        urgent: true,
        timeObject: null
      };
    }

    const timeUntilEnd = end - now;
    const days = Math.floor(timeUntilEnd / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeUntilEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilEnd % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeUntilEnd % (1000 * 60)) / 1000);

    return {
      status: "active",
      text: days > 0 ? `Ends in ${days}d ${hours}h` : 
            hours > 0 ? `Ends in ${hours}h ${minutes}m` : 
            `Ends in ${minutes}m ${seconds}s`,
      urgent: timeUntilEnd <= 7200000,
      timeObject: { days, hours, minutes, seconds }
    };
  }, [currentTime]);

  const formatDateTime = useCallback((dateTime) => {
    if (!dateTime) return { dateStr: 'N/A', timeStr: 'N/A' };
    
    const date = new Date(dateTime);
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return { dateStr, timeStr };
  }, []);

  // Client-side filtering for search and status (since server handles pagination)
  const filteredVotes = useMemo(() => {
    let filtered = upcomingVotes.filter(vote => {
      const matchesSearch = vote.voteSubject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vote.createdBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (statusFilter === "all") return matchesSearch;
      
      const timeStatus = getTimeStatus(vote.startDateTime, vote.endDateTime);
      return matchesSearch && timeStatus.status === statusFilter;
    });

    // Client-side sorting
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === "startDateTime" || sortBy === "endDateTime") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [upcomingVotes, searchTerm, statusFilter, sortBy, sortOrder, getTimeStatus]);

  const getStatusStats = useMemo(() => {
    const stats = { upcoming: 0, active: 0, expired: 0 };
    upcomingVotes.forEach(vote => {
      const status = getTimeStatus(vote.startDateTime, vote.endDateTime).status;
      stats[status]++;
    });
    return stats;
  }, [upcomingVotes, getTimeStatus]);

  // Handle pagination changes
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading upcoming votes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>Error loading upcoming votes</p>
          <button onClick={refreshData} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl py-3 font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Upcoming Votes
              </h1>
              <p className="text-gray-600 mt-2">Manage and monitor upcoming voting sessions</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border-0">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
              
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Vote className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Votes</p>
                  <p className="text-2xl font-bold text-gray-900">{pagination.total_requests}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Timer className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-cyan-600">{getStatusStats.upcoming}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-emerald-600">{getStatusStats.active}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-red-600">{getStatusStats.expired}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by subject or creator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
              
              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="startDateTime-asc">Start Date (Earliest)</option>
                <option value="startDateTime-desc">Start Date (Latest)</option>
                <option value="endDateTime-asc">End Date (Earliest)</option>
                <option value="endDateTime-desc">End Date (Latest)</option>
                <option value="voteSubject-asc">Subject (A-Z)</option>
                <option value="voteSubject-desc">Subject (Z-A)</option>
              </select>
              
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredVotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🗳️</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              {searchTerm || statusFilter !== "all" ? "No votes match your filters" : "No Upcoming Votes"}
            </h2>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "There are no upcoming voting sessions at the moment."}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Vote Cards/List */}
            <div className={`${
              viewMode === "grid" 
                ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" 
                : "space-y-4"
            } mb-8`}>
              {filteredVotes.map((vote, index) => {
                const timeStatus = getTimeStatus(vote.startDateTime, vote.endDateTime);
                const startTime = formatDateTime(vote.startDateTime);
                const endTime = formatDateTime(vote.endDateTime);

                if (viewMode === "list") {
                  return (
                    <div key={vote._id || index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${
                              timeStatus.status === "upcoming" ? "bg-cyan-100" :
                              timeStatus.status === "active" ? "bg-emerald-100" : "bg-red-100"
                            }`}>
                              {timeStatus.status === "upcoming" ? (
                                <Timer className={`w-5 h-5 ${timeStatus.status === "upcoming" ? "text-cyan-600" : timeStatus.status === "active" ? "text-emerald-600" : "text-red-600"}`} />
                              ) : timeStatus.status === "active" ? (
                                <Vote className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{vote.voteSubject}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {vote.createdBy?.name || "Unknown"}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {vote.candidates.length} options
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Start</p>
                            <p className="text-sm font-medium">{startTime.dateStr}</p>
                            <p className="text-xs text-gray-600">{startTime.timeStr}</p>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">End</p>
                            <p className="text-sm font-medium">{endTime.dateStr}</p>
                            <p className="text-xs text-gray-600">{endTime.timeStr}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              timeStatus.status === "upcoming" ? "bg-cyan-100 text-cyan-700" :
                              timeStatus.status === "active" ? "bg-emerald-100 text-emerald-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {timeStatus.text}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Grid view
                return (
                  <div key={vote._id || index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Card Header */}
                    <div className={`p-4 ${
                      timeStatus.status === "upcoming" ? "bg-gradient-to-r from-teal-600 to-cyan-600" :
                      timeStatus.status === "active" ? "bg-gradient-to-r from-emerald-600 to-teal-600" :
                      "bg-gradient-to-r from-gray-600 to-gray-700"
                    } text-white`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {timeStatus.status === "upcoming" ? (
                            <Timer className="w-5 h-5" />
                          ) : timeStatus.status === "active" ? (
                            <Vote className="w-5 h-5" />
                          ) : (
                            <AlertCircle className="w-5 h-5" />
                          )}
                          <span className="text-sm font-medium opacity-90">
                            {timeStatus.status === "upcoming" ? "Upcoming" : timeStatus.status === "active" ? "Active" : "Expired"}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{vote.voteSubject}</h3>
                      
                      <div className="flex items-center justify-between">
                        <span className="bg-white/20 px-2 py-1 rounded text-sm">
                          {timeStatus.text}
                        </span>
                        <div className="text-right text-sm opacity-90">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {vote.candidates.length}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Created by: {vote.createdBy?.name || "Unknown"}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <CalendarDays className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                          <p className="text-xs text-emerald-600 mb-1">Start</p>
                          <p className="text-sm font-medium text-emerald-800">{startTime.dateStr}</p>
                          <p className="text-xs text-emerald-600">{startTime.timeStr}</p>
                        </div>
                        
                        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                          <CalendarDays className="w-4 h-4 text-red-600 mx-auto mb-1" />
                          <p className="text-xs text-red-600 mb-1">End</p>
                          <p className="text-sm font-medium text-red-800">{endTime.dateStr}</p>
                          <p className="text-xs text-red-600">{endTime.timeStr}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Vote className="w-4 h-4" />
                          Voting Options ({vote.candidates.length})
                        </p>
                        <div className="max-h-24 overflow-y-auto">
                          {vote.candidates.slice(0, 3).map((candidate, i) => (
                            <div key={candidate._id || i} className="text-xs text-gray-600 p-2 bg-gray-50 rounded mb-1">
                              {candidate.description}
                            </div>
                          ))}
                          {vote.candidates.length > 3 && (
                            <p className="text-xs text-gray-500 italic">
                              +{vote.candidates.length - 3} more options
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Server-side Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Items per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value={6}>6</option>
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={48}>48</option>
                    </select>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Page {pagination.current_page} of {pagination.total_pages} ({pagination.total_requests} total votes)
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
                    {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
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
                    })}
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
          </>
        )}
      </div>
    </div>
  );
};