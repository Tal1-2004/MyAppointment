import { Routes, Route } from "react-router";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookAppointment from "./pages/BookAppointment";
import Doctors from "./pages/Doctors";
import DoctorRegister from "./pages/DoctorRegister";
import DoctorDashboard from "./pages/DoctorDashboard";
import ForDoctors from "./pages/ForDoctors";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorLogin from "./pages/DoctorLogin";
import DoctorAvailability from "./pages/DoctorAvailability";
import DoctorProfile from "./pages/DoctorProfile";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorSettings from "./pages/DoctorSettings";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <Home />
          </>
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/book-appointment" element={<BookAppointment />} />
      <Route
        path="/doctors"
        element={
          <>
            <Navbar />
            <Doctors />
          </>
        }
      />
      <Route
        path="/doctor-register"
        element={<DoctorRegister />}
      />
      <Route
          path="/doctor-dashboard"
          element={<DoctorDashboard />}
        />
      <Route
        path="/admin-dashboard"
        element={<AdminDashboard />}
      />
          <Route
      path="/for-doctors"
      element={<ForDoctors />}
      />
        <Route
      path="/doctor-login"
      element={<DoctorLogin />}
      />
      <Route
      path="/doctor-availability"
      element={<DoctorAvailability />}
      />
      <Route
        path="/doctor-profile"
        element={<DoctorProfile />}
      />
      <Route
        path="/doctor-appointments"
        element={<DoctorAppointments />}
      />
      <Route
        path="/doctor-settings"
        element={<DoctorSettings />}
      />
    </Routes>
    
  );
}

export default App;