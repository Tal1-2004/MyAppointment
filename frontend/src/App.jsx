import { Routes, Route } from "react-router";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookAppointment from "./pages/BookAppointment";
import Doctors from "./pages/Doctors";
import DoctorRegister from "./pages/DoctorRegister";
import DoctorDashboard from "./pages/DoctorDashboard";

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
    </Routes>
    
  );
}

export default App;