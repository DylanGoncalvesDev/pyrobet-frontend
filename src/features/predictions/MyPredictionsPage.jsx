import { useCallback, useEffect, useState } from 'react';
import {
    deletePrediction,
    getMatches,
    getMyPredictions,
    updatePrediction
} from '../../services/matchService';
import './Predictions.css';

function formatDate(date) {
    if (!date) {
        return 'Fecha no disponible';
    }

    const normalizedDate = String(date).includes('T')
        ? date
        : String(date).replace(' ', 'T');

    const parsedDate = new Date(normalizedDate);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(parsedDate);
}

function getPredictionStatus(status) {
    const statuses = {
        pending: 'Pendiente',
        correct: 'Acertada',
        incorrect: 'No acertada'
    };

    return statuses[String(status ?? '').toLowerCase()] ?? 'Desconocido';
}

function getPredictionOutcome(prediction) {
    const outcomes = {
        home: 'Victoria local',
        draw: 'Empate',
        away: 'Victoria visitante'
    };

    return outcomes[String(prediction ?? '').toLowerCase()] ?? 'Resultado';
}

function getPoints(points) {
    const value = Number(points);

    return Number.isFinite(value) ? value : 0;
}

function getMatchStatus(match) {
    const matchDate = String(match?.date ?? '').replace(' ', 'T');
    const parsedDate = new Date(matchDate);

    return (
        String(match?.status ?? '').toLowerCase() === 'upcoming' &&
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.getTime() > Date.now()
    );
}

function MyPredictionsPage() {
    const [predictions, setPredictions] = useState([]);
    const [matches, setMatches] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState('');
    const [notice, setNotice] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [homeScore, setHomeScore] = useState('');
    const [awayScore, setAwayScore] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const [predictionsResult, matchesResult] =
                await Promise.allSettled([
                    getMyPredictions(),
                    getMatches()
                ]);

            if (predictionsResult.status === 'rejected') {
                throw predictionsResult.reason;
            }

            setPredictions(predictionsResult.value);

            setMatches(
                matchesResult.status === 'fulfilled'
                    ? matchesResult.value
                    : []
            );
        } catch (error) {
            setError(
                error.response?.data?.message ??
                'No se han podido cargar tus predicciones.'
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const matchesById = new Map(
        matches.map((match) => [Number(match.id), match])
    );

    const predictionsWithMatches = predictions.map((prediction) => ({
        ...prediction,
        match: matchesById.get(Number(prediction.match_id))
            ?? prediction.match
            ?? {}
    }));

    const sortedPredictions = [...predictionsWithMatches].sort((a, b) => {
        const dateA = new Date(
            String(a.match?.date ?? '').replace(' ', 'T')
        ).getTime();

        const dateB = new Date(
            String(b.match?.date ?? '').replace(' ', 'T')
        ).getTime();

        return (Number.isNaN(dateB) ? 0 : dateB) -
            (Number.isNaN(dateA) ? 0 : dateA);
    });

    const totalPredictions = predictions.length;

    const correctPredictions = predictions.filter(
        (prediction) =>
            String(prediction.status).toLowerCase() === 'correct'
    ).length;

    const totalPoints = predictions.reduce(
        (total, prediction) =>
            total + getPoints(prediction.points),
        0
    );

    function openEditForm(prediction) {
        setEditingId(prediction.id);
        setHomeScore(String(prediction.home_score_prediction));
        setAwayScore(String(prediction.away_score_prediction));
        setActionError('');
        setNotice('');
    }

    function closeEditForm() {
        setEditingId(null);
        setHomeScore('');
        setAwayScore('');
        setActionError('');
    }

    async function handleUpdate(event, prediction) {
        event.preventDefault();

        setActionError('');
        setNotice('');

        if (homeScore.trim() === '' || awayScore.trim() === '') {
            setActionError('Introduce el marcador de ambos equipos.');
            return;
        }

        const homeScoreNumber = Number(homeScore);
        const awayScoreNumber = Number(awayScore);

        const validScores =
            Number.isSafeInteger(homeScoreNumber) &&
            Number.isSafeInteger(awayScoreNumber) &&
            homeScoreNumber >= 0 &&
            awayScoreNumber >= 0;

        if (!validScores) {
            setActionError(
                'Los marcadores deben ser números enteros mayores o iguales a cero.'
            );
            return;
        }

        let result = 'draw';

        if (homeScoreNumber > awayScoreNumber) {
            result = 'home';
        } else if (homeScoreNumber < awayScoreNumber) {
            result = 'away';
        }

        setIsSaving(true);

        try {
            const response = await updatePrediction(
                prediction.id,
                {
                    prediction: result,
                    home_score_prediction: homeScoreNumber,
                    away_score_prediction: awayScoreNumber
                }
            );

            setEditingId(null);
            setHomeScore('');
            setAwayScore('');

            setNotice(
                response.message || 'Predicción actualizada correctamente.'
            );

            await loadData();
        } catch (error) {
            setActionError(
                error.response?.data?.message ??
                'No se ha podido actualizar la predicción.'
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(prediction, match) {
        const confirmed = window.confirm(
            `¿Quieres eliminar tu predicción para ${match.home_team?.name ?? 'el equipo local'} contra ${match.away_team?.name ?? 'el equipo visitante'}?`
        );

        if (!confirmed) {
            return;
        }

        setDeletingId(prediction.id);
        setActionError('');
        setNotice('');

        try {
            const response = await deletePrediction(prediction.id);

            setPredictions((previousPredictions) =>
                previousPredictions.filter(
                    (item) => item.id !== prediction.id
                )
            );

            if (editingId === prediction.id) {
                closeEditForm();
            }

            setNotice(
                response.message || 'Predicción eliminada correctamente.'
            );
        } catch (error) {
            setActionError(
                error.response?.data?.message ??
                'No se ha podido eliminar la predicción.'
            );
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <main className="my-predictions-page">
            <header className="my-predictions-header">
                <span className="my-predictions-eyebrow">
                    YOUR ACTIVITY
                </span>

                <h1>Mis predicciones</h1>

                <p>
                    Consulta tus pronósticos, resultados y puntos obtenidos.
                </p>
            </header>

            {notice && (
                <div className="my-predictions-message my-predictions-message--success">
                    {notice}
                </div>
            )}

            {actionError && (
                <div
                    className="my-predictions-message my-predictions-message--error"
                    role="alert"
                >
                    {actionError}
                </div>
            )}

            {!isLoading && !error && (
                <section className="prediction-stats">
                    <article className="prediction-stat">
                        <span>Total de predicciones</span>
                        <strong>{totalPredictions}</strong>
                    </article>

                    <article className="prediction-stat">
                        <span>Predicciones acertadas</span>
                        <strong>{correctPredictions}</strong>
                    </article>

                    <article className="prediction-stat prediction-stat--points">
                        <span>Puntos obtenidos</span>
                        <strong>
                            {totalPoints.toLocaleString('es-ES')}
                        </strong>
                    </article>
                </section>
            )}

            {isLoading && (
                <div className="predictions-state">
                    <span className="predictions-spinner" />
                    <p>Cargando tus predicciones...</p>
                </div>
            )}

            {error && (
                <div className="predictions-state predictions-state--error">
                    {error}
                </div>
            )}

            {!isLoading && !error && predictions.length === 0 && (
                <div className="predictions-state">
                    <h2>Todavía no tienes predicciones</h2>

                    <p>
                        Cuando registres un pronóstico, aparecerá aquí
                        junto con su estado y los puntos obtenidos.
                    </p>
                </div>
            )}

            {!isLoading && !error && sortedPredictions.length > 0 && (
                <section className="my-predictions-list">
                    {sortedPredictions.map((prediction) => {
                        const match = prediction.match ?? {};

                        const homeTeam =
                            match.home_team?.name ??
                            match.homeTeam?.name ??
                            'Equipo local';

                        const awayTeam =
                            match.away_team?.name ??
                            match.awayTeam?.name ??
                            'Equipo visitante';

                        const status = String(
                            prediction.status ?? 'pending'
                        ).toLowerCase();

                        const hasActualScore =
                            match.home_team_score != null &&
                            match.away_team_score != null;

                        const canManage =
                            status === 'pending' &&
                            getMatchStatus(match);

                        const isEditing = editingId === prediction.id;

                        return (
                            <article
                                key={prediction.id}
                                className="my-prediction-card"
                            >
                                <div className="my-prediction-card__header">
                                    <span className="my-prediction-card__competition">
                                        {match.competition?.name ?? 'Competición'}
                                    </span>

                                    <span
                                        className={`my-prediction-status my-prediction-status--${status}`}
                                    >
                                        {getPredictionStatus(status)}
                                    </span>
                                </div>

                                <div className="my-prediction-card__date">
                                    {formatDate(match.date)}
                                </div>

                                <div className="my-prediction-card__teams">
                                    <div className="my-prediction-team my-prediction-team--home">
                                        <span>{homeTeam}</span>
                                    </div>

                                    <div className="my-prediction-score">
                                        <span>
                                            {prediction.home_score_prediction}
                                        </span>

                                        <span>:</span>

                                        <span>
                                            {prediction.away_score_prediction}
                                        </span>

                                        <small>Tu pronóstico</small>
                                    </div>

                                    <div className="my-prediction-team my-prediction-team--away">
                                        <span>{awayTeam}</span>
                                    </div>
                                </div>

                                {hasActualScore && (
                                    <div className="my-prediction-actual-score">
                                        <span>Resultado real</span>

                                        <strong>
                                            {match.home_team_score}
                                            {' : '}
                                            {match.away_team_score}
                                        </strong>
                                    </div>
                                )}

                                <div className="my-prediction-card__footer">
                                    <span>
                                        {getPredictionOutcome(prediction.prediction)}
                                    </span>

                                    <strong className="my-prediction-points">
                                        {getPoints(prediction.points)} pts
                                    </strong>
                                </div>

                                {canManage && !isEditing && (
                                    <div className="my-prediction-actions">
                                        <button
                                            type="button"
                                            className="my-prediction-edit-button"
                                            onClick={() => openEditForm(prediction)}
                                        >
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            className="my-prediction-delete-button"
                                            onClick={() => handleDelete(prediction, match)}
                                            disabled={deletingId === prediction.id}
                                        >
                                            {deletingId === prediction.id
                                                ? 'Eliminando...'
                                                : 'Eliminar'}
                                        </button>
                                    </div>
                                )}

                                {isEditing && (
                                    <form
                                        className="my-prediction-edit-form"
                                        onSubmit={(event) =>
                                            handleUpdate(event, prediction)
                                        }
                                    >
                                        <h3>Editar predicción</h3>

                                        <div className="my-prediction-edit-fields">
                                            <label>
                                                {homeTeam}

                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={homeScore}
                                                    onChange={(event) =>
                                                        setHomeScore(event.target.value)
                                                    }
                                                    required
                                                />
                                            </label>

                                            <span>:</span>

                                            <label>
                                                {awayTeam}

                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={awayScore}
                                                    onChange={(event) =>
                                                        setAwayScore(event.target.value)
                                                    }
                                                    required
                                                />
                                            </label>
                                        </div>

                                        <div className="my-prediction-edit-actions">
                                            <button
                                                type="submit"
                                                className="my-prediction-edit-button"
                                                disabled={isSaving}
                                            >
                                                {isSaving
                                                    ? 'Guardando...'
                                                    : 'Guardar cambios'}
                                            </button>

                                            <button
                                                type="button"
                                                className="my-prediction-cancel-button"
                                                onClick={closeEditForm}
                                                disabled={isSaving}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </article>
                        );
                    })}
                </section>
            )}
        </main>
    );
}

export default MyPredictionsPage;