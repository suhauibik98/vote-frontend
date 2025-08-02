/* eslint-disable no-unused-vars */
import  { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetEndsVoteQuery, useGetWinnerNameMutation } from '../../../redux/apis/AdminApis';
import ResultsModal from './components/ResultsModal';
import { useCallback } from 'react';
import {ChevronLeft, ChevronRight} from "lucide-react";

// Countdown Component
const CountdownModal = ({ isOpen, onComplete, onCancel }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (!isOpen) {
      setCount(3);
      return;
    }

    if (count === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, isOpen, onComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-md w-full shadow-2xl"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <motion.div
              className="text-6xl sm:text-8xl font-bold mb-6"
              key={count}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              {count || "🎉"}
            </motion.div>
            
            <motion.p 
              className="text-gray-600 text-lg mb-6"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {count > 0 ? "Revealing results in..." : "Let's see the winners!"}
            </motion.p>

            <motion.button
              onClick={onCancel}
              className="px-6 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Results Modal Component


export const EndsVote = () => {
  const [endsVote, setEndsVote] = useState([]);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedVote, setSelectedVote] = useState(null);
  const [selectedVoteIndex, setSelectedVoteIndex] = useState(null);
  const [winners, setWinners] = useState([]);
  const [winnerNames, setWinnerNames] = useState({});
  const [getWinnerName, { isLoading: nameLoading }] = useGetWinnerNameMutation();
  
    // Pagination states
     const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_requests: 0,
        has_next: false,
        has_prev: false
      });
      const [currentPage, setCurrentPage] = useState(1);
      const [itemsPerPage, setItemsPerPage] = useState(6);
      
      const { data, refetch, isLoading } = useGetEndsVoteQuery({currentPage ,itemsPerPage });
  useEffect(() => {
    if (data) {
      setEndsVote(data.EndVote || []);
    }
     if (data?.pagination) {
      setPagination(data.pagination);
    }
    window.scrollTo(0,0)
  }, [data]);

  useEffect(() => {
    handleRefresh()
  }, []);

  const handleRefresh = async () => {
    await refetch();
  };

  const handleSeeWinner = (voteIndex, vote) => {
    setSelectedVote(vote);
    setSelectedVoteIndex(voteIndex);
    
    const maxVoteCount = Math.max(...vote.candidates.map(c => c.voteCount));
    const voteWinners = vote.candidates.filter(c => c.voteCount === maxVoteCount);
    setWinners(voteWinners);
    
    setShowCountdown(true);
  };
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
  const handleCountdownComplete = async () => {
    setShowCountdown(false);
    
    // Fetch winner names
    if (selectedVote) {
      const newWinnerNames = { ...winnerNames };
      
      for (let i = 0; i < selectedVote.candidates.length; i++) {
        const candidate = selectedVote.candidates[i];
        const key = `${selectedVoteIndex}-${i}`;
        
        if (!newWinnerNames[key]) {
          try {
            const res = await getWinnerName({ winnerId: candidate.userId }).unwrap();
            newWinnerNames[key] = res.winnerName;
          } catch (error) {
            newWinnerNames[key] = 'Error loading name';
            console.error("Failed to fetch winner name:", error);
          }
        }
      }
      
      setWinnerNames(newWinnerNames);
    }
    
    setShowResults(true);
  };
const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };
  const handleCountdownCancel = () => {
    setShowCountdown(false);
    setSelectedVote(null);
    setSelectedVoteIndex(null);
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setSelectedVote(null);
    setSelectedVoteIndex(null);
  };

  if (isLoading || nameLoading) {
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
          <p className="text-gray-600">Loading Ende Vote...</p>
        </motion.div>
      </div>
     );
   }

  return (
    <motion.div
      className="min-h-screen  bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 sm:p-6 lg:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="max-w-6xl mx-auto my-2 "
        // layout
      >
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-3xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
           Ends Vote Results
          </h1>
          
          <motion.button
            onClick={handleRefresh}
            className="hover:cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            whileHover={{ scale: 1.00, y: 0 }}
            whileTap={{ scale: 1 }}
            disabled={isLoading}
          >
            <motion.svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              // animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </motion.svg>
            Refresh
          </motion.button>
        </motion.div>

        {/* Vote Cards */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-10"
          // layout
        >
          <AnimatePresence>
            {endsVote.map((vote, voteIndex) => {
              const maxVoteCount = Math.max(...vote.candidates.map(c => c.voteCount));
              const voteWinners = vote.candidates.filter(c => c.voteCount === maxVoteCount);
              const totalVotes = vote.candidates.reduce((sum, can) => sum + can.voteCount, 0);
              const startDate = formatDateTime(vote.startDateTime)
              const endDate = formatDateTime(vote.endDateTime)
              return (
                <motion.div
                  key={voteIndex}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0}}
                  // exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.2, delay: voteIndex * 0.1 }}
                  whileHover={{ y: 0 }}
                  // layout
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600  p-6 text-white">
                    <motion.h3 
                      className="text-xl sm:text-2xl font-bold mb-2"
                      layoutId={`title-${voteIndex}`}
                    >
                      {vote.voteSubject}
                    </motion.h3>
                    {/* <div className="flex items-center gap-2">
                      <motion.span 
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          vote.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                        animate={{ 
                          scale: vote.isActive ? [1, 1.05, 1] : 1 
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: vote.isActive ? Infinity : 0 
                        }}
                      >
                        {vote.isActive ? '🟢 Active' : '🔴 Ended'}
                      </motion.span>
                    </div> */}
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Vote Stats */}
                    <motion.div 
                      className="grid grid-cols-2 gap-4 mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + voteIndex * 0.1 }}
                    >
                      <div className="bg-blue-50 p-4 rounded-2xl text-center">
                        <div className="text-2xl font-bold text-blue-600">{totalVotes}</div>
                        <div className="text-blue-500 text-sm font-medium">Total Votes</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-2xl text-center">
                        <div className="text-2xl font-bold text-purple-600">{vote.candidates.length}</div>
                        <div className="text-purple-500 text-sm font-medium">Candidates</div>
                      </div>
                    </motion.div>

                    {/* Date Info */}
                    <motion.div 
                      className="space-y-2 mb-6 text-sm text-gray-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + voteIndex * 0.1 }}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">Start:</span>
                        <span>{startDate.dateStr} {startDate.timeStr}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">End:</span>
                        <span>{endDate.dateStr} {endDate.timeStr}</span>
                      </div>
                    </motion.div>

                    {/* Preview of top candidates */}
                    <motion.div 
                      className="mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + voteIndex * 0.1 }}
                    >
                      <h4 className="font-semibold text-gray-800 mb-3">Leading Candidates</h4>
                      <div className="space-y-2">
                        {[...vote.candidates]
                          .sort((a, b) => b.voteCount - a.voteCount)
                          .slice(0, 3)
                          .map((candidate, index) => {
                            const percentage = totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : 0;
                            return (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 truncate flex-1 mr-2">
                                  {candidate.description}
                                </span>
                                {/* <span className="text-sm font-medium text-gray-800">
                                  {candidate.voteCount} ({percentage}%)
                                </span> */}
                              </div>
                            );
                          })}
                      </div>
                    </motion.div>

                    {/* See Results Button */}
                    <motion.button
                      onClick={() => handleSeeWinner(voteIndex, vote)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-2xl font-semibold shadow-lg  flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={nameLoading}
                    >
                      <motion.span
                        // animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🏆
                      </motion.span>
                      See Complete Results
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {endsVote.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="text-8xl mb-6"
              // animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🗳️
            </motion.div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No election results yet</h3>
            <p className="text-gray-500">Elections will appear here once they're completed</p>
          </motion.div>
        )}
      </motion.div>
 {/* Server-side Pagination */}
                  {pagination.total_pages > 1 && (
                    <div className="flex flex-col my-4 lg:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
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

      {/* Modals */}
      <CountdownModal
        isOpen={showCountdown}
        onComplete={handleCountdownComplete}
        onCancel={handleCountdownCancel}
      />

      <ResultsModal
        isOpen={showResults}
        onClose={handleCloseResults}
        vote={selectedVote}
        winners={winners}
        winnerNames={winnerNames}
        voteIndex={selectedVoteIndex}
      />
     
    </motion.div>
  );
};