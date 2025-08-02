import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Vote,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Bell,
  Search,
  Calendar,
  List,
  Loader
} from "lucide-react";
import { useSignoutMutation } from "../../redux/apis/AuthApis";
import { logout } from "../../redux/slices/authSlice";

export const UserLayout = () => {
  const { user: authuser } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [voteMenuOpen, setVoteMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [signout] = useSignoutMutation();
  // Mock user data
  const user = {
    name: authuser.name,
    emp_id: authuser.emp_id,
  };

  // Vote submenu items
  const voteSubmenu = [
    {
      title: "Upcoming vote",
      icon: Loader,
      path: "/comming-vote",
      description: "Go to comming vote page",
    },
    {
      title: "Active Votes",
      icon: Vote,
      path: "/active-vote",
      description: "Cast your votes here",
    },
    {
      title: "Voted List",
      icon: List,
      path: "/voted-list",
      description: "View your voting history",
    },
    
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false); // Close sidebar on mobile after navigation

    // Keep vote menu open when navigating to vote pages
    if (path.includes("vote")) {
      setVoteMenuOpen(true);
    } else {
      setVoteMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signout().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  // Function to get the current page title
  const getCurrentPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case "/comming-vote":
        return "Comming Votes";
      case "/active-vote":
        return "Active Votes";
      case "/voted-list":
        return "Voted List";
      case "/settings":
        return "Settings";
      case "/dashboard":
      default:
        return "Dashboard";
    }
  };

  // Check if current path is active
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Check if vote menu should be open based on current path
  React.useEffect(() => {
    if (location.pathname.includes("vote")) {
      setVoteMenuOpen(true);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 overflow-auto left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 w-64 bg-white shadow-xl`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Voting Portal
          </h2>
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
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {user?.name || "User"}
              </p>
              <p className="text-sm text-gray-500">
                ID: {user?.emp_id || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {/* Dashboard */}
          <button
            onClick={() => handleNavigation("/dashboard")}
            className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors ${
              isActivePath("/dashboard")
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className={isActivePath("/dashboard") ? "font-medium" : ""}>
              Dashboard
            </span>
          </button>

          {/* Votes with dropdown */}
          <div className="space-y-1">
            <button
              onClick={() => setVoteMenuOpen(!voteMenuOpen)}
              className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${
                location.pathname.includes("vote")
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-100"
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
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      className={`w-4 h-4 mt-0.5 transition-colors ${
                        isActivePath(item.path)
                          ? "text-emerald-600"
                          : "group-hover:text-emerald-600"
                      }`}
                    />
                    <div>
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-xs text-gray-500">
                        {item.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            onClick={() => handleNavigation("/settings")}
            className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors ${
              isActivePath("/settings")
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-gray-700 hover:bg-gray-100"
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
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b py-1.5 border-gray-200 z-20 sticky top-0">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {getCurrentPageTitle()}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              {/* <div className="hidden sm:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search votes..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div> */}

              {/* Notifications */}
              {/* <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-xs text-white flex items-center justify-center">
                  2
                </span>
              </button> */}

              {/* Date */}
              <div className="hidden md:flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Main Content - This is where child routes will render */}
        <div className="min-h-screen bg-gray-50">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
