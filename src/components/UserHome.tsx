import React, {useState, useEffect, useRef, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, PanInfo } from 'framer-motion';
import API_BASE_URL from '../api/apiConfig.ts';

interface PetImage{
    id: number;
    image: string;
    is_main_image: boolean;
}

interface Pet {
    id: number;
    name: string;
    species: string;
    breed: string;
    age: number;
    images: PetImage[];
    description: string;
    shelter_name: string;
    shelter_distance: number;
}

interface ProfilePhoto {
    id: number;
    photo: string;
    is_profile_photo: boolean;
    user: number;
}

interface UserInfo {
    first_name: string;
    last_name: string;
    email: string;
    location: string;
    phone_number: string;
    photos?: ProfilePhoto[];
    preferences?: {
        species: string[];
        max_age?: number;
        max_distance?: number;
    };
}

const UserHome: React.FC = () => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [currentPetIndex, setCurrentPetIndex] = useState(0);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadedAllPets, setLoadedAllPets] = useState(false);
    const navigate = useNavigate();
    const swipeCardRef = useRef<HTMLDivElement>(null);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const batchSize = 3;
    const loadMoreThreshold = 2;

    useEffect(() => {
        fetchUserInfo();
        fetchPets();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/profile/user/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setUserInfo(data);
            } else {
                console.error('Failed to fetch user info:', response.status);
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    const fetchPets = useCallback(async () => {
        if (isLoading || loadedAllPets) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const offset = pets.length;

            const response = await fetch(`${API_BASE_URL}/shelters/pets/all/?limit=${batchSize}&offset=${offset}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.length === 0) {
                    setLoadedAllPets(true);
                } else {
                    setPets(prevPets => [...prevPets, ...data]);
                }
            } else {
                console.error('Failed to fetch pets:', response.status);
            }
        } catch (error) {
            console.error('Error fetching pets:', error);
        } finally {
            setIsLoading(false);
        }
    }, [pets.length, isLoading, loadedAllPets]);

    useEffect(() => {
        if (!loadedAllPets && !isLoading && pets.length - currentPetIndex <= loadMoreThreshold) {
            fetchPets();
        }
    }, [currentPetIndex, pets.length, loadedAllPets, isLoading, fetchPets]);

    const handleSwipe = async (petId: number, liked: boolean) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/swipes/user/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    pet: petId,
                    liked: liked
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Swipe error:', errorData);
                throw new Error(`Swipe failed: ${JSON.stringify(errorData)}`);
            }

            setCurrentPetIndex(prev => prev + 1);
        } catch (error) {
            console.error('Error recording swipe:', error);
        }
    };

    const handleDragEnd = (info: PanInfo) => {
        const threshold = 100;
        const pet = pets[currentPetIndex];

        if (!pet) return;

        if (info.offset.x > threshold) {
            handleSwipe(pet.id, true);
        } else if (info.offset.x < -threshold) {
            handleSwipe(pet.id, false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    const currentPet = pets[currentPetIndex];

    const handlePhotoClick = () => {
        setIsPhotoModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex">
            {/* User Widget - Left Sidebar */}
            <div className="w-1/4 bg-white shadow-lg p-6 m-4 rounded-2xl">
                <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                        <button
                            onClick={handlePhotoClick}
                            className="w-32 h-32 rounded-full overflow-hidden mb-4 hover:opacity-90 transition-opacity"
                        >
                            <img
                                src={userInfo?.photos?.find(photo => photo.is_profile_photo)?.photo || '/default-avatar.png'}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </button>
                        {/*Photos Showdown*/}
                        {isPhotoModalOpen && (
                            <div className="fixed inset-0 bg-opacity-75 flex items-center justify-center bg-transparent">
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    <button
                                        onClick={() => setIsPhotoModalOpen(false)}
                                        className="absolute top-72 right-72 m-4 text-gray-600 hover:text-gray-800"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                    <div className="flex space-x-4">
                                        {userInfo?.photos?.map(photo => (
                                            <img
                                                key={photo.id}
                                                src={photo.photo}
                                                alt="Profile"
                                                className="w-32 h-32 object-cover rounded-lg"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {userInfo?.first_name} {userInfo?.last_name}
                    </h2>
                    <p className="text-gray-600 mb-4">{userInfo?.location}</p>

                    <div className="w-full space-y-4">
                        <button
                            onClick={() => navigate('/profile-customize')}
                            className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 px-4 rounded-lg flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                            </svg>
                            Preferences
                        </button>

                        <button
                            onClick={() => navigate('/matches')}
                            className="w-full bg-pink-100 hover:bg-pink-200 text-pink-700 py-2 px-4 rounded-lg flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                            My Matches
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Swipe Area - Middle Section */}
            <div className="flex-1 flex items-center justify-center p-4">
                {currentPet ? (
                    <motion.div
                        ref={swipeCardRef}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(_, info) => handleDragEnd(info)}
                        className="w-[480px] h-[640px] bg-white rounded-3xl shadow-xl overflow-hidden relative"
                    >
                        <img
                            src={currentPet.images.find(img => img.is_main_image)?.image || currentPet.images[0]?.image || '/default-pet-image.jpg'}
                            alt={currentPet.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                            <h3 className="text-3xl font-bold mb-2">{currentPet.name}</h3>
                            <p className="text-lg mb-1">{currentPet.breed} • {currentPet.age} years</p>
                            <p className="text-sm mb-2">{currentPet.description}</p>
                            <div className="flex items-center text-sm">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                                {currentPet.shelter_name} • {currentPet.shelter_distance} miles away
                            </div>
                        </div>
                    </motion.div>
                ) : isLoading ? (
                    <div className="text-center text-gray-600">
                        <p className="text-2xl mb-4">Loading pets...</p>
                    </div>
                ) : (
                    <div className="text-center text-gray-600">
                        <p className="text-2xl mb-4">No more pets to show!</p>
                        <p>Check back later or adjust your preferences</p>
                    </div>
                )}

                {currentPet && (
                    <div className="absolute bottom-8 flex space-x-4">
                        <button
                            onClick={() => handleSwipe(currentPet.id, false)}
                            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-red-500 hover:bg-red-50"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                        <button
                            onClick={() => handleSwipe(currentPet.id, true)}
                            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-green-500 hover:bg-green-50"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserHome;