import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Users, 
  TrendingUp, 
  Vote,
  Clock,
  UserPlus,
  Settings,
  BarChart3,
  Plus,
  Calendar,
  History,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useGetDataForDashBoardAdminQuery } from '../../redux/apis/AdminApis';

export const AdminDashboard = () => {
  const { user ,isAuthenticated , authInitialized } = useSelector(state => state.auth);
  const navigate = useNavigate();

const { data, isLoading, error } = useGetDataForDashBoardAdminQuery(undefined, {
    skip: !isAuthenticated || !user
  });

  if (!authInitialized) {
    return (
      <main className="p-2 sm:p-4 lg:p-6 xl:p-8">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="text-sm">Initializing...</div>
        </div>
      </main>
    );
  }

  // ✅ Redirect if not authenticated after initialization
  if (authInitialized && !isAuthenticated) {
    navigate('/login');
    return null;
  }
  // Mock chart data - replace with your actual data processing
  const generateChartData = () => {
    if (!data) return { lineData: [], pieData: [], barData: [] };

    // Generate sample data based on your actual data
    const lineData = [
      { name: 'Jan', votes: data.totalVote * 0.6, users: data.totalUser * 0.5 },
      { name: 'Feb', votes: data.totalVote * 0.7, users: data.totalUser * 0.6 },
      { name: 'Mar', votes: data.totalVote * 0.8, users: data.totalUser * 0.7 },
      { name: 'Apr', votes: data.totalVote * 0.9, users: data.totalUser * 0.8 },
      { name: 'May', votes: data.totalVote * 0.95, users: data.totalUser * 0.9 },
      { name: 'Jun', votes: data.totalVote, users: data.totalUser },
    ];

    const pieData = [
      { name: 'Active Votes', value: data.totalVote || 0, color: '#10b981' },
      { name: 'Upcoming', value: data.totalVoteMainComming || 0, color: '#06b6d4' },
      { name: 'Completed', value: data.totalVoteMainPast || 0, color: '#8b5cf6' },
    ];

    const barData = [
      { name: 'Mon', votes: Math.floor(Math.random() * 100) + 50 },
      { name: 'Tue', votes: Math.floor(Math.random() * 100) + 50 },
      { name: 'Wed', votes: Math.floor(Math.random() * 100) + 50 },
      { name: 'Thu', votes: Math.floor(Math.random() * 100) + 50 },
      { name: 'Fri', votes: Math.floor(Math.random() * 100) + 50 },
      { name: 'Sat', votes: Math.floor(Math.random() * 100) + 50 },
      { name: 'Sun', votes: Math.floor(Math.random() * 100) + 50 },
    ];

    return { lineData, pieData, barData };
  };

  const { lineData, pieData, barData } = generateChartData();

  // Format time to relative format
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInMinutes > 0) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Dynamic stats based on backend data
  const getStats = () => {
    if (!data) return [];
    
    const totalVotesCount = data.totalVotesAgg?.[0]?.total || 0;
    const userGrowth = data.totalUser > 0 ? `+${Math.round((data.totalUser / 10) * 100)}%` : '0%';
    const voteGrowth = data.totalVote > 0 ? `+${data.totalVote}` : '0';
    
    return [
      { 
        title: 'Total Users', 
        value: data.totalUser?.toLocaleString() || '0', 
        change: userGrowth, 
        icon: Users, 
        color: 'emerald' 
      },
      { 
        title: 'Active Votes', 
        value: data.totalVote || '0', 
        change: voteGrowth, 
        icon: Vote, 
        color: 'teal' 
      },
      { 
        title: 'Upcoming Votes', 
        value: data.totalVoteMainComming || '0', 
        change: `+${data.totalVoteMainComming || 0}`, 
        icon: Calendar, 
        color: 'green' 
      },
      { 
        title: 'Total Votes', 
        value: data.totalVoteMain || '0', 
        change: `+${data.totalVoteMain || 0}`, 
        icon: Calendar, 
        color: 'green' 
      },
      { 
        title: 'Total Votes Cast', 
        value: totalVotesCount.toLocaleString(), 
        change: `${data.totalVoteMain || 0} polls`, 
        icon: TrendingUp, 
        color: 'cyan' 
      },
      { 
        title: 'Total Votes Ends', 
        value: data.totalVoteMainPast, 
        change: `${data.totalVoteMainPast || 0} polls`, 
        icon: TrendingUp, 
        color: 'cyan' 
      },
    ];
  };

  // Transform backend lastVote data to activities
  const getRecentActivities = () => {
    if (!data?.lastVote) return [];
    
    return data.lastVote.slice(0, 6).map((vote, index) => ({
      id: vote._id + index,
      action: `${vote.name} voted on "${vote.voteSubject}"`,
      time: formatTimeAgo(vote.votedAt),
      type: 'vote',
      subject: vote.voteSubject
    }));
  };

  const stats = getStats();
  const recentActivities = getRecentActivities();

  const getStatColor = (color) => {
    const colors = {
      emerald: 'from-emerald-500 to-emerald-600',
      teal: 'from-teal-500 to-teal-600',
      green: 'from-green-500 to-green-600',
      cyan: 'from-cyan-500 to-cyan-600',
    };
    return colors[color];
  };

  const getStatBg = (color) => {
    const colors = {
      emerald: 'bg-emerald-50 border-emerald-200',
      teal: 'bg-teal-50 border-teal-200',
      green: 'bg-green-50 border-green-200',
      cyan: 'bg-cyan-50 border-cyan-200',
    };
    return colors[color];
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((pld, index) => (
            <p key={index} style={{ color: pld.color }} className="text-sm">
              {pld.dataKey}: {pld.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <main className="p-2 sm:p-4 lg:p-6 xl:p-8">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2 mb-6 sm:mb-8"></div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-24 sm:h-32"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-2 sm:p-4 lg:p-6 xl:p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 text-center">
          <p className="text-red-600 text-sm sm:text-base">Error loading dashboard data. Please try again.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-2 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Welcome section */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
          Welcome back, {user?.name || 'Admin'}! 👋
        </h2>
        <p className="text-sm sm:text-base text-gray-600">Here's what's happening with your voting system today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${getStatBg(stat.color)} border rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md`}>
            <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${getStatColor(stat.color)} rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <span className="text-emerald-500 text-xs sm:text-sm font-semibold hidden sm:block">{stat.change}</span>
            </div>
            <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-1 truncate">{stat.title}</h3>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{stat.value}</p>
            <span className="text-emerald-500 text-xs font-semibold block sm:hidden mt-1">{stat.change}</span>
          </div>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
        {/* Line Chart */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Votes & Users Trend</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData}>
                <defs>
                  <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="votes"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorVotes)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#06b6d4"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Vote Distribution</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Weekly Voting Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Weekly Voting Activity</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="votes" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent voting activities */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Activity</h3>
          <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-80 overflow-y-auto">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-900 line-clamp-2">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-xs sm:text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions and System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button 
              onClick={() => handleNavigation('/admin/users/create')}
              className="p-3 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors group"
            >
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform mx-auto" />
              <span className="text-xs sm:text-sm font-medium text-emerald-900 block text-center">Add User</span>
            </button>
            <button 
              onClick={() => handleNavigation('/admin/votes/create')}
              className="p-3 sm:p-4 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors group"
            >
              <Vote className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mb-2 group-hover:scale-110 transition-transform mx-auto" />
              <span className="text-xs sm:text-sm font-medium text-teal-900 block text-center">New Vote</span>
            </button>
            <button 
              onClick={() => handleNavigation('/admin/users/pending')}
              className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors group"
            >
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mb-2 group-hover:scale-110 transition-transform mx-auto" />
              <span className="text-xs sm:text-sm font-medium text-green-900 block text-center">Pending ({data?.totalVoteMainComming || 0})</span>
            </button>
            <button 
              onClick={() => handleNavigation('/admin/settings')}
              className="p-3 sm:p-4 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors group"
            >
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 mb-2 group-hover:scale-110 transition-transform mx-auto" />
              <span className="text-xs sm:text-sm font-medium text-cyan-900 block text-center">Settings</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">System Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">Active Polls</span>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                {data?.totalVote || 0} running
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">Total Users</span>
              <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                {data?.totalUser || 0} registered
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">Upcoming Polls</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {data?.totalVoteMainComming || 0} scheduled
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">Total Votes Cast</span>
              <span className="px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded-full">
                {data?.totalVotesAgg?.[0]?.total?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};