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
    </Routes>
    
  );
}

export default App;