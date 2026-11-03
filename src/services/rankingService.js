import api from './api';

export async function getRanking() {
    const { data } = await api.get('/ranking');
    return data;
}