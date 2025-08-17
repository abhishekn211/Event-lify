// src/App.jsx
import { Route, Routes } from "react-router-dom";
import './index.css';
import Home from './pages/Home';
import Signup from "./components/Signup";
import Login from "./components/Login";
import CreateEvent from "./pages/CreateEvent";
import MyBookings from "./pages/MyBookings";
import EventDetails from "./pages/EventDetail";
import LiveEvent from "./pages/LiveEvent";
import ProtectedRoute from "./components/ProtectedRoute";
import EditEvent from "./pages/EditEvent";
import Landing from "./pages/Landing";
import Footer from "./components/Footer";
import { useAuth } from './context/AuthProvider';
import Dashboard from "./pages/Dashboard";

function App() {
  const { authUser, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p> {/* Or a fancy spinner component */}
      </div>
    );
  }
  return (
    <>
    <main className="min-h-screen mx-auto">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home/>} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route
          path="/events/:id/live"
          element={
            <ProtectedRoute>
              <LiveEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/edit"
          element={
            <ProtectedRoute>
              <EditEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
       <Route path="/signup" element={!authUser ? <Signup /> : <Home />} />
        <Route path="/login" element={!authUser ? <Login /> : <Home />} />
      </Routes> 
    </main>
    <Footer />
    </>
    
  );
}

export default App;
