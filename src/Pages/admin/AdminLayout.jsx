import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Users, 
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Clock,
  UserCheck,
  Vote,
  Plus,
  CheckCircle,
  BarChart3,
  Bell,
  Search,
  Calendar,
  Loader
} from 'lucide-react';
import { useSignoutMutation } from '../../redux/apis/AuthApis';
import { logout } from '../../redux/slices/authSlice';

export const AdminLayout = () => {
  const { user } = useSelector(state => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [voteMenuOpen, setVoteMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
 const dispatch = useDispatch();

  const [signout ] = useSignoutMutation();
  // User submenu items
  const userSubmenu = [
    {
      title: 'Create New User',
      icon: UserPlus,
      path: '/admin/users/create',
      description: 'Add new team member'
    },
    {
      title: 'Pending Users',
      icon: Clock,
      path: '/admin/users/pending',
      description: 'Review pending requests'
    },
    {
      title: 'All Users',
      icon: UserCheck,
      path: '/admin/users/all',
      description: 'View all active users'
    }
  ];

  // Vote submenu items
  const voteSubmenu = [
    {
      title: 'Create New Vote',
      icon: Plus,
      path: '/admin/votes/create',
      description: 'Create new voting poll'
    },
    {
      title: 'Upcomming Votes',
      icon: Loader,
      path: '/admin/votes/upcomming',
      description: 'View comming vote page'
    },
    {
      title: 'Active Votes',
      icon: CheckCircle,
      path: '/admin/votes/active',
      description: 'View active voting polls'
    },
    {
      title: 'Ended Votes',
      icon: CheckCircle,
      path: '/admin/votes/ended',
      description: 'View ended voting polls'
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
    
    if (path.includes('users')) {
      setUserMenuOpen(true);
      setVoteMenuOpen(false);
    } else if (path.includes('votes')) {
      setVoteMenuOpen(true);
      setUserMenuOpen(false);
    } else {
      setUserMenuOpen(false);
      setVoteMenuOpen(false);
    }
  };

  const handleLogout = async () => {
      try {
      const res =   await signout().unwrap();
      if(res?.success){
        dispatch(logout());
        navigate("/login");}
      } catch (error) {
        console.error(error);
      }
    };
  // Check if current path is active
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Check if menus should be open based on current path
  React.useEffect(() => {
    if (location.pathname.includes('users')) {
      setUserMenuOpen(true);
      setVoteMenuOpen(false);
    } else if (location.pathname.includes('votes')) {
      setVoteMenuOpen(true);
      setUserMenuOpen(false);
    }
  }, [location.pathname]);

  // Function to get the current page title
  const getCurrentPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/admin/users/create':
        return 'Create New User';
      case '/admin/users/pending':
        return 'Pending Users';
      case '/admin/users/all':
        return 'All Users';
      case '/admin/votes/create':
        return 'Create New Vote';
      case '/admin/votes/active':
        return 'Active Votes';
      case '/admin/votes/upcomming':
        return 'Upcomming Votes';
      case '/admin/votes/ended':
        return 'Ended Votes';
      case '/admin/settings':
        return 'Settings';
      case '/admin/dashboard':
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 overflow-auto left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 w-64 bg-white shadow-xl`}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Admin Panel</h2>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">{user?.name || 'Admin User'}</p>
              <p className="text-sm text-gray-500">ID: {user?.emp_id || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {/* Dashboard */}
          <button 
            onClick={() => handleNavigation('/admin/dashboard')}
            className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors ${
              isActivePath('/admin/dashboard')
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className={isActivePath('/admin/dashboard') ? 'font-medium' : ''}>Dashboard</span>
          </button>

          {/* Users with dropdown */}
          <div className="space-y-1">
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${
                location.pathname.includes('users')
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5" />
                <span>Users</span>
              </div>
              {userMenuOpen ? (
                <ChevronDown className="w-4 h-4 transition-transform" />
              ) : (
                <ChevronRight className="w-4 h-4 transition-transform" />
              )}
            </button>
            
            {/* Users submenu */}
            {userMenuOpen && (
              <div className="ml-4 space-y-1 border-l-2 border-emerald-200 pl-4">
                {userSubmenu.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-start space-x-3 p-3 rounded-lg w-full text-left group transition-colors ${
                      isActivePath(item.path)
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 mt-0.5 transition-colors ${
                      isActivePath(item.path) ? 'text-emerald-600' : 'group-hover:text-emerald-600'
                    }`} />
                    <div>
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Votes with dropdown */}
          <div className="space-y-1">
            <button 
              onClick={() => setVoteMenuOpen(!voteMenuOpen)}
              className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${
                location.pathname.includes('votes')
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Vote className="w-5 h-5" />
                <span>Votes</span>
              </div>
              {voteMenuOpen ? (
                <ChevronDown className="w-4 h-4 transition-transform" />
              ) : (
                <ChevronRight className="w-4 h-4 transition-transform" />
              )}
            </button>
            
            {/* Votes submenu */}
            {voteMenuOpen && (
              <div className="ml-4 space-y-1 border-l-2 border-emerald-200 pl-4">
                {voteSubmenu.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-start space-x-3 p-3 rounded-lg w-full text-left group transition-colors ${
                      isActivePath(item.path)
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 mt-0.5 transition-colors ${
                      isActivePath(item.path) ? 'text-emerald-600' : 'group-hover:text-emerald-600'
                    }`} />
                    <div>
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <button 
            onClick={() => handleNavigation('/admin/settings')}
            className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors ${
              isActivePath('/admin/settings')
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64  ">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 py-1.5 z-20 sticky top-0">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{getCurrentPageTitle()}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              {/* <div className="hidden sm:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div> */}
              
              {/* Notifications */}
              {/* <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
              </button> */}
              
              {/* Date */}
              <div className="hidden md:flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Main Content - This is where child routes will render */}
        <div className="min-h-screen bg-gray-50 ">
          <Outlet />
        </div>
      </div>
    </div>
  );
};