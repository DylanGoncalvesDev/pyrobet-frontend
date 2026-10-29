import { useState } from 'react';
import { Link } from 'react-router';

function getLogoUrl(logo) {
    if (!logo) {
        return '';
    }

    if (/^https?:\/\//i.test(logo)) {
        return logo;
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
    const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, '');
    const normalizedLogo = logo.replace(/^\/+/, '');

    if (normalizedLogo.startsWith('storage/')) {
        return `${apiOrigin}/${normalizedLogo}`;
    }

    return `${apiOrigin}/storage/${normalizedLogo}`;
}

function formatMatchDate(date) {
    if (!date) {
        return 'Date unavailable';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'Date unavailable';
    }

    return new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(parsedDate);
}

function TeamDisplay({ team, fallbackName }) {
    const [logoFailed, setLogoFailed] = useState(false);

    const name = team?.name ?? fallbackName;
    const logoUrl = getLogoUrl(team?.logo);

    return (
        <div className="match-team">
            <div className="match-team-logo">
                {logoUrl && !logoFailed ? (
                    <img
                        src={logoUrl}
                        alt={name}
                        onError={() => setLogoFailed(true)}
                    />
                ) : (
                    <span className="match-team-fallback">
                        {name.slice(0, 2).toUpperCase()}
                    </span>
                )}
            </div>

            <span className="match-team-name">{name}</span>
        </div>
    );
}

function getPredictionStatus(status) {
    const statuses = {
        pending: 'Pending',
        correct: 'Correct',
        incorrect: 'Incorrect'
    };

    return statuses[status] ?? status ?? 'Pending';
}

export default function MatchCard({
    match,
    previousPrediction,
    isAuthenticated,
    isRegularUser,
    isAdmin,
    onSubmitPrediction,
    onEdit,
    onDelete
}) {
    const [homeScore, setHomeScore] = useState('');
    const [awayScore, setAwayScore] = useState('');
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const homeTeam = match.home_team ?? match.homeTeam ?? {};
    const awayTeam = match.away_team ?? match.awayTeam ?? {};
    const competition = match.competition ?? {};

    const homeTeamName = homeTeam.name ?? 'Home team';
    const awayTeamName = awayTeam.name ?? 'Away team';

    const matchDate = new Date(match.date);
    const isFutureMatch =
        !Number.isNaN(matchDate.getTime()) &&
        matchDate.getTime() > Date.now();

    const matchStatus = String(match.status ?? '').toLowerCase();
    const isUpcoming = matchStatus === 'upcoming';

    const canPredict =
        isRegularUser &&
        isAuthenticated &&
        isUpcoming &&
        isFutureMatch &&
        !previousPrediction;

    const canRegisterAsGuest =
        !isAuthenticated &&
        isUpcoming &&
        isFutureMatch;

    async function handleSubmit(event) {
        event.preventDefault();
        setFormError('');

        if (homeScore.trim() === '' || awayScore.trim() === '') {
            setFormError('Enter the score for both teams.');
            return;
        }

        const homeScoreNumber = Number(homeScore);
        const awayScoreNumber = Number(awayScore);

        const validScores =
            Number.isInteger(homeScoreNumber) &&
            Number.isInteger(awayScoreNumber) &&
            homeScoreNumber >= 0 &&
            awayScoreNumber >= 0;

        if (!validScores) {
            setFormError('Scores must be whole numbers greater than or equal to zero.');
            return;
        }

        let prediction = 'draw';

        if (homeScoreNumber > awayScoreNumber) {
            prediction = 'home';
        } else if (homeScoreNumber < awayScoreNumber) {
            prediction = 'away';
        }

        setIsSubmitting(true);

        try {
            await onSubmitPrediction({
                match_id: match.id,
                prediction,
                home_score_prediction: homeScoreNumber,
                away_score_prediction: awayScoreNumber
            });

            setHomeScore('');
            setAwayScore('');
        } catch {
            setFormError('The prediction could not be saved. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <article className="match-card">
            <div className="match-card-header">
                <div className="match-competition">
                    {competition.name ?? 'Competition'}
                </div>

                <span className={`match-status match-status-${matchStatus}`}>
                    {matchStatus || 'Unknown'}
                </span>
            </div>

            <div className="match-teams">
                <TeamDisplay
                    team={homeTeam}
                    fallbackName={homeTeamName}
                />

                <span className="match-vs">VS</span>

                <TeamDisplay
                    team={awayTeam}
                    fallbackName={awayTeamName}
                />
            </div>

            <div className="match-date">
                {formatMatchDate(match.date)}
            </div>

            {match.location && (
                <div className="match-location">
                    {match.location}
                </div>
            )}

            {matchStatus === 'finished' &&
                match.home_team_score != null &&
                match.away_team_score != null && (
                    <div className="match-final-score">
                        <span>Final score</span>
                        <strong>
                            {match.home_team_score} - {match.away_team_score}
                        </strong>
                    </div>
                )}

            <div className="prediction-panel">
                {isAdmin && (
                    <div className="match-admin-actions">
                        <button
                            type="button"
                            className="admin-button"
                            onClick={() => onEdit(match)}
                        >
                            Edit match
                        </button>

                        <button
                            type="button"
                            className="admin-button admin-button-danger"
                            onClick={() => onDelete(match.id)}
                        >
                            Delete match
                        </button>
                    </div>
                )}

                {canRegisterAsGuest && (
                    <Link
                        to="/login"
                        className="guest-prediction-button"
                    >
                        Registrar predicción
                    </Link>
                )}

                {canPredict && (
                    <form
                        className="prediction-form"
                        onSubmit={handleSubmit}
                    >
                        <h3>Your prediction</h3>

                        <div className="prediction-score-fields">
                            <label className="prediction-score-field">
                                <span>{homeTeamName}</span>

                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    inputMode="numeric"
                                    value={homeScore}
                                    onChange={(event) =>
                                        setHomeScore(event.target.value)
                                    }
                                    aria-label={`${homeTeamName} predicted goals`}
                                    required
                                />
                            </label>

                            <span className="prediction-score-separator">
                                -
                            </span>

                            <label className="prediction-score-field">
                                <span>{awayTeamName}</span>

                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    inputMode="numeric"
                                    value={awayScore}
                                    onChange={(event) =>
                                        setAwayScore(event.target.value)
                                    }
                                    aria-label={`${awayTeamName} predicted goals`}
                                    required
                                />
                            </label>
                        </div>

                        {formError && (
                            <p className="prediction-form-error" role="alert">
                                {formError}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="prediction-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? 'Saving prediction...'
                                : 'Save prediction'}
                        </button>
                    </form>
                )}

                {isAuthenticated &&
                    isRegularUser &&
                    previousPrediction && (
                        <div className="previous-prediction">
                            <h3>Your registered prediction</h3>

                            <div className="previous-prediction-score">
                                {previousPrediction.home_score_prediction}
                                {' - '}
                                {previousPrediction.away_score_prediction}
                            </div>

                            <p>
                                Status:{' '}
                                {getPredictionStatus(previousPrediction.status)}
                            </p>

                            {previousPrediction.points != null && (
                                <p>
                                    Points: {previousPrediction.points}
                                </p>
                            )}

                            <p>Your prediction is already registered.</p>
                        </div>
                    )}

                {isRegularUser &&
                    isAuthenticated &&
                    !previousPrediction &&
                    !canPredict && (
                        <p className="prediction-closed-message">
                            Predictions are unavailable for this match.
                        </p>
                    )}

                {!isAuthenticated &&
                    !canRegisterAsGuest &&
                    matchStatus !== 'finished' && (
                        <p className="prediction-closed-message">
                            Registration for this match is currently unavailable.
                        </p>
                    )}
            </div>
        </article>
    );
}