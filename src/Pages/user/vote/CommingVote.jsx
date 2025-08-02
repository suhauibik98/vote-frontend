/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import { useGetComminVoteQuery } from "../../../redux/apis/UserApis";
import { Clock, Calendar, Vote, CheckCircle, AlertCircle, Timer, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const CommingVote = () => {
  const { data, refetch } = useGetComminVoteQuery();
  
  const [comingVotes, setComingVotes] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (data?.comingVoteList) {
      setComingVotes(data.comingVoteList || []);
    }
  }, [data]);

  // Update current time every second for real-time countdown
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
        text: days > 0 ? `Starts in ${days}d ${hours}h ${minutes}m ${seconds}s` : 
              hours > 0 ? `Starts in ${hours}h ${minutes}m ${seconds}s` : 
              `Starts in ${minutes}m ${seconds}s`,
        urgent: timeUntilStart <= 3600000, // 1 hour
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
      text: days > 0 ? `${days}d ${hours}h ${minutes}m ${seconds}s` : 
            hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : 
            `${minutes}m ${seconds}s`,
      urgent: timeUntilEnd <= 7200000, // 2 hours
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

  if (!comingVotes.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="text-6xl mb-4 animate-bounce">🗳️</div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              No Upcoming Votes
            </h2>
            <p className="text-gray-500 mb-6">
              There are no upcoming voting sessions at the moment.
            </p>
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:from-emerald-700 hover:to-teal-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-4xl py-2 font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Upcoming Votes
            </h1>
            <p className="text-gray-600">
              Get ready for the following voting sessions
            </p>
            
            {/* Current Time Display */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-emerald-200">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">
                Current Time: {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })}
              </span>
            </div>
          </div>
        </div>
        
        {/* Vote Cards */}
        <div className="space-y-6">
          {comingVotes.map((item, index) => {
            const timeStatus = getTimeStatus(item.startDateTime, item.endDateTime);
            const startTime = formatDateTime(item.startDateTime);
            const endTime = formatDateTime(item.endDateTime);

            return (
              <div
                key={item._id || index}
                className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Card Header */}
                <div className={`bg-gradient-to-r text-white p-6 ${
                  timeStatus.status === "upcoming" 
                    ? 'from-teal-600 to-cyan-600' 
                    : timeStatus.status === "active"
                    ? 'from-emerald-600 to-teal-600'
                    : 'from-gray-600 to-gray-700'
                }`}>
                  <div className="flex flex-col gap-4">
                    {/* Title and Status */}
                    <div className="flex items-center gap-3">
                      {timeStatus.status === "upcoming" ? (
                        <Timer className="w-8 h-8" />
                      ) : timeStatus.status === "active" ? (
                        <Vote className="w-8 h-8" />
                      ) : (
                        <AlertCircle className="w-8 h-8" />
                      )}
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold">{item.voteSubject}</h2>
                        <p className="text-white/80 text-sm mt-1">
                          {timeStatus.status === "upcoming" && "Vote will be available soon"}
                          {timeStatus.status === "active" && "Vote is now active!"}
                          {timeStatus.status === "expired" && "Voting period has ended"}
                        </p>
                      </div>
                    </div>

                    {/* Time Status Badge */}
                    <div className="flex justify-between items-center">
                      <div
                        className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                          timeStatus.urgent
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : timeStatus.status === "upcoming"
                            ? "bg-cyan-100 text-cyan-700 border border-cyan-200"
                            : "bg-green-100 text-green-700 border border-green-200"
                        }`}
                      >
                        <Timer className="w-4 h-4" />
                        {timeStatus.text}
                      </div>
                    </div>

                    {/* Live Countdown Display */}
                    {timeStatus.timeObject && (
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'Days', value: timeStatus.timeObject.days },
                          { label: 'Hours', value: timeStatus.timeObject.hours },
                          { label: 'Minutes', value: timeStatus.timeObject.minutes },
                          { label: 'Seconds', value: timeStatus.timeObject.seconds }
                        ].map((time, idx) => (
                          <div key={idx} className="text-center">
                            <div className={`bg-white/20 backdrop-blur-sm rounded-lg p-2 mb-1 ${
                              idx === 3 ? 'animate-pulse' : ''
                            }`}>
                              <div className="text-lg font-bold">
                                {String(time.value).padStart(2, '0')}
                              </div>
                            </div>
                            <div className="text-xs opacity-90">{time.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Enhanced Date Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium text-emerald-800">Start</p>
                          <p className="text-xs text-emerald-600">Voting begins</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-800">{startTime.dateStr}</p>
                        <p className="text-sm text-emerald-600">{startTime.timeStr}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-red-800">End</p>
                          <p className="text-xs text-red-600">Voting ends</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-800">{endTime.dateStr}</p>
                        <p className="text-sm text-red-600">{endTime.timeStr}</p>
                      </div>
                    </div>
                  </div>

                  {/* Candidates Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Vote className="w-5 h-5 text-emerald-600" />
                      Available Options ({item.candidates.length}):
                    </h3>

                    <div className="space-y-3">
                      {item.candidates.map((candidate, n) => (
                        <div
                          key={candidate._id || n}
                          className="flex items-center gap-4 p-4 border-2 border-gray-200 bg-gray-50 rounded-xl opacity-75"
                        >
                          <div className="relative">
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white">
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-600">
                              {candidate.description}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            Option {n + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Message */}
                  <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                    timeStatus.status === "upcoming"
                      ? "bg-cyan-50 border-cyan-200"
                      : timeStatus.status === "active"
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-gray-50 border-gray-200"
                  }`}>
                    {timeStatus.status === "upcoming" ? (
                      <Timer className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                    ) : timeStatus.status === "active" ? (
                      <Vote className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        timeStatus.status === "upcoming"
                          ? "text-cyan-800"
                          : timeStatus.status === "active"
                          ? "text-emerald-800"
                          : "text-gray-800"
                      }`}>
                        {timeStatus.status === "upcoming" && "Vote Not Yet Available"}
                        {timeStatus.status === "active" && "Vote is Now Active"}
                        {timeStatus.status === "expired" && "Voting Period Ended"}
                      </p>
                      <p className={`text-sm ${
                        timeStatus.status === "upcoming"
                          ? "text-cyan-600"
                          : timeStatus.status === "active"
                          ? "text-emerald-600"
                          : "text-gray-600"
                      }`}>
                        {timeStatus.status === "upcoming" && "You can vote once the voting period begins."}
                        {timeStatus.status === "active" && "Go to Active Votes to participate now!"}
                        {timeStatus.status === "expired" && "This voting session has concluded."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Refresh Button */}
        <motion.div
          className="fixed bottom-8 right-8 z-50"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.button
            onClick={refreshData}
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
      </div>
    </div>
  );
};