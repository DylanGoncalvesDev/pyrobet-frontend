import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
    createMatch,
    createPrediction,
    deleteMatch,
    getCompetitions,
    getMatches,
    getMyPredictions,
    getTeams,
    updateMatch
} from '../../services/matchService';
import MatchCard from './components/MatchCard';
import MatchForm from './components/MatchForm';
import './matches.css';

function getErrorMessage(error, fallback) {
    return error.response?.data?.message || fallback;
}

function MatchesPage() {
    const { isAuthenticated, role } = useAuth();

    const normalizedRole = String(role || '').toLowerCase();
    const isAdmin = isAuthenticated && normalizedRole === 'admin';
    const isRegularUser = isAuthenticated && normalizedRole === 'user';

    const [matches, setMatches] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [teams, setTeams] = useState([]);
    const [competitions, setCompetitions] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [predictionError, setPredictionError] = useState('');
    const [adminDataError, setAdminDataError] = useState('');
    const [actionError, setActionError] = useState('');
    const [notice, setNotice] = useState('');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMatch, setEditingMatch] = useState(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setLoadError('');
        setPredictionError('');
        setAdminDataError('');

        const results = await Promise.allSettled([
            getMatches(),
            isAuthenticated ? getMyPredictions() : Promise.resolve([]),
            isAdmin ? getTeams() : Promise.resolve([]),
            isAdmin ? getCompetitions() : Promise.resolve([])
        ]);

        const [
            matchesResult,
            predictionsResult,
            teamsResult,
            competitionsResult
        ] = results;

        if (matchesResult.status === 'fulfilled') {
            setMatches(matchesResult.value);
        } else {
            setMatches([]);
            setLoadError(
                getErrorMessage(
                    matchesResult.reason,
                    'No se han podido cargar los partidos.'
                )
            );
        }

        if (predictionsResult.status === 'fulfilled') {
            setPredictions(predictionsResult.value);
        } else {
            setPredictions([]);
            setPredictionError(
                getErrorMessage(
                    predictionsResult.reason,
                    'No se han podido cargar tus predicciones.'
                )
            );
        }

        if (teamsResult.status === 'fulfilled') {
            setTeams(teamsResult.value);
        } else {
            setTeams([]);
            setAdminDataError(
                getErrorMessage(
                    teamsResult.reason,
                    'No se han podido cargar los equipos.'
                )
            );
        }

        if (competitionsResult.status === 'fulfilled') {
            setCompetitions(competitionsResult.value);
        } else {
            setCompetitions([]);
            setAdminDataError((previousError) => (
                previousError
                    ? `${previousError} No se han podido cargar las competiciones.`
                    : 'No se han podido cargar las competiciones.'
            ));
        }

        setIsLoading(false);
    }, [isAuthenticated, isAdmin]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    async function handlePredictionSubmit(payload) {
        setActionError('');
        setNotice('');

        const response = await createPrediction(payload);

        setNotice(response.message || 'Predicción registrada correctamente.');

        await loadData();
    }

    async function handleSaveMatch(payload) {
        setActionError('');
        setNotice('');

        try {
            const response = editingMatch
                ? await updateMatch(editingMatch.id, payload)
                : await createMatch(payload);

            setNotice(
                response.message ||
                (
                    editingMatch
                        ? 'Partido actualizado correctamente.'
                        : 'Partido creado correctamente.'
                )
            );

            setIsFormOpen(false);
            setEditingMatch(null);

            await loadData();
        } catch (error) {
            setActionError(
                getErrorMessage(
                    error,
                    'No se ha podido guardar el partido.'
                )
            );

            throw error;
        }
    }

    async function handleDeleteMatch(match) {
        const confirmed = window.confirm(
            `¿Quieres eliminar el partido entre ${match.home_team?.name || 'el equipo local'} y ${match.away_team?.name || 'el equipo visitante'}?`
        );

        if (!confirmed) {
            return;
        }

        setActionError('');
        setNotice('');

        try {
            const response = await deleteMatch(match.id);

            setNotice(response.message || 'Partido eliminado correctamente.');

            await loadData();
        } catch (error) {
            setActionError(
                getErrorMessage(
                    error,
                    'No se ha podido eliminar el partido.'
                )
            );
        }
    }

    function openCreateForm() {
        setEditingMatch(null);
        setIsFormOpen(true);
    }

    function openEditForm(match) {
        setEditingMatch(match);
        setIsFormOpen(true);
    }

    function closeForm() {
        setIsFormOpen(false);
        setEditingMatch(null);
    }

    return (
        <main className="matches-page">
            <header className="matches-page__header">
                <div>
                    <span className="matches-page__eyebrow">
                        PYROBET SPORTS
                    </span>

                    <h1 className="matches-page__title">
                        Partidos y predicciones
                    </h1>

                    <p className="matches-page__description">
                        Consulta los encuentros y registra tus pronósticos
                        antes del inicio de cada partido.
                    </p>
                </div>

                {isAdmin && (
                    <button
                        type="button"
                        className="match-button match-button--primary matches-page__create"
                        onClick={openCreateForm}
                    >
                        Crear nuevo partido
                    </button>
                )}
            </header>

            {notice && (
                <p className="matches-message matches-message--success" role="status">
                    {notice}
                </p>
            )}

            {actionError && (
                <p className="matches-message matches-message--error" role="alert">
                    {actionError}
                </p>
            )}

            {loadError && (
                <p className="matches-message matches-message--error" role="alert">
                    {loadError}
                </p>
            )}

            {predictionError && (
                <p className="matches-message matches-message--error" role="alert">
                    {predictionError}
                </p>
            )}

            {isAdmin && adminDataError && (
                <p className="matches-message matches-message--error" role="alert">
                    {adminDataError}
                </p>
            )}

            {isLoading ? (
                <div className="matches-state">
                    <span className="matches-state__spinner" />
                    <p>Cargando partidos...</p>
                </div>
            ) : matches.length === 0 && !loadError ? (
                <div className="matches-state">
                    <h2>No hay partidos disponibles</h2>
                    <p>Vuelve más tarde para consultar nuevos encuentros.</p>
                </div>
            ) : (
                <section className="matches-grid" aria-label="Lista de partidos">
                    {matches.map((match) => {
                        const previousPrediction = predictions.find(
                            (item) => Number(item.match_id) === Number(match.id)
                        );

                        return (
                            <MatchCard
                                key={match.id}
                                match={match}
                                previousPrediction={previousPrediction}
                                isAuthenticated={isAuthenticated}
                                isRegularUser={isRegularUser}
                                isAdmin={isAdmin}
                                onSubmitPrediction={handlePredictionSubmit}
                                onEdit={openEditForm}
                                onDelete={handleDeleteMatch}
                            />
                        );
                    })}
                </section>
            )}

            {isFormOpen && isAdmin && (
                <MatchForm
                    key={editingMatch?.id ?? 'new-match'}
                    match={editingMatch}
                    teams={teams}
                    competitions={competitions}
                    onSubmit={handleSaveMatch}
                    onCancel={closeForm}
                />
            )}
        </main>
    );
}

export default MatchesPage;