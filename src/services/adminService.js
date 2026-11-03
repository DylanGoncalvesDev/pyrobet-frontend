import api from './api';

export async function getAdminStatistics() {
    const { data } = await api.get('/admin/statistics');
    return data;
}

export async function createTeam(formData) {
    const { data } = await api.post('/teams', formData);
    return data;
}

export async function updateTeam(id, formData) {
    const payload = new FormData();

    for (const [key, value] of formData.entries()) {
        payload.append(key, value);
    }

    payload.append('_method', 'PUT');

    const { data } = await api.post(`/teams/${id}`, payload);

    return data;
}

export async function deleteTeam(id) {
    const { data } = await api.delete(`/teams/${id}`);
    return data;
}

export async function createCompetition(payload) {
    const { data } = await api.post('/competitions', payload);
    return data;
}

export async function updateCompetition(id, payload) {
    const { data } = await api.put(`/competitions/${id}`, payload);
    return data;
}

export async function deleteCompetition(id) {
    const { data } = await api.delete(`/competitions/${id}`);
    return data;
}