import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../api/apiConfig';

interface PetImage {
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
    description: string;
    status: string;
    location: string;
    images: PetImage[];
    shelter_name: string;
}

interface PetData {
    name: string;
    species: string;
    breed: string;
    age: number;
    description: string;
    status: string;
    location: string;
    images: PetImage[];
}

const PetDetail: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [pet, setPet] = useState<Pet | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [petData, setPetData] = useState<PetData>({
        name: '',
        species: '',
        breed: '',
        age: 0,
        description: '',
        status: '',
        location: '',
        images: [],
    });
    const [newPhotos, setNewPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

    useEffect(() => {
        const fetchPetDetails = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(`${API_BASE_URL}/shelters/pets/${id}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setPet(data);

                    if (data.images && data.images.length > 0) {
                        const mainImage = data.images.find((img: { is_main_image: any; }) => img.is_main_image);
                        setActiveImage(mainImage ? mainImage.image : data.images[0].image);
                    }
                } else {
                    setError('Failed to load pet details');
                }
            } catch (err) {
                setError('An error occurred while fetching pet details');
            } finally {
                setLoading(false);
            }
        };

        fetchPetDetails();
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setPetData((prev) => ({...prev, [name]: value}));
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewPhotos(prev => [...prev, ...files]);

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
        setNewPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingPhoto = (imageId: number) => {
        setPetData(prev => ({
            ...prev,
            images: prev.images.filter(img => img.id !== imageId)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const token = localStorage.getItem('access_token');
            const formData = new FormData();

            // Make sure we're using the current state values
            formData.append('name', petData.name);
            formData.append('species', petData.species);
            formData.append('breed', petData.breed);
            formData.append('age', String(petData.age));
            formData.append('description', petData.description);
            formData.append('status', petData.status);
            formData.append('location', petData.location);

            const imageIdsToKeep = petData.images.map(img => img.id);
            formData.append('keep_images', JSON.stringify(imageIdsToKeep));

            newPhotos.forEach(photo => {
                formData.append('new_photos', photo);
            });

            console.log("Submitting form data:");
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const response = await fetch(`${API_BASE_URL}/shelters/pets/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();

                setPet(data);
                setIsEditing(false);

                setNewPhotos([]);
                setPhotoPreviews([]);

                if (data.images && data.images.length > 0) {
                    const mainImage = data.images.find((img: { is_main_image: boolean }) => img.is_main_image);
                    setActiveImage(mainImage ? mainImage.image : data.images[0].image);
                }
            } else {
                try {
                    const errorData = await response.json();
                    setError(errorData.detail || JSON.stringify(errorData) || 'Failed to update pet details');
                } catch (jsonError) {
                    setError(`Failed to update pet details. Status: ${response.status}`);
                }
            }
        } catch (err) {
            console.error('Error updating pet:', err);
            setError('Network error occurred');
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !pet) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600 mb-6">{error || 'Pet not found'}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-blue-600 mb-6 hover:underline"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    Back
                </button>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {!isEditing ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            {/* Image gallery */}
                            <div className="p-6 bg-gray-50">
                                <div className="flex flex-col h-full">
                                    {/* Main image */}
                                    <div className="bg-white rounded-lg overflow-hidden shadow-md mb-4 h-96">
                                        {activeImage ? (
                                            <img
                                                src={activeImage}
                                                alt={pet.name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                <p className="text-gray-500">No image available</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Thumbnails */}
                                    {pet.images && pet.images.length > 0 && (
                                        <div className="flex overflow-x-auto space-x-2 pb-2">
                                            {pet.images.map((image) => (
                                                <div
                                                    key={image.id}
                                                    onClick={() => setActiveImage(image.image)}
                                                    className={`flex-shrink-0 cursor-pointer rounded-md overflow-hidden w-20 h-20 border-2 ${
                                                        activeImage === image.image
                                                            ? 'border-blue-500'
                                                            : 'border-transparent hover:border-gray-300'
                                                    }`}
                                                >
                                                    <img
                                                        src={image.image}
                                                        alt={`${pet.name} thumbnail`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                                        <p className="text-gray-600 mt-1">{pet.breed} {pet.species}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        pet.status === 'available'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                  {pet.status}
                </span>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mt-8">
                                    <div className="flex items-center">
                  <span className="text-gray-500 mr-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </span>
                                        <div>
                                            <p className="text-sm text-gray-500">Age</p>
                                            <p className="font-medium">{pet.age} years</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                  <span className="text-gray-500 mr-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </span>
                                        <div>
                                            <p className="text-sm text-gray-500">Location</p>
                                            <p className="font-medium">{pet.location}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold text-gray-900">About {pet.name}</h3>
                                    <p className="mt-2 text-gray-600 leading-relaxed">
                                        {pet.description}
                                    </p>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Shelter Information</h3>
                                    <div className="mt-4 bg-blue-50 rounded-lg p-4">
                                        <p className="font-medium">{pet.shelter_name}</p>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <button
                                        onClick={() => {
                                            setIsEditing(true);
                                            setPetData({
                                                name: pet.name,
                                                species: pet.species,
                                                breed: pet.breed,
                                                age: pet.age,
                                                description: pet.description,
                                                status: pet.status,
                                                location: pet.location,
                                                images: pet.images,
                                            });
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                                    >
                                        Edit Pet Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="flex justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Edit Pet Details</h2>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={petData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
                                        Breed
                                    </label>
                                    <input
                                        type="text"
                                        id="breed"
                                        name="breed"
                                        value={petData.breed}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                                        Age (years)
                                    </label>
                                    <input
                                        type="number"
                                        id="age"
                                        name="age"
                                        value={petData.age}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        min="0"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={petData.location}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={petData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="available">Available</option>
                                        <option value="adopted">Adopted</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={petData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Images
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {petData.images.map((image) => (
                                        <div key={image.id} className="relative">
                                            <img
                                                src={image.image}
                                                alt={`Pet image ${image.id}`}
                                                className="w-full h-24 object-cover rounded-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingPhoto(image.id)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                                            >
                                                ×
                                            </button>
                                            {image.is_main_image && (
                                                <span
                                                    className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs text-center py-1">
                        Main Image
                      </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Add New Photos
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePhotoChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>

                            {photoPreviews.length > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Photo Previews
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {photoPreviews.map((preview, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={preview}
                                                    alt={`New photo ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-md"
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
                                </div>
                            )}

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
    export default PetDetail;