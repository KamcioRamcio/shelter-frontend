import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../api/apiConfig';

interface ProfileData {
    bio: string;
    photos: File[];
}

const ProfileCustomize: React.FC = () => {
    const [profileData, setProfileData] = useState<ProfileData>({
        bio: '',
        photos: []
    });
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(`${API_BASE_URL}/profile/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setProfileData(prevData => ({
                        ...prevData,
                        bio: data.bio || ''
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch profile data', err);
            }
        };

        fetchProfileData();
    }, []);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setProfileData(prev => ({
                ...prev,
                photos: [...prev.photos, ...files]
            }));

            // Create preview URLs
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPhotoPreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removePhoto = (index: number) => {
        setProfileData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const token = localStorage.getItem('access_token');
            const formData = new FormData();
            formData.append('bio', profileData.bio);
            profileData.photos.forEach(photo => {
                formData.append('photos', photo);
            });

            const response = await fetch(`${API_BASE_URL}/profile/customize/user/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                if (data.is_shelter) {
                    navigate('/shelter/home');
                } else {
                    navigate('/user/home');
                }
            } else {
                setError(data.detail || 'Profile customization failed');
            }
        } catch (err) {
            setError('Network error occurred');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Complete Your Profile</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={profileData.bio}
                            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                            required
                            className="text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Tell us about yourself"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Photos</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoChange}
                            className="mt-1 block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                        />
                    </div>

                    {photoPreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {photoPreviews.map((preview, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-24 object-cover rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                    >
                        Save Profile
                    </button>
                </form>
                {error && (
                    <div className="mt-4 text-red-500 text-sm">
                        <p>{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileCustomize;