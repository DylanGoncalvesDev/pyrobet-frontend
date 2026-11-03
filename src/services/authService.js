import api from './api';

export async function login(email, password) {
    const { data } = await api.post('/login', {
        email,
        password
    });

    return data;
}

export async function register(
    name,
    email,
    password,
    password_confirmation,
    secret_code = null
) {
    const payload = {
        name,
        email,
        password,
        password_confirmation
    };

    if (typeof secret_code === 'string' && secret_code.trim()) {
        payload.secret_code = secret_code.trim();
    }

    const { data } = await api.post('/register', payload);

    return data;
}