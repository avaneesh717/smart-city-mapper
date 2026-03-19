import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ComplaintSubmit from "./pages/ComplaintSubmit";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Support from "./pages/Support";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import Landing from "./pages/Landing";

function MainLayout({ children }) {
  const location = useLocation();
  const hideUIOn = ['/', '/login', '/signup'];
  const shouldHideUI = hideUIOn.includes(location.pathname);

  return (
    <div className="app-container">
      {!shouldHideUI && <Navbar />}
      <main className={`main-content ${shouldHideUI ? 'no-padding' : ''}`}>
        {children}
      </main>
      {!shouldHideUI && <Footer />}
    </div>
  );
}

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading Urban Pulse...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Home route (Landing Page) */}
          <Route path="/" element={<Landing />} />
          
          {/* Command Center (Now on /map) */}
          <Route path="/map" element={<Home />} />
          
          {/* Protected routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/submit-complaint" element={
            <ProtectedRoute>
              <ComplaintSubmit />
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Content Pages */}
          <Route path="/support" element={<Support />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
