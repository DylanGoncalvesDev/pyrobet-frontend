import api from './api';

export async function getMatches() {
    const { data } = await api.get('/matches');

    return data.matches ?? [];
}

export async function getMyPredictions() {
    const { data } = await api.get('/predictions');

    return data.predictions ?? [];
}

export async function createPrediction({
    match_id,
    prediction,
    home_score_prediction,
    away_score_prediction
}) {
    const { data } = await api.post('/predictions', {
        match_id,
        prediction,
        home_score_prediction,
        away_score_prediction
    });

    return data;
}

export async function getTeams() {
    const { data } = await api.get('/teams');

    return data.teams ?? [];
}

export async function getCompetitions() {
    const { data } = await api.get('/competitions');

    return data.competitions ?? [];
}

export async function createMatch(matchData) {
    const { data } = await api.post('/matches', matchData);

    return data;
}

export async function updateMatch(id, matchData) {
    const { data } = await api.put(`/matches/${id}`, matchData);

    return data;
}

export async function deleteMatch(id) {
    const { data } = await api.delete(`/matches/${id}`);

    return data;
}

export async function updatePrediction(id, predictionData) {
    const { data } = await api.put(
        `/predictions/${id}`,
        predictionData
    );

    return data;
}

export async function deletePrediction(id) {
    const { data } = await api.delete(`/predictions/${id}`);

    return data;
}