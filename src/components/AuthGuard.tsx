import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import profileApi from '../api/profileApi';

interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await profileApi.checkProfileStatus();

                if (response.success) {
                    if (!response.data.is_completed) {
                        if(!response.data.is_shelter){
                            navigate('/profile/customize');
                            return;
                        }else {
                            navigate('/shelter-profile/customize');
                            return;
                        }

                    }if(response.data.is_shelter){
                        navigate('/shelter/home');
                        return;
                    }else {
                        navigate('/user/home');
                    }
                    return;
                } else {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    navigate('/login');
                    return;
                }
            } catch (error) {
                console.error('Authentication error:', error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                navigate('/login');
                return;
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
};

export default AuthGuard;