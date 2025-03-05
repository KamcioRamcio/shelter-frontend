import API_BASE_URL from './apiConfig.ts';

type ApiResponse = {
    success: boolean;
    data: {
        is_completed: boolean;
        is_shelter?: boolean;
        error?: string;
    };
};

const profileApi = {
    checkProfileStatus: async (): Promise<ApiResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/profile/status/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            return {
                success: true,
                data: {
                    is_completed: data.is_completed,
                    is_shelter: data.is_shelter
                }
            };
        } catch (error) {
            console.error('Error fetching profile status:', error);
            return {
                success: false,
                data: {
                    is_completed: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            };
        }
    }
};

export default profileApi;
