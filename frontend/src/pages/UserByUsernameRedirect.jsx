import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function UserByUsernameRedirect() {
    const { username } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        api.getUserByUsername(username)
            .then(({ user }) => navigate(`/user/${user.id}`, { replace: true }))
            .catch(() => navigate('/', { replace: true }));
    }, [username]);

    return (
        <div className="flex items-center justify-center py-20 text-content-secondary text-sm">
            Loading profile…
        </div>
    );
}
