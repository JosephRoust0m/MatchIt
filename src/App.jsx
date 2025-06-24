import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./components/Welcome";
import Jobs from "./components/Jobs";
import Profile from "./components/Profile";
import Signin from "./components/SignIn";
import Compatibility from "./components/Compatibility";



function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/compatibility" element={<Compatibility />} />
      </Routes>
    </Router>
  );
  
}

export default App;
