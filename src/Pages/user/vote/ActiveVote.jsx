/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
    useGetVotedListUserQuery,
  useGetVoteMainActiveQuery,
  useUserVoteMutation,
} from "../../../redux/apis/UserApis";
import { Clock, Calendar, Vote, CheckCircle, AlertCircle, Timer, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ActiveVote = () => {
  const { data, refetch } = useGetVoteMainActiveQuery();

  const {data:votedListData , refetch:refetchVotedListUser} = useGetVotedListUserQuery()
  
  const [activeVotes, setActiveVotes] = useState([]);
  
  const [userVote, { isLoading: isVoting }] = useUserVoteMutation();
  
  const [votingStates, setVotingStates] = useState({});
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (data?.voteMain) {
      setActiveVotes(data.voteMain || []);
    }
    refetchVotedListUser()
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
      await refetchVotedListUser();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check if user has already voted for this voteMainId
  const hasUserVoted = (voteMainId) => {
    if (!votedListData?.votedList) return false;
    return votedListData.votedList.some(vote => vote.voteMainId === voteMainId);
  };

  // Get user's voted candidate for this vote
  const getUserVotedCandidate = (voteMainId) => {
    if (!votedListData?.votedList) return null;
    
    const votedItem = votedListData.votedList.find(vote => vote.voteMainId === voteMainId);
    if (!votedItem || !votedItem.candidates) return null;
    
    // Find the candidate that was voted for (isVoted: true)
    const votedCandidate = votedItem.candidates.find(candidate => candidate.isVoted === true);
    return votedCandidate || null;
  };

  const handleCandidateSelect = (voteId, candidateId) => {
    // Don't allow selection if user has already voted
    if (hasUserVoted(voteId)) return;
    
    setSelectedCandidates((prev) => ({
      ...prev,
      [voteId]: candidateId,
    }));
  };

  const handleSubmit = async (voteId) => {
    // Don't allow submission if user has already voted
    if (hasUserVoted(voteId)) return;
    
    const selectedCandidate = selectedCandidates[voteId];
    if (!selectedCandidate) return;

    setVotingStates((prev) => ({ ...prev, [voteId]: "voting" }));

    try {
      const res = await userVote({
        voteMainId: voteId,
        candidateId: selectedCandidate,
      }).unwrap();
      
      console.log(res);
      setVotingStates((prev) => ({ ...prev, [voteId]: "success" }));

      // Refresh the voted list data to update UI
      await refetchVotedListUser();
      await refetch();

      // Clear the selected candidate for this vote
      setSelectedCandidates((prev) => {
        const newState = { ...prev };
        delete newState[voteId];
        return newState;
      });

      // Clear success state after 3 seconds
      setTimeout(() => {
        setVotingStates((prev) => {
          const newState = { ...prev };
          delete newState[voteId];
          return newState;
        });
      }, 3000);
    } catch (err) {
      console.log(err);
      setVotingStates((prev) => ({ ...prev, [voteId]: "error" }));

      // Clear error state after 3 seconds
      setTimeout(() => {
        setVotingStates((prev) => {
          const newState = { ...prev };
          delete newState[voteId];
          return newState;
        });
      }, 3000);
    }
  };

  const getTimeRemaining = (endDateTime) => {
    const now = currentTime;
    const end = new Date(endDateTime);
    const diff = end - now;

    if (diff <= 0) return { text: "Expired", urgent: true, seconds: 0 };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return { 
      text: `${days}d ${hours}h ${minutes}m ${seconds}s`, 
      urgent: false, 
      seconds,
      timeObject: { days, hours, minutes, seconds }
    };
    if (hours > 0) return { 
      text: `${hours}h ${minutes}m ${seconds}s`, 
      urgent: hours < 2, 
      seconds,
      timeObject: { days: 0, hours, minutes, seconds }
    };
    return { 
      text: `${minutes}m ${seconds}s`, 
      urgent: true, 
      seconds,
      timeObject: { days: 0, hours: 0, minutes, seconds }
    };
  };

  const formatDateTime = (dateTime) => {
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
  };

  if (!activeVotes.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="text-6xl mb-4 animate-bounce">🗳️</div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              No Active Votes
            </h2>
            <p className="text-gray-500 mb-6">
              There are no voting sessions available at the moment.
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Active Votes
            </h1>
            <p className="text-gray-600">
              Cast your votes for the following polls
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

        {/* <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:from-emerald-700 hover:to-teal-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 mb-6 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button> */}
        
        {/* Vote Cards */}
        <div className="space-y-6">
          {activeVotes.map((item, index) => {
            const timeRemaining = getTimeRemaining(item.endDateTime);
            const currentVotingState = votingStates[item._id];
            const selectedCandidate = selectedCandidates[item._id];
            const alreadyVoted = hasUserVoted(item._id);
            const userVotedCandidate = getUserVotedCandidate(item._id);
            const isFormDisabled = alreadyVoted || currentVotingState === "voting";
            const startTime = formatDateTime(item.startDateTime);
            const endTime = formatDateTime(item.endDateTime);
            const voteDate = formatDateTime(userVotedCandidate?.voteDate);
            
            console.log('User voted candidate for vote:', item._id, userVotedCandidate);

            return (
              <div
                key={item._id || index}
                className={`bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 ${
                  alreadyVoted ? 'ring-2 ring-emerald-200' : ''
                }`}
              >
                {/* Card Header */}
                <div className={`bg-gradient-to-r text-white p-6 ${
                  alreadyVoted 
                    ? 'from-emerald-500 to-teal-600' 
                    : 'from-emerald-600 to-teal-600'
                }`}>
                  <div className="flex flex-col gap-4">
                    {/* Title and Status */}
                    <div className="flex items-center gap-3">
                      {alreadyVoted ? (
                        <CheckCircle className="w-8 h-8" />
                      ) : (
                        <Vote className="w-8 h-8" />
                      )}
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold">{item.voteSubject}</h2>
                        {alreadyVoted && (
                          <p className="text-emerald-100 text-sm mt-1">
                            ✓ You have already voted in this poll
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Time Remaining Badge */}
                    <div className="flex justify-between items-center">
                      <div
                        className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                          timeRemaining.urgent
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-green-100 text-green-700 border border-green-200"
                        }`}
                      >
                        <Timer className="w-4 h-4" />
                        {timeRemaining.text}
                      </div>
                    </div>

                    {/* Live Countdown Display */}
                    {timeRemaining.timeObject && !timeRemaining.urgent && (
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'Days', value: timeRemaining.timeObject.days },
                          { label: 'Hours', value: timeRemaining.timeObject.hours },
                          { label: 'Minutes', value: timeRemaining.timeObject.minutes },
                          { label: 'Seconds', value: timeRemaining.timeObject.seconds }
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

                {/* Your Vote Display (if already voted) */}
                {alreadyVoted && userVotedCandidate && (
                  <div className="p-6 bg-emerald-50 border-b border-emerald-200">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-semibold text-emerald-800">Your Vote</h3>
                      {voteDate?.dateStr !== 'N/A' && (
                        <span className="text-sm font-medium text-emerald-700">
                          {voteDate.dateStr} - {voteDate.timeStr}
                        </span>
                      )}
                    </div>
                    <div className="bg-white border border-emerald-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-800">
                          {userVotedCandidate.description}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Content */}
                <div className="p-6">
                  {/* Enhanced Date Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium text-emerald-800">Start</p>
                          <p className="text-xs text-emerald-600">Voting began</p>
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
                      {alreadyVoted ? 'All candidates:' : 'Choose your candidate:'}
                    </h3>

                    <div className="space-y-3">
                      {item.candidates.map((candidate, n) => {
                        const isUserChoice = alreadyVoted && userVotedCandidate && userVotedCandidate._id === candidate._id;
                        
                        return (
                          <div
                            key={candidate._id || n}
                            onClick={() => !isFormDisabled && handleCandidateSelect(item._id, candidate._id)}
                            className={`flex items-center gap-4 p-4 border-2 rounded-xl transition-all duration-200 ${
                              isUserChoice
                                ? 'border-emerald-500 bg-emerald-50'
                                : selectedCandidate === candidate._id && !alreadyVoted
                                ? "border-emerald-500 bg-emerald-50"
                                : alreadyVoted
                                ? "border-gray-200 bg-gray-50 opacity-60"
                                : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                            } ${isFormDisabled && !isUserChoice ? 'cursor-not-allowed' : ''}`}
                          >
                            <div className="relative">
                              {alreadyVoted ? (
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isUserChoice ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'
                                }`}>
                                  {isUserChoice && <CheckCircle className="w-3 h-3 text-white" />}
                                </div>
                              ) : (
                                <input
                                  type="radio"
                                  name={`candidate-${item._id}`}
                                  value={candidate._id}
                                  checked={selectedCandidate === candidate._id}
                                  onChange={() => handleCandidateSelect(item._id, candidate._id)}
                                  disabled={isFormDisabled}
                                  className="w-5 h-5 text-emerald-600 border-gray-300 focus:ring-emerald-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <div
                                className={`font-medium transition-colors ${
                                  isUserChoice
                                    ? "text-emerald-800"
                                    : selectedCandidate === candidate._id && !alreadyVoted
                                    ? "text-emerald-800"
                                    : alreadyVoted
                                    ? "text-gray-500"
                                    : "text-gray-800"
                                }`}
                              >
                                {candidate.description}
                                {isUserChoice && (
                                  <span className="ml-2 text-emerald-600 text-sm font-semibold">
                                    ✓ Your Choice
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Button */}
                  {!alreadyVoted && (
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => handleSubmit(item._id)}
                        disabled={
                          !selectedCandidate || currentVotingState === "voting" || isFormDisabled
                        }
                        className={`px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 flex items-center gap-2 min-w-[140px] justify-center ${
                          !selectedCandidate || currentVotingState === "voting" || isFormDisabled
                            ? "bg-gray-400 cursor-not-allowed"
                            : currentVotingState === "success"
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : currentVotingState === "error"
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transform hover:scale-105"
                        }`}
                      >
                        {currentVotingState === "voting" && (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {currentVotingState === "success" && (
                          <CheckCircle className="w-5 h-5" />
                        )}
                        {currentVotingState === "error" && (
                          <AlertCircle className="w-5 h-5" />
                        )}

                        <span>
                          {currentVotingState === "voting"
                            ? "Voting..."
                            : currentVotingState === "success"
                            ? "Voted!"
                            : currentVotingState === "error"
                            ? "Try Again"
                            : "VOTE"}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Already Voted Message */}
                  {alreadyVoted && (
                    <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-emerald-800">
                          Vote Already Submitted
                        </p>
                        <p className="text-sm text-emerald-600">
                          You have successfully participated in this vote.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status Messages */}
                  {currentVotingState === "success" && !alreadyVoted && (
                    <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-emerald-800">
                          Vote Submitted Successfully!
                        </p>
                        <p className="text-sm text-emerald-600">
                          Your vote has been recorded.
                        </p>
                      </div>
                    </div>
                  )}
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
                  {currentVotingState === "error" && !alreadyVoted && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-red-800">
                          Error Submitting Vote
                        </p>
                        <p className="text-sm text-red-600">
                          Please try again or contact support.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};