import { useState } from 'react';
import { Link } from 'react-router';
import '../matches.css';

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

    return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(parsedDate);
}

function TeamDisplay({ team, fallbackName, side }) {
    const [logoFailed, setLogoFailed] = useState(false);

    const name = team?.name ?? fallbackName;
    const logoUrl = getLogoUrl(team?.logo);

    return (
        <div className={`match-card__team match-card__team--${side}`}>
            <div className="match-card__crest">
                {logoUrl && !logoFailed ? (
                    <img
                        src={logoUrl}
                        alt={`${name} logo`}
                        onError={() => setLogoFailed(true)}
                    />
                ) : (
                    <span className="match-card__initials">
                        {name.slice(0, 2).toUpperCase()}
                    </span>
                )}
            </div>

            <span className="match-card__team-name" title={name}>
                {name}
            </span>
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
    const [isPredictionFormOpen, setIsPredictionFormOpen] = useState(false);

    const homeTeam = match.home_team ?? match.homeTeam ?? {};
    const awayTeam = match.away_team ?? match.awayTeam ?? {};
    const competition = match.competition ?? {};

    const homeTeamName = homeTeam.name ?? 'Home team';
    const awayTeamName = awayTeam.name ?? 'Away team';

    const parsedMatchDate = new Date(match.date);

    const isFutureMatch =
        !Number.isNaN(parsedMatchDate.getTime()) &&
        parsedMatchDate.getTime() > Date.now();

    const matchStatus = String(match.status ?? '').toLowerCase();
    const isUpcoming = matchStatus === 'upcoming';

    const canPredict =
        isAuthenticated &&
        isRegularUser &&
        isUpcoming &&
        isFutureMatch &&
        !previousPrediction;

    const canRegisterAsGuest =
        !isAuthenticated &&
        isUpcoming &&
        isFutureMatch;

    function togglePredictionForm() {
        const nextState = !isPredictionFormOpen;

        setIsPredictionFormOpen(nextState);
        setFormError('');

        if (!nextState) {
            setHomeScore('');
            setAwayScore('');
        }
    }

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
            Number.isSafeInteger(homeScoreNumber) &&
            Number.isSafeInteger(awayScoreNumber) &&
            homeScoreNumber >= 0 &&
            awayScoreNumber >= 0;

        if (!validScores) {
            setFormError(
                'Scores must be whole numbers greater than or equal to zero.'
            );
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
            setIsPredictionFormOpen(false);
        } catch {
            setFormError(
                'The prediction could not be saved. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <article className="match-card">
            <div className="match-card__meta">
                <span className="match-card__competition">
                    {competition.name ?? 'Competition'}
                </span>

                <span
                    className={`match-card__status match-card__status--${matchStatus || 'unknown'}`}
                >
                    <span className="match-card__status-dot" />
                    {matchStatus || 'Unknown'}
                </span>
            </div>

            <div className="match-card__matchup">
                <TeamDisplay
                    team={homeTeam}
                    fallbackName={homeTeamName}
                    side="home"
                />

                <div className="match-card__versus">
                    <span>VS</span>
                </div>

                <TeamDisplay
                    team={awayTeam}
                    fallbackName={awayTeamName}
                    side="away"
                />
            </div>

            {matchStatus === 'finished' &&
                match.home_team_score != null &&
                match.away_team_score != null && (
                    <div className="match-card__final-score">
                        <span>Full time</span>

                        <strong>
                            {match.home_team_score}
                            <span>:</span>
                            {match.away_team_score}
                        </strong>
                    </div>
                )}

            <div className="match-card__details">
                <div className="match-card__detail">
                    <span className="match-card__detail-label">
                        DATE & TIME
                    </span>

                    <time dateTime={match.date}>
                        {formatMatchDate(match.date)}
                    </time>
                </div>

                {match.location && (
                    <div className="match-card__detail match-card__detail--location">
                        <span className="match-card__detail-label">
                            VENUE
                        </span>

                        <span>{match.location}</span>
                    </div>
                )}
            </div>

            <div className="match-card__actions">
                {canRegisterAsGuest && (
                    <Link
                        to="/login"
                        className="match-card__guest-button"
                    >
                        Registrar predicción
                    </Link>
                )}

                {canPredict && (
                    <>
                        <button
                            type="button"
                            className="match-card__open-prediction-button"
                            onClick={togglePredictionForm}
                            aria-expanded={isPredictionFormOpen}
                            aria-controls={`prediction-form-${match.id}`}
                        >
                            {isPredictionFormOpen
                                ? 'Cancelar predicción'
                                : 'Registrar predicción'}
                        </button>

                        {isPredictionFormOpen && (
                            <form
                                id={`prediction-form-${match.id}`}
                                className="match-card__prediction-form"
                                onSubmit={handleSubmit}
                            >
                                <h3>Your prediction</h3>

                                <div className="match-card__score-inputs">
                                    <label className="match-card__score-field">
                                        <span title={homeTeamName}>
                                            {homeTeamName}
                                        </span>

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

                                    <span className="match-card__score-separator">
                                        :
                                    </span>

                                    <label className="match-card__score-field">
                                        <span title={awayTeamName}>
                                            {awayTeamName}
                                        </span>

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
                                    <p
                                        className="match-card__error"
                                        role="alert"
                                    >
                                        {formError}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    className="match-card__submit-button"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? 'Saving prediction...'
                                        : 'Guardar predicción'}
                                </button>
                            </form>
                        )}
                    </>
                )}

                {isAuthenticated &&
                    isRegularUser &&
                    previousPrediction && (
                        <div className="match-card__saved-prediction">
                            <span className="match-card__detail-label">
                                YOUR PREDICTION
                            </span>

                            <strong className="match-card__saved-score">
                                {previousPrediction.home_score_prediction}
                                <span>:</span>
                                {previousPrediction.away_score_prediction}
                            </strong>

                            <span>
                                {getPredictionStatus(previousPrediction.status)}
                            </span>

                            {previousPrediction.points != null && (
                                <span>
                                    Points: {previousPrediction.points}
                                </span>
                            )}
                        </div>
                    )}

                {isRegularUser &&
                    isAuthenticated &&
                    !previousPrediction &&
                    !canPredict && (
                        <p className="match-card__notice">
                            Predictions are unavailable for this match.
                        </p>
                    )}

                {!isAuthenticated &&
                    !canRegisterAsGuest &&
                    matchStatus !== 'finished' && (
                        <p className="match-card__notice">
                            Registration for this match is currently unavailable.
                        </p>
                    )}

                {isAdmin && (
                    <div className="match-card__admin-actions">
                        <button
                            type="button"
                            className="match-card__admin-button"
                            onClick={() => onEdit(match)}
                        >
                            Edit match
                        </button>

                        <button
                            type="button"
                            className="match-card__admin-button match-card__admin-button--danger"
                            onClick={() => onDelete(match.id)}
                        >
                            Delete match
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
}