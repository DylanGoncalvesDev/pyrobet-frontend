import { useEffect, useState } from 'react';
import { getRanking } from '../../services/rankingService';
import './Ranking.css';

function normalizeRanking(data) {
    const possibleLists = [
        data?.ranking,
        data?.users,
        data?.data?.ranking,
        data?.data?.users,
        data?.data,
        data
    ];

    const entries = possibleLists.find(Array.isArray) ?? [];

    return entries.map((entry, index) => {
        const player = entry.user ?? entry;

        return {
            id: entry.id ?? entry.user_id ?? player.id ?? index,
            position: entry.position ?? entry.rank ?? index + 1,
            name: player.name ?? player.username ?? 'Unknown player',
            points: Number(
                entry.points ??
                entry.total_points ??
                player.points ??
                0
            )
        };
    });
}

function RankingPage() {
    const [ranking, setRanking] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isActive = true;

        async function loadRanking() {
            try {
                setIsLoading(true);
                setError('');

                const data = await getRanking();
                const players = normalizeRanking(data);

                if (isActive) {
                    setRanking(players);
                }
            } catch (error) {
                if (isActive) {
                    setError(
                        error.response?.data?.message ??
                        'No se ha podido cargar la clasificación.'
                    );
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        }

        loadRanking();

        return () => {
            isActive = false;
        };
    }, []);

    return (
        <main className="ranking-page">
            <header className="ranking-header">
                <span className="ranking-eyebrow">
                    PYROBET COMPETITION
                </span>

                <h1>Ranking global</h1>

                <p>
                    Descubre quiénes son los mejores pronosticadores
                    y consulta su posición en la clasificación.
                </p>
            </header>

            {isLoading && (
                <div className="ranking-state">
                    <span className="ranking-spinner" />
                    <p>Cargando clasificación...</p>
                </div>
            )}

            {error && (
                <div className="ranking-state ranking-state--error">
                    {error}
                </div>
            )}

            {!isLoading && !error && ranking.length === 0 && (
                <div className="ranking-state">
                    <h2>Todavía no hay clasificación</h2>
                    <p>
                        Cuando los jugadores comiencen a acumular puntos,
                        aparecerán aquí.
                    </p>
                </div>
            )}

            {!isLoading && !error && ranking.length > 0 && (
                <section className="ranking-content">
                    <div className="ranking-table-container">
                        <table className="ranking-table">
                            <thead>
                                <tr>
                                    <th>Posición</th>
                                    <th>Jugador</th>
                                    <th>Puntos</th>
                                </tr>
                            </thead>

                            <tbody>
                                {ranking.map((player, index) => (
                                    <tr key={player.id}>
                                        <td>
                                            <span
                                                className={`ranking-position ${index < 3 ? `ranking-position--top-${index + 1}` : ''}`}
                                            >
                                                {player.position}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="ranking-player">
                                                <span className="ranking-avatar">
                                                    {player.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>

                                                <span className="ranking-player-name">
                                                    {player.name}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="ranking-points">
                                            {player.points.toLocaleString('es-ES')}
                                            <span> pts</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </main>
    );
}

export default RankingPage;