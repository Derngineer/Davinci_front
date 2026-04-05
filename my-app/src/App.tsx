import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import SelectCountry from './pages/SelectCountry';
import Solver from './pages/Solver';
import Grader from './pages/Grader';
import CourseOutline from './pages/CourseOutline';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/select-country"
          element={
            <ProtectedRoute>
              <SelectCountry />
            </ProtectedRoute>
          }
        />

        {/* Feature routes — publicly accessible, guest limits enforced inside each page */}
        <Route path="/solve" element={<Solver />} />
        <Route path="/grade" element={<Grader />} />
        <Route path="/outline" element={<CourseOutline />} />

        {/* Dashboard remains protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}
