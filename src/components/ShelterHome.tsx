import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../api/apiConfig.ts';

interface PetImages {
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
    images: PetImages[];
    status: string;
}

interface ShelterInfo {
    name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    phone: string;
    email: string;
}

const ShelterHome: React.FC = () => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [shelterInfo, setShelterInfo] = useState<ShelterInfo | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchShelterInfo();
        fetchShelterPets();
    }, []);

    const fetchShelterInfo = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/shelters/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setShelterInfo(data[0]);
            }
        } catch (error) {
            console.error('Error fetching shelter info:', error);
        }
    };
    const fetchShelterPets = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/shelters/pets/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setPets(data);
            }
        } catch (error) {
            console.error('Error fetching pets:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/shelters/pets/${id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setPets(prevPets => prevPets.filter(pet => pet.id !== id));
            }
        } catch (error) {
            console.error('Error deleting pet:', error);
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Shelter Info Widget */}
            <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {shelterInfo?.name}
                    </h1>
                    <button
                        onClick={() => navigate('/shelter-profile-customize')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        Settings
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-gray-600">
                    <div>
                        <p><span className="font-semibold">Address:</span> {shelterInfo?.address}</p>
                        <p><span className="font-semibold">City:</span> {shelterInfo?.city}</p>
                        <p><span className="font-semibold">State:</span> {shelterInfo?.state}</p>
                    </div>
                    <div>
                        <p><span className="font-semibold">Zip Code:</span> {shelterInfo?.zip_code}</p>
                        <p><span className="font-semibold">Phone:</span> {shelterInfo?.phone}</p>
                        <p><span className="font-semibold">Email:</span> {shelterInfo?.email}</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Our Pets</h2>
                <button
                    onClick={() => navigate('/shelter/add-pet')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Add Pet
                </button>
            </div>

            {/* Pets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {pets.map((pet) => (
                    <div key={pet.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="h-48 overflow-hidden">

                            <img
                                src={pet.images.find(img => img.is_main_image)?.image || pet.images[0]?.image || '/default-pet-image.jpg'}
                                alt={pet.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{pet.name}</h3>
                            <div className="text-sm text-gray-600">
                                <p>Species: {pet.species}</p>
                                <p>Breed: {pet.breed}</p>
                                <p>Age: {pet.age} years</p>
                                <p className="mt-2">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        pet.status === 'available'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {pet.status}
                                    </span>
                                </p>
                            </div>
                            <button
                                onClick={() => navigate(`/pets/${pet.id}`)}
                                className="mt-4 w-full bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-md text-sm font-medium"
                            >
                                View Details
                            </button>
                            <button
                                onClick={() => handleDelete(pet.id)}
                                className="mt-2 w-full bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-md text-sm font-medium"
                            >
                                Delete Pet
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {pets.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No pets added yet.</p>
                    <p className="text-gray-400">Click the "Add Pet" button to get started.</p>
                </div>
            )}
        </div>
    );
};

export default ShelterHome;