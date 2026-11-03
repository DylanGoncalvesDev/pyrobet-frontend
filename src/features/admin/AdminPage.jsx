import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import MatchForm from '../matches/components/MatchForm';
import {
    createMatch,
    deleteMatch,
    getCompetitions,
    getMatches,
    getTeams,
    updateMatch
} from '../../services/matchService';
import {
    createCompetition,
    createTeam,
    deleteCompetition,
    deleteTeam,
    getAdminStatistics,
    updateCompetition,
    updateTeam
} from '../../services/adminService';
import AdminResourceForm from './components/AdminResourceForm';
import './admin.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function getErrorMessage(error, fallback) {
    return error.response?.data?.message ?? fallback;
}

function formatDate(date) {
    if (!date) {
        return 'No disponible';
    }

    const parsedDate = new Date(String(date).replace(' ', 'T'));

    if (Number.isNaN(parsedDate.getTime())) {
        return 'No disponible';
    }

    return new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(parsedDate);
}

function getLogoUrl(logo) {
    if (!logo) {
        return '';
    }

    if (/^https?:\/\//i.test(logo)) {
        return logo;
    }

    const origin = API_BASE_URL.replace(/\/api\/?$/, '');
    const path = logo.replace(/^\/+/, '');

    return `${origin}/${path.startsWith('storage/') ? path : `storage/${path}`}`;
}

function AdminPage() {
    const { isAuthenticated, role } = useAuth();

    const isAdmin =
        isAuthenticated &&
        String(role ?? '').toLowerCase() === 'admin';

    const [activeTab, setActiveTab] = useState('overview');

    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [competitions, setCompetitions] = useState([]);
    const [statistics, setStatistics] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [loadError, setLoadError] = useState('');
    const [statisticsError, setStatisticsError] = useState('');
    const [actionError, setActionError] = useState('');
    const [notice, setNotice] = useState('');

    const [formKind, setFormKind] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    const loadData = useCallback(async () => {
        if (!isAdmin) {
            return;
        }

        setIsLoading(true);
        setLoadError('');
        setStatisticsError('');

        const results = await Promise.allSettled([
            getMatches(),
            getTeams(),
            getCompetitions(),
            getAdminStatistics()
        ]);

        const [
            matchesResult,
            teamsResult,
            competitionsResult,
            statisticsResult
        ] = results;

        const errors = [];

        if (matchesResult.status === 'fulfilled') {
            setMatches(matchesResult.value);
        } else {
            setMatches([]);
            errors.push('No se han podido cargar los partidos.');
        }

        if (teamsResult.status === 'fulfilled') {
            setTeams(teamsResult.value);
        } else {
            setTeams([]);
            errors.push('No se han podido cargar los equipos.');
        }

        if (competitionsResult.status === 'fulfilled') {
            setCompetitions(competitionsResult.value);
        } else {
            setCompetitions([]);
            errors.push('No se han podido cargar las competiciones.');
        }

        if (statisticsResult.status === 'fulfilled') {
            setStatistics(statisticsResult.value);
        } else {
            setStatistics(null);
            setStatisticsError(
                getErrorMessage(
                    statisticsResult.reason,
                    'No se han podido cargar las estadísticas.'
                )
            );
        }

        setLoadError(errors.join(' '));
        setIsLoading(false);
    }, [isAdmin]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    function openCreateForm(kind) {
        setFormKind(kind);
        setEditingItem(null);
        setActionError('');
        setNotice('');
    }

    function openEditForm(kind, item) {
        setFormKind(kind);
        setEditingItem(item);
        setActionError('');
        setNotice('');
    }

    function closeForm() {
        if (isSaving) {
            return;
        }

        setFormKind(null);
        setEditingItem(null);
    }

    async function handleSave(payload) {
        setIsSaving(true);
        setActionError('');
        setNotice('');

        try {
            let response;

            if (formKind === 'match') {
                response = editingItem
                    ? await updateMatch(editingItem.id, payload)
                    : await createMatch(payload);
            }

            if (formKind === 'team') {
                response = editingItem
                    ? await updateTeam(editingItem.id, payload)
                    : await createTeam(payload);
            }

            if (formKind === 'competition') {
                response = editingItem
                    ? await updateCompetition(editingItem.id, payload)
                    : await createCompetition(payload);
            }

            setNotice(
                response?.message ?? 'Operación realizada correctamente.'
            );

            setFormKind(null);
            setEditingItem(null);

            await loadData();
        } catch (error) {
            setActionError(
                getErrorMessage(
                    error,
                    'No se ha podido guardar el registro.'
                )
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(kind, item) {
        const confirmed = window.confirm(
            '¿Estás seguro de que quieres eliminar este registro?'
        );

        if (!confirmed) {
            return;
        }

        setActionError('');
        setNotice('');

        try {
            let response;

            if (kind === 'match') {
                response = await deleteMatch(item.id);
            }

            if (kind === 'team') {
                response = await deleteTeam(item.id);
            }

            if (kind === 'competition') {
                response = await deleteCompetition(item.id);
            }

            setNotice(
                response?.message ?? 'Registro eliminado correctamente.'
            );

            await loadData();
        } catch (error) {
            setActionError(
                getErrorMessage(
                    error,
                    'No se ha podido eliminar el registro.'
                )
            );
        }
    }

    const metrics = statistics?.metrics ?? {};

    const predictionCounts = new Map(
        (statistics?.match_statistics ?? []).map((item) => [
            Number(item.match_id),
            Number(item.predictions_count ?? 0)
        ])
    );

    return (
        <main className="admin-page">
            <header className="admin-page-header">
                <div>
                    <span className="admin-eyebrow">
                        PYROBET CONTROL CENTER
                    </span>

                    <h1>Panel de administración</h1>

                    <p>
                        Gestiona los partidos, equipos y competiciones
                        de la plataforma.
                    </p>
                </div>
            </header>

            {notice && (
                <div className="admin-message admin-message--success">
                    {notice}
                </div>
            )}

            {actionError && (
                <div className="admin-message admin-message--error">
                    {actionError}
                </div>
            )}

            {loadError && (
                <div className="admin-message admin-message--error">
                    {loadError}
                </div>
            )}

            <nav className="admin-tabs" aria-label="Administración">
                {[
                    ['overview', 'Resumen'],
                    ['matches', 'Partidos'],
                    ['competitions', 'Competiciones'],
                    ['teams', 'Equipos']
                ].map(([key, label]) => (
                    <button
                        key={key}
                        type="button"
                        className={activeTab === key ? 'is-active' : ''}
                        onClick={() => setActiveTab(key)}
                    >
                        {label}
                    </button>
                ))}
            </nav>

            {isLoading ? (
                <div className="admin-state">
                    Cargando información...
                </div>
            ) : (
                <>
                    {activeTab === 'overview' && (
                        <section className="admin-overview">
                            <div className="admin-metrics-grid">
                                {[
                                    ['Total de predicciones', metrics.total_predictions],
                                    ['Usuarios registrados', metrics.total_users],
                                    ['Partidos', metrics.total_matches],
                                    ['Equipos', metrics.total_teams],
                                    ['Competiciones', metrics.total_competitions]
                                ].map(([label, value]) => (
                                    <article
                                        className="admin-metric-card"
                                        key={label}
                                    >
                                        <span>{label}</span>
                                        <strong>
                                            {value ?? '—'}
                                        </strong>
                                    </article>
                                ))}
                            </div>

                            {statisticsError && (
                                <div className="admin-message admin-message--error">
                                    {statisticsError}
                                </div>
                            )}

                            <section className="admin-panel-section">
                                <div className="admin-section-heading">
                                    <div>
                                        <h2>Predicciones por partido</h2>

                                        <p>
                                            Número de pronósticos registrados
                                            en cada encuentro.
                                        </p>
                                    </div>
                                </div>

                                {matches.length === 0 ? (
                                    <div className="admin-state">
                                        No hay partidos registrados.
                                    </div>
                                ) : (
                                    <div className="admin-table-container">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Partido</th>
                                                    <th>Competición</th>
                                                    <th>Fecha</th>
                                                    <th>Predicciones</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {matches.map((match) => (
                                                    <tr key={match.id}>
                                                        <td>
                                                            {match.home_team?.name ?? match.homeTeam?.name}
                                                            {' - '}
                                                            {match.away_team?.name ?? match.awayTeam?.name}
                                                        </td>

                                                        <td>
                                                            {match.competition?.name ?? '—'}
                                                        </td>

                                                        <td>
                                                            {formatDate(match.date)}
                                                        </td>

                                                        <td>
                                                            <strong className="admin-count">
                                                                {predictionCounts.get(Number(match.id)) ?? '—'}
                                                            </strong>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        </section>
                    )}

                    {activeTab === 'matches' && (
                        <AdminResourceSection
                            title="Gestión de partidos"
                            description="Crea, modifica y elimina encuentros."
                            onCreate={() => openCreateForm('match')}
                        >
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Encuentro</th>
                                            <th>Competición</th>
                                            <th>Fecha</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {matches.map((match) => (
                                            <tr key={match.id}>
                                                <td>
                                                    {match.home_team?.name ?? match.homeTeam?.name}
                                                    {' - '}
                                                    {match.away_team?.name ?? match.awayTeam?.name}
                                                </td>

                                                <td>
                                                    {match.competition?.name ?? '—'}
                                                </td>

                                                <td>
                                                    {formatDate(match.date)}
                                                </td>

                                                <td>
                                                    {match.status}
                                                </td>

                                                <td>
                                                    <AdminActions
                                                        onEdit={() => openEditForm('match', match)}
                                                        onDelete={() => handleDelete('match', match)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </AdminResourceSection>
                    )}

                    {activeTab === 'competitions' && (
                        <AdminResourceSection
                            title="Gestión de competiciones"
                            description="Administra las competiciones disponibles."
                            onCreate={() => openCreateForm('competition')}
                        >
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Estado</th>
                                            <th>Inicio</th>
                                            <th>Finalización</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {competitions.map((competition) => (
                                            <tr key={competition.id}>
                                                <td>{competition.name}</td>
                                                <td>{competition.status}</td>
                                                <td>{competition.start_date ?? '—'}</td>
                                                <td>{competition.end_date ?? '—'}</td>
                                                <td>
                                                    <AdminActions
                                                        onEdit={() => openEditForm('competition', competition)}
                                                        onDelete={() => handleDelete('competition', competition)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </AdminResourceSection>
                    )}

                    {activeTab === 'teams' && (
                        <AdminResourceSection
                            title="Gestión de equipos"
                            description="Administra los equipos y sus logotipos."
                            onCreate={() => openCreateForm('team')}
                        >
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Equipo</th>
                                            <th>País</th>
                                            <th>Deporte</th>
                                            <th>Tipo</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {teams.map((team) => (
                                            <tr key={team.id}>
                                                <td>
                                                    <div className="admin-team-cell">
                                                        {team.logo ? (
                                                            <img
                                                                src={getLogoUrl(team.logo)}
                                                                alt=""
                                                            />
                                                        ) : (
                                                            <span>
                                                                {team.name.slice(0, 2).toUpperCase()}
                                                            </span>
                                                        )}

                                                        {team.name}
                                                    </div>
                                                </td>

                                                <td>{team.country ?? '—'}</td>
                                                <td>{team.sport ?? '—'}</td>
                                                <td>{team.type ?? '—'}</td>

                                                <td>
                                                    <AdminActions
                                                        onEdit={() => openEditForm('team', team)}
                                                        onDelete={() => handleDelete('team', team)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </AdminResourceSection>
                    )}
                </>
            )}

            {formKind === 'match' && (
                <MatchForm
                    key={editingItem?.id ?? 'new-match'}
                    match={editingItem}
                    teams={teams}
                    competitions={competitions}
                    onSubmit={handleSave}
                    onCancel={closeForm}
                />
            )}

            {(formKind === 'team' || formKind === 'competition') && (
                <AdminResourceForm
                    kind={formKind}
                    item={editingItem}
                    onSubmit={handleSave}
                    onCancel={closeForm}
                    isSaving={isSaving}
                />
            )}
        </main>
    );
}

function AdminResourceSection({
    title,
    description,
    onCreate,
    children
}) {
    return (
        <section className="admin-panel-section">
            <div className="admin-section-heading">
                <div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>

                <button
                    type="button"
                    className="admin-button admin-button-primary"
                    onClick={onCreate}
                >
                    Nuevo registro
                </button>
            </div>

            {children}
        </section>
    );
}

function AdminActions({ onEdit, onDelete }) {
    return (
        <div className="admin-actions">
            <button
                type="button"
                className="admin-action-edit"
                onClick={onEdit}
            >
                Editar
            </button>

            <button
                type="button"
                className="admin-action-delete"
                onClick={onDelete}
            >
                Eliminar
            </button>
        </div>
    );
}

export default AdminPage;