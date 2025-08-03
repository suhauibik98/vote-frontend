import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignIn } from "./Pages/auth/SignIn";
import { SignUp } from "./Pages/auth/SignUp";
import { restoreAuthFromCookies, logout } from "./redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { Spinner } from "./components/Spinner";
import { AdminRoute } from "./routes/AdminRoute";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import Unauthorized from "./Pages/unauthorized/Unauthorized";
import { useAuth } from "./Hook/useAuth";

// User Components
import { UserLayout } from "./Pages/user/UserLayout";
import { DashBoard } from "./Pages/user/DashBoard";
import { ActiveVote } from "./Pages/user/vote/ActiveVote";
import { VotedList } from "./Pages/user/vote/VotedList";
import { Settings } from "./Pages/user/Settings";
import { CommingVote } from "./Pages/user/vote/CommingVote";

// Admin Components
import { AdminLayout } from "./Pages/admin/AdminLayout";
import { AdminDashboard } from "./Pages/admin/AdminDashboard";
import { AdminSettings } from "./Pages/admin/AdminSettings";
import { CreateNewUser } from "./Pages/admin/users/CreateNewUser";
import { GetAllUserPending } from "./Pages/admin/users/GetAllUserPending";
import { GetAllUsers } from "./Pages/admin/users/GetAllUsers";
import { CreateNewVote } from "./Pages/admin/Vote/CreateNewVote";
import { ActiveVote as AdminActiveVote } from "./Pages/admin/Vote/ActiveVote";
import { EndsVote } from "./Pages/admin/Vote/EndsVote";
import { UpcommingVote } from "./Pages/admin/Vote/UpcommingVote";

function App() {
  const { authInitialized, isAuthenticated } = useAuth();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(restoreAuthFromCookies());
    window.dispatchLogout = () => dispatch(logout()); // for auto logout timer
  }, [dispatch]);

  if (!authInitialized) return <Spinner />;

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<SignIn />} />
          <Route path="/registration" element={<SignUp />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Root redirect - redirect unauthenticated users to login */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Protected User Routes with UserLayout */}
          <Route
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashBoard />} />
            <Route path="/comming-vote" element={<CommingVote />} />
            <Route path="/active-vote" element={<ActiveVote />} />
            <Route path="/voted-list" element={<VotedList />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Admin Routes with AdminLayout */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            {/* Admin Dashboard */}
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* Admin User Management */}
            <Route path="users/create" element={<CreateNewUser />} />
            <Route path="users/pending" element={<GetAllUserPending />} />
            <Route path="users/all" element={<GetAllUsers />} />

            {/* Admin Vote Management */}
            <Route path="votes/create" element={<CreateNewVote />} />
            <Route path="votes/active" element={<AdminActiveVote />} />
            <Route path="votes/ended" element={<EndsVote />} />
            <Route path="votes/upcomming" element={<UpcommingVote />} />

            {/* Admin Settings */}
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Legacy admin dashboard route - redirect to new structure */}
          {/* <Route 
            path="/admin/dashboard" 
            element={<Navigate to="/admin/dashboard" replace />} 
          /> */}

          {/* Catch all - redirect to unauthorized */}
          <Route path="*" element={<Navigate to="/unauthorized" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
