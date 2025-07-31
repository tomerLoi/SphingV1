import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddSite from "./pages/AddSite";
import TeamMembers from "./pages/TeamMembers";
import AddMember from "./pages/AddMember";
import EditSite from "./pages/EditSite";
import SiteManage from "./pages/SiteManage"; // <-- החדש!
import PrivateRoute from "./components/PrivateRoute";
import ProfilePage from "./pages/ProfilePage";

function checkToken() {
  return !!sessionStorage.getItem("auth_token");
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(checkToken());

  useEffect(() => {
    const onStorage = () => setIsLoggedIn(checkToken());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    sessionStorage.removeItem("auth_token");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn
              ? <Navigate to="/dashboard" replace />
              : <Login setIsLoggedIn={handleLogin} />
          }
        />
        <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard onLogout={handleLogout} /></PrivateRoute>} />
        <Route path="/add-site" element={<PrivateRoute><AddSite /></PrivateRoute>} />
        <Route path="/edit-site" element={<PrivateRoute><EditSite /></PrivateRoute>} />
        <Route path="/team-members" element={<PrivateRoute><TeamMembers /></PrivateRoute>} />
        <Route path="/add-member" element={<PrivateRoute><AddMember /></PrivateRoute>} />
        <Route path="/site-manage" element={<PrivateRoute><SiteManage /></PrivateRoute>} /> {/* <-- החדש */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
