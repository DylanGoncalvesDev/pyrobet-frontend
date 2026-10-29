import { useState } from 'react';

const sports = [
    'american football',
    'soccer football',
    'rugby',
    'basketball',
    'baseball',
    'cricket',
    'softball',
    'volleyball',
    'hockey',
    'handball',
    'futsal'
];

const sportLabels = {
    'american football': 'Fútbol americano',
    'soccer football': 'Fútbol',
    rugby: 'Rugby',
    basketball: 'Baloncesto',
    baseball: 'Béisbol',
    cricket: 'Críquet',
    softball: 'Sóftbol',
    volleyball: 'Voleibol',
    hockey: 'Hockey',
    handball: 'Balonmano',
    futsal: 'Fútbol sala'
};

const statusLabels = {
    upcoming: 'Próximo',
    live: 'En directo',
    finished: 'Finalizado'
};

function formatDateForInput(value) {
    if (!value) {
        return '';
    }

    return String(value).replace(' ', 'T').slice(0, 16);
}

function getInitialForm(match) {
    if (!match) {
        return {
            competition_id: '',
            home_team_id: '',
            away_team_id: '',
            date: '',
            location: '',
            stage: '',
            status: 'upcoming',
            sport: 'soccer football',
            home_team_score: '',
            away_team_score: ''
        };
    }

    return {
        competition_id: String(
            match.competition_id ?? match.competition?.id ?? ''
        ),
        home_team_id: String(
            match.home_team_id ?? match.home_team?.id ?? match.homeTeam?.id ?? ''
        ),
        away_team_id: String(
            match.away_team_id ?? match.away_team?.id ?? match.awayTeam?.id ?? ''
        ),
        date: formatDateForInput(match.date),
        location: match.location ?? '',
        stage: match.stage ?? '',
        status: match.status ?? 'upcoming',
        sport: match.sport ?? 'soccer football',
        home_team_score: match.home_team_score ?? '',
        away_team_score: match.away_team_score ?? ''
    };
}

function MatchForm({ match, teams, competitions, onSubmit, onCancel }) {
    const [formData, setFormData] = useState(() => getInitialForm(match));
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setFormError('');

        if (formData.home_team_id === formData.away_team_id) {
            setFormError('El equipo local y el visitante deben ser diferentes.');
            return;
        }

        const formattedDate = formData.date.length === 16
            ? `${formData.date.replace('T', ' ')}:00`
            : formData.date.replace('T', ' ');

        const payload = {
            competition_id: Number(formData.competition_id),
            home_team_id: Number(formData.home_team_id),
            away_team_id: Number(formData.away_team_id),
            date: formattedDate,
            location: formData.location,
            stage: formData.stage,
            status: formData.status,
            sport: formData.sport,
            home_team_score: formData.home_team_score === ''
                ? null
                : Number(formData.home_team_score),
            away_team_score: formData.away_team_score === ''
                ? null
                : Number(formData.away_team_score)
        };

        setIsSubmitting(true);

        try {
            await onSubmit(payload);
        } catch (error) {
            setFormError(
                error.response?.data?.message ||
                'No se ha podido guardar el partido.'
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="match-modal-backdrop" onClick={onCancel}>
            <section
                className="match-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="match-form-title"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="match-modal__header">
                    <div>
                        <h2 id="match-form-title">
                            {match ? 'Editar partido' : 'Crear nuevo partido'}
                        </h2>

                        <p>Introduce los datos del encuentro.</p>
                    </div>

                    <button
                        type="button"
                        className="match-modal__close"
                        onClick={onCancel}
                        aria-label="Cerrar formulario"
                    >
                        ×
                    </button>
                </header>

                <form className="match-form" onSubmit={handleSubmit}>
                    <label className="match-field">
                        Competición

                        <select
                            name="competition_id"
                            value={formData.competition_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Selecciona una competición</option>

                            {competitions.map((competition) => (
                                <option
                                    key={competition.id}
                                    value={competition.id}
                                >
                                    {competition.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="match-form__grid">
                        <label className="match-field">
                            Equipo local

                            <select
                                name="home_team_id"
                                value={formData.home_team_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecciona un equipo</option>

                                {teams.map((team) => (
                                    <option key={team.id} value={team.id}>
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="match-field">
                            Equipo visitante

                            <select
                                name="away_team_id"
                                value={formData.away_team_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecciona un equipo</option>

                                {teams.map((team) => (
                                    <option key={team.id} value={team.id}>
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className="match-field">
                        Fecha y hora

                        <input
                            name="date"
                            type="datetime-local"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <div className="match-form__grid">
                        <label className="match-field">
                            Lugar

                            <input
                                name="location"
                                type="text"
                                value={formData.location}
                                onChange={handleChange}
                                maxLength="255"
                                required
                            />
                        </label>

                        <label className="match-field">
                            Jornada o fase

                            <input
                                name="stage"
                                type="text"
                                value={formData.stage}
                                onChange={handleChange}
                                maxLength="255"
                                required
                            />
                        </label>
                    </div>

                    <div className="match-form__grid">
                        <label className="match-field">
                            Estado

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                {Object.entries(statusLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="match-field">
                            Deporte

                            <select
                                name="sport"
                                value={formData.sport}
                                onChange={handleChange}
                                required
                            >
                                {sports.map((sport) => (
                                    <option key={sport} value={sport}>
                                        {sportLabels[sport]}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="match-form__grid">
                        <label className="match-field">
                            Marcador local

                            <input
                                name="home_team_score"
                                type="number"
                                min="0"
                                step="1"
                                value={formData.home_team_score}
                                onChange={handleChange}
                            />
                        </label>

                        <label className="match-field">
                            Marcador visitante

                            <input
                                name="away_team_score"
                                type="number"
                                min="0"
                                step="1"
                                value={formData.away_team_score}
                                onChange={handleChange}
                            />
                        </label>
                    </div>

                    {formError && (
                        <p className="matches-message matches-message--error" role="alert">
                            {formError}
                        </p>
                    )}

                    <div className="match-form__actions">
                        <button
                            type="button"
                            className="match-button match-button--secondary"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="match-button match-button--primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Guardando...' : 'Guardar partido'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default MatchForm;