import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Activate from './components/Activate';
import ShelterHome from "./components/ShelterHome.tsx";
import UserHome from "./components/UserHome.tsx";
import AdminDashboard from "./components/Admin.tsx";
import AuthGuard from "./components/AuthGuard.tsx";
import ProfileCustomize from "./components/ProfileCustomize.tsx";
import ShelterProfileCustomize from "./components/ShelterProfileCustomize.tsx";
import AddPet from './components/AddPet';
import PetDetails from './components/PetDetails';


const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/activate/:token" element={<Activate />} />
                <Route path='/profile-customize' element={<ProfileCustomize />} />
                <Route path='/shelter-profile-customize' element={<ShelterProfileCustomize />} />
                <Route path="/shelter/add-pet" element={<AddPet />} />
                <Route path="/pets/:id" element={<PetDetails />} />

                <Route path="/profile/customize" element={
                    <AuthGuard>
                        <ProfileCustomize />
                    </AuthGuard>
                } />

                <Route path="/shelter-profile/customize" element={
                    <AuthGuard>
                        <ShelterProfileCustomize />
                    </AuthGuard>
                } />


                <Route path="/shelter/home" element={
                    <AuthGuard>
                        <ShelterHome />
                    </AuthGuard>
                } />



                <Route path="/user/home" element={
                    <AuthGuard>
                        <UserHome />
                    </AuthGuard>
                } />
                <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
        </Router>
    );
};

export default App;