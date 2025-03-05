import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API_BASE_URL from '../api/apiConfig.ts';

interface Params extends Record<string, string | undefined> {
    token?: string;
}

const Activate: React.FC = () => {
    const { token } = useParams<Params>();
    const [message, setMessage] = useState('Activating...');

    useEffect(() => {
        const activateAccount = async () => {
            if (!token) {
                setMessage('Invalid activation token');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/users/activate/${token}/`);
            const data = await response.json();
            if (response.ok) {
                setMessage(data.detail);
            } else {
                setMessage('Activation failed: ' + JSON.stringify(data));
            }
        };
        activateAccount();
    }, [token]);

    return (
        <div>
            <h2>Account Activation</h2>
            <p>{message}</p>
        </div>
    );
};

export default Activate;