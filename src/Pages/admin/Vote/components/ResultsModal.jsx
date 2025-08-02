/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ResultsModal = React.memo(({ 
  isOpen, 
  onClose, 
  vote, 
  winners = [], 
  winnerNames = {}, 
  voteIndex 
}) => {
  const [showVoterNames, setShowVoterNames] = useState(false);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(null);

  // Memoized calculations for better performance
  const totalVotes = useMemo(() => 
    vote?.candidates?.reduce((sum, candidate) => sum + candidate.voteCount, 0) || 0,
    [vote?.candidates]
  );

  const sortedCandidates = useMemo(() => 
    vote?.candidates ? [...vote.candidates].sort((a, b) => b.voteCount - a.voteCount) : [],
    [vote?.candidates]
  );

  const winnersSet = useMemo(() => 
    new Set(winners.map(w => w.description)),
    [winners]
  );

  // Memoized helper functions
  const getWinnerName = useCallback((candidateIndex) => {
    const key = `${voteIndex}-${candidateIndex}`;
    return winnerNames[key] || 'Loading...';
  }, [voteIndex, winnerNames]);

  const calculatePercentage = useCallback((voteCount) => 
    totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : '0',
    [totalVotes]
  );

  const toggleVoterNames = useCallback((candidateIndex) => {
    setSelectedCandidateIndex(
      selectedCandidateIndex === candidateIndex ? null : candidateIndex
    );
  }, [selectedCandidateIndex]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Animation variants for better performance
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        duration: 0.5,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (!vote) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-6 sm:p-8">
              <div className="flex justify-between items-start">
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🏆
                    </motion.span>
                    Vote Results
                  </h2>
                  <p className="text-white/90 text-lg sm:text-xl font-medium">
                    {vote.voteSubject}
                  </p>
                  <div className="mt-2 text-white/80 text-sm">
                    {vote.isActive ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        Live Voting
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        Voting Completed
                      </span>
                    )}
                  </div>
                </motion.div>
                <motion.button
                  onClick={onClose}
                  className="text-white/80 hover:text-white p-3 rounded-full hover:bg-white/20 transition-all duration-200"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Enhanced Content */}
            <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto">
              {/* Enhanced Stats Grid */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                variants={itemVariants}
              >
                <motion.div 
                  className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200"
                  whileHover={{ scale: 1.00, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-blue-600 font-semibold text-sm mb-1">Total Votes</div>
                  <div className="text-3xl font-bold text-blue-800">{totalVotes.toLocaleString()}</div>
                </motion.div>
                
                <motion.div 
                  className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl border border-green-200"
                  whileHover={{ scale: 1.00, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-green-600 font-semibold text-sm mb-1">Winners</div>
                  <div className="text-3xl font-bold text-green-800">{winners.length}</div>
                </motion.div>
                
                <motion.div 
                  className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl border border-purple-200"
                  whileHover={{ scale: 1.00, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-purple-600 font-semibold text-sm mb-1">Candidates</div>
                  <div className="text-3xl font-bold text-purple-800">{vote.candidates?.length || 0}</div>
                </motion.div>
                
                <motion.div 
                  className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-2xl border border-orange-200"
                  whileHover={{ scale: 1.00, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-orange-600 font-semibold text-sm mb-1">Participation</div>
                  <div className="text-3xl font-bold text-orange-800">
                    {totalVotes > 0 ? '100%' : '0%'}
                  </div>
                </motion.div>
              </motion.div>

              {/* Enhanced Winners Section */}
              {winners.length > 0 && (
                <motion.div 
                  className="mb-8"
                  variants={itemVariants}
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <span className="text-3xl">🏆</span>
                    Champions
                  </h3>
                  <div className="grid gap-4">
                    {winners.map((winner, index) => {
                      const candidateIndex = vote.candidates.findIndex(c => c.description === winner.description);
                      const percentage = calculatePercentage(winner.voteCount);
                      
                      return (
                        <motion.div
                          key={`winner-${index}`}
                          className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-300 p-6 rounded-2xl shadow-lg"
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.01, y: -2 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-bold text-xl text-gray-800 mb-2">
                                {getWinnerName(candidateIndex)}
                              </div>
                              <div className="text-gray-600 mb-3 text-lg">{winner.description}</div>
                              <div className="flex items-center gap-6">
                                <span className="text-3xl font-bold text-amber-600">
                                  {winner.voteCount.toLocaleString()} votes
                                </span>
                                <span className="text-amber-700 font-bold text-xl">
                                  {percentage}%
                                </span>
                              </div>
                            </div>
                            <motion.div 
                              className="text-5xl ml-4"
                              animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                              }}
                              transition={{ 
                                duration: 2, 
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                            >
                              🏆
                            </motion.div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Enhanced All Candidates Section */}
              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">All Results</h3>
                  <motion.button
                    onClick={() => setShowVoterNames(!showVoterNames)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-400 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200"
                    whileHover={{ scale: 1.0 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showVoterNames ? 'Hide Voters' : 'Show Voters'}
                  </motion.button>
                </div>
                
                <div className="grid gap-4">
                  {sortedCandidates.map((candidate, index) => {
                    const candidateIndex = vote.candidates.findIndex(c => c.description === candidate.description);
                    const percentage = calculatePercentage(candidate.voteCount);
                    const isWinner = winnersSet.has(candidate.description);
                    const showVoters = showVoterNames || selectedCandidateIndex === candidateIndex;
                    
                    return (
                      <motion.div
                        key={`candidate-${candidateIndex}`}
                        className={`p-5 rounded-2xl border-2 transition-all duration-200 ${
                          isWinner 
                            ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300 shadow-md' 
                            : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 hover:border-gray-300'
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, y: -1 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-bold text-lg text-gray-800">
                                #{index + 1} {getWinnerName(candidateIndex)}
                              </span>
                              {isWinner && (
                                <motion.span 
                                  className="text-2xl"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  🏆
                                </motion.span>
                              )}
                            </div>
                            <div className="text-gray-600 mb-2">{candidate.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-xl text-gray-800">
                              {candidate.voteCount.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500 font-medium">{percentage}%</div>
                          </div>
                        </div>
                        
                        {/* Enhanced Progress bar */}
                        <div className="mb-4 bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                          <motion.div
                            className={`h-full rounded-full ${
                              isWinner 
                                ? 'bg-gradient-to-r from-amber-400 to-yellow-500' 
                                : 'bg-gradient-to-r from-blue-400 to-blue-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1.5, delay: index * 0.05, ease: "easeOut" }}
                          />
                        </div>

                        {/* Enhanced Voter Names Section */}
                        {candidate.votes && candidate.votes.length > 0 && (
                          <div>
                            {!showVoterNames && (
                              <motion.button
                                onClick={() => toggleVoterNames(candidateIndex)}
                                className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors duration-200"
                                whileHover={{ scale: 1.0 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {selectedCandidateIndex === candidateIndex ? 'Hide voters' : `Show ${candidate.votes.length} voters`}
                              </motion.button>
                            )}
                            
                            <AnimatePresence>
                              {showVoters && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="my-3 flex flex-wrap gap-2"
                                >
                                  {candidate.votes.map((vote, voteIndex) => (
                                    <motion.span
                                      key={`vote-${candidateIndex}-${voteIndex}`}
                                      className="inline-flex items-center my-2 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-full text-sm font-medium text-green-800"
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: voteIndex * 0.05 }}
                                      whileHover={{ scale: 1.0 }}
                                    >
                                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                      {vote.userId?.name || 'Anonymous'}
                                    </motion.span>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

ResultsModal.displayName = 'ResultsModal';

export default ResultsModal;