import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../api/apiConfig.ts';
import AdminLogin from './AdminLogin';

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    shelter_name: string;
    is_active: boolean;
    is_shelter: boolean;
}

const AdminDashboard: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const checkAuth = () => {
        const adminToken = localStorage.getItem('admin_token');
        const isAdmin = localStorage.getItem('is_admin');
        return !!adminToken && isAdmin === 'true';
    };

    useEffect(() => {
        setIsAuthenticated(checkAuth());
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        fetchUsers();
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('is_admin');
        setIsAuthenticated(false);
        setUsers([]);
    };

    const fetchUsers = async () => {
        if (!checkAuth()) {
            setIsAuthenticated(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/secure-admin/users/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                handleLogout();
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError('Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserActive = async (userId: number, activate: boolean) => {
        if (!checkAuth()) {
            setIsAuthenticated(false);
            return;
        }

        try {
            const url = `${API_BASE_URL}/secure-admin/users/${userId}/${activate ? 'activate' : 'deactivate'}/`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                handleLogout();
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to update user status');
            }

            await fetchUsers();
        } catch (err) {
            setError('Error updating user status');
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUsers();
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center">
            <div className="flex-1 max-w-[1920px]"> {/* Add max-width to prevent extreme widths */}
                <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header with Logout */}
                    <div className="w-full mb-8 flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Manage user accounts and permissions
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="w-full mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="w-full flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        </div>
                    ) : (
                        /* Users List */
                        <div className="w-full grid grid-cols-1 gap-4">
                            {users.map(user => (
                                <div
                                    key={user.id}
                                    className="w-full bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {user.first_name} {user.last_name} {user.shelter_name}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    user.is_shelter
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {user.is_shelter ? 'Shelter' : 'User'}
                                            </span>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    user.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                            </div>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleUserActive(user.id, !user.is_active)}
                                            className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                                user.is_active
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                            }`}
                                        >
                                            {user.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && users.length === 0 && (
                        <div className="w-full text-center py-12 bg-white rounded-lg shadow">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                No users have been registered yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;