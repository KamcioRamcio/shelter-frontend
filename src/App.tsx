import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Activate from './components/Activate';
import ShelterHome from "./components/ShelterHome.tsx";
import UserHome from "./components/UserHome.tsx";
import AdminDashboard from "./components/Admin.tsx";

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/activate/:token" element={<Activate />} />
                <Route path="/shelter/home" element={<ShelterHome />} />
                <Route path="/user/home" element={<UserHome />} />
                <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
        </Router>
    );
};

export default App;