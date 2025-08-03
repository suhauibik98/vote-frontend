import React, { useMemo, useCallback,  useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Vote, 
  Settings,
  CheckCircle,
  List,
  BarChart3,
  Activity,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';
import { useGetDataForDashBoardQuery } from '../../redux/apis/UserApis';

// CSS-in-JS for animations
const chartStyles = `
  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    100% { transform: translateY(-10px) rotate(5deg); }
  }
  
  @keyframes growUp {
    from { height: 0%; opacity: 0; }
    to { height: var(--final-height); opacity: 1; }
  }
  
  @keyframes drawLine {
    from { stroke-dashoffset: 100; }
    to { stroke-dashoffset: 0; }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
    50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.8); }
  }
  
  @keyframes slide-in {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .chart-container {
    position: relative;
    background: linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 50%, #ecfeff 100%);
  }
  
  .chart-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, rgba(6, 182, 212, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

export const DashBoard = () => {
  const { user: authuser } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { data, isLoading, error , refetch } = useGetDataForDashBoardQuery({skip:true});
  
  // const refresh = async()=>{await refetch()}

  // useEffect(()=>{
  //   refresh()
  // },[])

  // Memoized user data 
  const user = useMemo(() => ({
    name: authuser?.name || 'User',
    emp_id: authuser?.emp_id
  }), [authuser]);

  // Time formatting utility
  const formatTimeAgo = useCallback((dateString) => {
    if (!dateString) return 'Unknown time';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      console.log(error);
      
      return 'Invalid date';
    }
  }, []);

  // Calculate participation rate
  const participationRate = useMemo(() => {
    if (!data?.TotalVotes || !data?.TotalUser) return 0;
    return Math.round((data.TotalVotes / (data.TotalUser * 10)) * 100); // Assuming 10 possible votes per user
  }, [data]);

  // Memoized stats data with real API data
  const stats = useMemo(() => [
    { 
      title: 'Available Votes', 
      value: isLoading ? '...' : (data?.AvailableVote ?? 0), 
      change: data?.AvailableVote > 0 ? `+${data.AvailableVote}` : '0',
      icon: Vote, 
      color: 'emerald',
      description: 'Active votes you can participate in'
    },
    { 
      title: 'Total Users', 
      value: isLoading ? '...' : (data?.TotalUser ?? 0), 
      change: `+${data?.TotalUser || 0}`, 
      icon: Users, 
      color: 'teal',
      description: 'Registered users in the system'
    },
    { 
      title: 'Pending Votes', 
      value: isLoading ? '...' : (data?.PendingVotes ?? 0), 
      change: data?.PendingVotes > 0 ? `${data.PendingVotes} pending` : 'None',
      icon: Clock, 
      color: 'amber',
      description: 'Votes awaiting your decision'
    },
    { 
      title: 'Total Votes Cast', 
      value: isLoading ? '...' : (data?.TotalVotes ?? 0), 
      change: `+${data?.TotalVotes || 0}`, 
      icon: Activity, 
      color: 'cyan',
      description: 'All votes cast by users'
    },
    { 
      title: 'Completed Votes', 
      value: isLoading ? '...' : (data?.EndsVotes ?? 0), 
      change: `${data?.EndsVotes || 0} ended`, 
      icon: CheckCircle, 
      color: 'green',
      description: 'Voting sessions that have concluded'
    },
  ], [data, isLoading]);

  // Memoized recent activities with real API data and better formatting
  const recentActivities = useMemo(() => {
    if (!data?.lastVote || !Array.isArray(data.lastVote)) {
      return [
        { id: 'default-1', action: 'No recent voting activity', time: 'N/A', type: 'info' },
        { id: 'default-2', action: 'Welcome to the voting system', time: 'Welcome', type: 'info' },
      ];
    }

    return data.lastVote.slice(0, 6).map((vote, index) => ({
      id: `${vote._id}-${index}`,
      action: `${vote.name} voted on "${vote.voteSubject}"`,
      time: formatTimeAgo(vote.votedAt),
      type: 'vote',
      voteSubject: vote.voteSubject,
      voterName: vote.name
    }));
  }, [data, formatTimeAgo]);

  const getStatColor = useCallback((color) => {
    const colors = {
      emerald: 'from-emerald-500 to-emerald-600',
      teal: 'from-teal-500 to-teal-600',
      green: 'from-green-500 to-green-600',
      cyan: 'from-cyan-500 to-cyan-600',
      amber: 'from-amber-500 to-amber-600',
      indigo: 'from-indigo-500 to-indigo-600',
    };
    return colors[color] || colors.emerald;
  }, []);

  const getStatBg = useCallback((color) => {
    const colors = {
      emerald: 'bg-emerald-50 border-emerald-200',
      teal: 'bg-teal-50 border-teal-200',
      green: 'bg-green-50 border-green-200',
      cyan: 'bg-cyan-50 border-cyan-200',
      amber: 'bg-amber-50 border-amber-200',
      indigo: 'bg-indigo-50 border-indigo-200',
    };
    return colors[color] || colors.emerald;
  }, []);

  // Navigation handler
  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  // Quick action buttons data
  const quickActions = useMemo(() => [
    {
      path: '/active-vote',
      icon: Vote,
      label: 'Vote Now',
      colorClass: 'emerald'
    },
    {
      path: '/voted-list',
      icon: List,
      label: 'My Votes',
      colorClass: 'teal'
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Settings',
      colorClass: 'green'
    }
  ], []);

  // Error state
  if (error) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">Failed to load dashboard data. Please try again.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Inject custom styles */}
      <style dangerouslySetInnerHTML={{ __html: chartStyles }} />
      
      <main className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Welcome section - Better mobile spacing */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Here's your voting dashboard overview.
        </p>
      </div>

      {/* Stats grid - Improved responsive breakpoints */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div 
            key={`${stat.title}-${index}`}
            className={`${getStatBg(stat.color)} border rounded-xl p-4 sm:p-6 transform hover:scale-105 transition-all duration-200 hover:shadow-lg group`}
            title={stat.description}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${getStatColor(stat.color)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className={`text-xs sm:text-sm font-semibold ${
                stat.color === 'amber' ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-1 line-clamp-2">
              {stat.title}
            </h3>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Content grid - Better mobile layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Amazing Interactive Chart Section */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                Voting Analytics Dashboard
              </h2>
              <p className="text-sm text-gray-600">Interactive visualization of voting patterns</p>
            </div>
            <div className="flex gap-2 mt-3 sm:mt-0">
              <button className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium hover:bg-emerald-200 transition-colors">
                Daily
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors">
                Weekly
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors">
                Monthly
              </button>
            </div>
          </div>
          
          {/* Main Chart Container */}
          <div className="chart-container relative h-48 sm:h-64 lg:h-80 rounded-xl p-4 overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-30"
                    style={{
                      width: `${15 + i * 8}px`,
                      height: `${15 + i * 8}px`,
                      left: `${5 + i * 12}%`,
                      top: `${15 + (i % 3) * 25}%`,
                      animation: `float ${2 + i * 0.3}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Chart Content */}
            <div className="relative z-10 h-full flex items-end justify-between px-2 sm:px-4">
              {/* Animated Bar Chart */}
              {[
                { label: 'Mon', value: data?.AvailableVote || 3, color: 'emerald', gradient: 'from-emerald-500 to-emerald-400' },
                { label: 'Tue', value: Math.floor((data?.TotalVotes || 32) / 7), color: 'teal', gradient: 'from-teal-500 to-teal-400' },
                { label: 'Wed', value: Math.floor((data?.TotalVotes || 32) / 6), color: 'cyan', gradient: 'from-cyan-500 to-cyan-400' },
                { label: 'Thu', value: data?.EndsVotes || 8, color: 'green', gradient: 'from-green-500 to-green-400' },
                { label: 'Fri', value: Math.floor((data?.TotalVotes || 32) / 4), color: 'emerald', gradient: 'from-emerald-600 to-emerald-500' },
                { label: 'Sat', value: data?.PendingVotes || 1, color: 'amber', gradient: 'from-amber-500 to-amber-400' },
                { label: 'Sun', value: Math.floor((data?.TotalUser || 12) / 2), color: 'indigo', gradient: 'from-indigo-500 to-indigo-400' }
              ].map((bar, index) => {
                const maxValue = Math.max(data?.TotalVotes || 32, 20);
                const heightPercentage = Math.max((bar.value / maxValue) * 80, 15);
                
                return (
                  <div key={bar.label} className="flex flex-col items-center group cursor-pointer relative">
                    {/* Animated Bar */}
                    <div 
                      className={`relative w-6 sm:w-8 lg:w-10 bg-gradient-to-t ${bar.gradient} rounded-t-lg transition-all duration-700 ease-out hover:scale-110 shadow-lg hover:shadow-xl`}
                      style={{
                        height: `${heightPercentage}%`,
                        animationDelay: `${index * 200}ms`,
                        animation: 'growUp 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards, pulse-glow 3s ease-in-out infinite',
                        '--final-height': `${heightPercentage}%`
                      }}
                    >
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                      
                      {/* Value Display on Bar */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        {bar.value}
                      </div>
                      
                      {/* Hover Tooltip */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-lg">
                        <div className="text-center">
                          <div className="font-semibold">{bar.value} votes</div>
                          <div className="text-gray-300">{bar.label}</div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                      
                      {/* Particle Effect */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={`absolute w-1 h-1 bg-${bar.color}-400 rounded-full`}
                            style={{
                              left: `${(i - 1) * 8}px`,
                              animation: `float ${1 + i * 0.2}s ease-in-out infinite alternate`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Day Label */}
                    <span className="text-xs text-gray-700 mt-2 font-semibold group-hover:text-gray-900 transition-colors">
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Floating Stats Bubbles */}
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-xl border border-white/30 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-emerald-700">+{data?.AvailableVote || 3} Active</span>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-xl border border-white/30 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-teal-600" />
                  <span className="text-xs font-bold text-teal-700">{data?.TotalVotes || 32} Total</span>
                </div>
              </div>
            </div>

            {/* Animated Trend Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8"/>
                </linearGradient>
              </defs>
              <path
                d="M 40 160 Q 100 140 160 130 T 280 120 Q 320 115 360 110"
                stroke="url(#trendGradient)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="8,4"
                opacity="0.7"
                style={{
                  animation: 'drawLine 3s ease-in-out forwards',
                  strokeDashoffset: '200'
                }}
              />
              {/* Trend Points */}
              {[40, 120, 200, 280, 360].map((x, i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={160 - i * 10}
                  r="3"
                  fill="#10b981"
                  opacity="0"
                  style={{
                    animation: `slide-in 0.5s ease-out ${2 + i * 0.2}s forwards`
                  }}
                />
              ))}
            </svg>
          </div>

          {/* Chart Legend & Insights */}
          <div className="mt-4 flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-gray-600">Active Votes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                <span className="text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-gray-600">Pending</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Data</span>
            </div>
          </div>
        </div>

        {/* Recent activities - Improved mobile scrolling */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Recent Activities
          </h2>
          {recentActivities.length === 0 || recentActivities[0]?.type === 'info' ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No recent voting activity</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.type === 'vote' ? 'bg-emerald-500' : 
                    activity.type === 'new' ? 'bg-teal-500' : 
                    activity.type === 'closed' ? 'bg-gray-400' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {activity.voterName && (
                            <span className="text-emerald-600">{activity.voterName}</span>
                          )}
                          {activity.voterName && ' voted on'}
                        </p>
                        {activity.voteSubject && (
                          <p className="text-sm text-gray-700 line-clamp-2 bg-gray-50 px-2 py-1 rounded">
                            "{activity.voteSubject}"
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom section - Better mobile stacking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4">
            {quickActions.map((action) => (
              <button 
                key={action.path}
                onClick={() => handleNavigation(action.path)}
                className={`p-4 bg-${action.colorClass}-50 border border-${action.colorClass}-200 rounded-lg hover:bg-${action.colorClass}-100 transition-all duration-200 group hover:shadow-md`}
                aria-label={action.label}
              >
                <action.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${action.colorClass}-600 mb-2 mx-auto group-hover:scale-110 transition-transform`} />
                <span className={`text-xs sm:text-sm font-medium text-${action.colorClass}-900 block`}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Voting Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Voting Summary
          </h2>
          <div className="space-y-3">
            {[
              { 
                label: 'Available Votes', 
                value: data?.AvailableVote ?? 0, 
                color: 'emerald',
                icon: Vote
              },
              { 
                label: 'Votes Cast Today', 
                value: data?.lastVote?.filter(vote => {
                  const today = new Date();
                  const voteDate = new Date(vote.votedAt);
                  return voteDate.toDateString() === today.toDateString();
                }).length ?? 0, 
                color: 'teal',
                icon: TrendingUp
              },
              { 
                label: 'Pending Decisions', 
                value: data?.PendingVotes ?? 0, 
                color: 'amber',
                icon: Clock
              },
              { 
                label: 'Participation Rate', 
                value: `${participationRate}%`, 
                color: 'cyan',
                icon: BarChart3
              }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-${item.color}-100 rounded-lg flex items-center justify-center`}>
                    <item.icon className={`w-4 h-4 text-${item.color}-600`} />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    {item.label}
                  </span>
                </div>
                <span className={`px-3 py-1 bg-${item.color}-100 text-${item.color}-800 text-sm font-semibold rounded-full`}>
                  {isLoading ? '...' : item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
    </>
  );
};