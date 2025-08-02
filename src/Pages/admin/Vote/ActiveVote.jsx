/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetAllActiveVoteQuery } from '../../../redux/apis/AdminApis';
import { Clock, Calendar, Timer } from 'lucide-react';

export const ActiveVote = () => {
  const { data, isLoading, error , refetch } = useGetAllActiveVoteQuery();
  const [activeVotes, setActiveVotes] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (data?.voteMain) {
      setActiveVotes(data.voteMain || []);
    }
  }, [data]);
  useEffect(() => {
    handleRefresh()
  }, []);

  // Update current time every second for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

const handleRefresh =async()=>{
  await refetch()
}

  const getTimeRemaining = (endDateTime) => {
    const now = currentTime;
    const end = new Date(endDateTime);
    const diff = end - now;
    
    if (diff <= 0) return { text: 'Expired', urgent: true, seconds: 0 };
    
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -8,
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

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
          <p className="text-gray-600">Loading Active Vote...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="text-red-600 text-center p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Error loading active votes. Please try again.
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 py-4 px-2 sm:px-4 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="max-w-7xl mx-auto" layout>
        <motion.div
                 className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6, delay: 0.2 }}
               >
                 <div className="flex flex-col">
                   <h1 className="text-3xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Active Votes 
                   </h1>
                   <div className="flex items-center gap-2 mt-2 text-gray-600">
                     <Clock className="w-4 h-4" />
                     <span className="text-sm font-medium">
                       Current Time: {currentTime.toLocaleTimeString('en-US', {
                         hour: '2-digit',
                         minute: '2-digit',
                         second: '2-digit',
                         hour12: true
                       })}
                     </span>
                   </div>
                 </div>
                 
                 <motion.button
                   onClick={handleRefresh}
                   className="hover:cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                   whileHover={{ scale: 1.00, y: 0 }}
                   whileTap={{ scale: 0.95 }}
                   disabled={isLoading}
                 >
                   <motion.svg 
                     className="w-5 h-5" 
                     fill="none" 
                     stroke="currentColor" 
                     viewBox="0 0 24 24"
                     animate={{ rotate: isLoading ? 360 : 0 }}
                     transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
                   >
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                   </motion.svg>
                   Refresh
                 </motion.button>
               </motion.div>

        <AnimatePresence mode="wait">
          {activeVotes.length === 0 ? (
            <motion.div 
              className="text-center text-gray-500 py-12"
              key="no-votes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="text-8xl mb-6"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🗳️
              </motion.div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No active votes at the moment</h3>
              <p className="text-gray-500">New voting sessions will appear here when they become available</p>
            </motion.div>
          ) : (
            <motion.div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {activeVotes.map((vote, index) => {
                  const timeRemaining = getTimeRemaining(vote.endDateTime);
                  const startTime = formatDateTime(vote.startDateTime);
                  const endTime = formatDateTime(vote.endDateTime);
                  
                  return (
                    <motion.div
                      key={vote._id || index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
                      className="relative bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden"
                      layout
                    >
                      {/* Background gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-emerald-500/5" />

                      {/* Content */}
                      <div className="relative z-10">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
                          <motion.div 
                            className="flex flex-col gap-4"
                            layout
                          >
                            <motion.h2 
                              className="text-xl sm:text-2xl font-bold leading-tight"
                              layoutId={`title-${vote._id}`}
                            >
                              {vote.voteSubject}
                            </motion.h2>
                            
                            {/* Time Remaining Badge */}
                            <motion.div 
                              className={`self-start px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                                timeRemaining.urgent 
                                  ? 'bg-red-100 text-red-700 border border-red-200' 
                                  : 'bg-green-100 text-green-700 border border-green-200'
                              }`}
                              animate={{
                                scale: timeRemaining.urgent ? [1, 1.05, 1] : 1
                              }}
                              transition={{ 
                                duration: 1, 
                                repeat: timeRemaining.urgent ? Infinity : 0 
                              }}
                            >
                              <Timer className="w-4 h-4" />
                              {timeRemaining.text}
                            </motion.div>

                            {/* Live Countdown Display */}
                            {timeRemaining.timeObject && (
                              <motion.div 
                                className="grid grid-cols-4 gap-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                              >
                                {[
                                  { label: 'Days', value: timeRemaining.timeObject.days },
                                  { label: 'Hours', value: timeRemaining.timeObject.hours },
                                  { label: 'Minutes', value: timeRemaining.timeObject.minutes },
                                  { label: 'Seconds', value: timeRemaining.timeObject.seconds }
                                ].map((time, idx) => (
                                  <div key={idx} className="text-center">
                                    <motion.div 
                                      className="bg-white/20 backdrop-blur-sm rounded-lg p-2 mb-1"
                                      animate={{ 
                                        scale: idx === 3 ? [1, 1.1, 1] : 1 
                                      }}
                                      transition={{ 
                                        duration: 1, 
                                        repeat: idx === 3 ? Infinity : 0 
                                      }}
                                    >
                                      <div className="text-lg font-bold">
                                        {String(time.value).padStart(2, '0')}
                                      </div>
                                    </motion.div>
                                    <div className="text-xs opacity-90">{time.label}</div>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </motion.div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6">
                          {/* Vote Stats */}
                          <motion.div 
                            className="grid grid-cols-2 gap-4 mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                          >
                            <div className="bg-emerald-50 p-4 rounded-2xl text-center">
                              <div className="text-2xl font-bold text-emerald-600">{vote.totalVotes}</div>
                              <div className="text-emerald-500 text-sm font-medium">Total Votes</div>
                            </div>
                            <div className="bg-teal-50 p-4 rounded-2xl text-center">
                              <div className="text-2xl font-bold text-teal-600">{vote.candidates.length}</div>
                              <div className="text-teal-500 text-sm font-medium">Candidates</div>
                            </div>
                          </motion.div>

                          {/* Enhanced Date & Time Display */}
                          <motion.div 
                            className="space-y-3 mb-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                          >
                            {/* Start Time */}
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                              <div className="flex items-center gap-2 text-green-700">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">Start:</span>
                              </div>
                              <div className="text-right text-green-800">
                                <div className="font-semibold">{startTime.dateStr}</div>
                                <div className="text-sm opacity-80">{startTime.timeStr}</div>
                              </div>
                            </div>

                            {/* End Time */}
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200">
                              <div className="flex items-center gap-2 text-red-700">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">End:</span>
                              </div>
                              <div className="text-right text-red-800">
                                <div className="font-semibold">{endTime.dateStr}</div>
                                <div className="text-sm opacity-80">{endTime.timeStr}</div>
                              </div>
                            </div>
                          </motion.div>

                          {/* Candidates */}
                          <motion.div 
                            className="mb-6" 
                            layout
                          >
                            <motion.h3 
                              className="text-lg font-semibold text-gray-800 mb-4"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              Candidates ({vote.candidates.length})
                            </motion.h3>
                            
                            <motion.div 
                              className="space-y-3"
                              layout
                            >
                              <AnimatePresence >
                                <motion.div className='max-h-28 overflow-y-auto'>
                                  {vote.candidates.map((candidate, candidateIndex) => (
                                  <motion.div
                                    key={candidate._id || candidateIndex}
                                    className="flex items-center gap-3 p-4 my-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + candidateIndex * 0.1 }}
                                    whileHover={{ 
                                      backgroundColor: "rgba(16, 185, 129, 0.05)",
                                      transition: { duration: 0.2 }
                                    }}
                                  >
                                    <motion.div 
                                      className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                                      animate={{ 
                                        scale: [1, 1.2, 1],
                                        opacity: [0.7, 1, 0.7]
                                      }}
                                      transition={{ 
                                        duration: 2, 
                                        repeat: Infinity,
                                        delay: candidateIndex * 0.2
                                      }}
                                    />
                                    
                                    <motion.span 
                                      className="text-gray-700 font-medium flex-1 text-sm sm:text-base"
                                      layoutId={`candidate-${candidate._id}`}
                                    >
                                      {candidate.description}
                                    </motion.span>
                                  </motion.div>
                                ))}
                                </motion.div>
                              </AnimatePresence>
                            </motion.div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};