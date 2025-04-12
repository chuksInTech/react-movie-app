// import './Card.css'
import React from 'react'
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import MovieDetails from "./components/MovieDetails.jsx";
import AppContent from "./components/AppContent.jsx";
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import { AuthProvider } from './components/AuthContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import AuthCallback from './components/AuthCallback.jsx';
import UserProfile from "./components/UserProfile.jsx";



const App = () => {

  return (
    <AuthProvider>

      <Router>
        <Routes>
          <Route
            path='/' element={
              <AppContent />
            }

          />
          <Route 
          path="/user-profile"
          element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/api/auth/callback/google" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Router>

    </AuthProvider>
  );

};
export default App
