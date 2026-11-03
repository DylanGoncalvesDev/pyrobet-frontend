import { Link } from 'react-router';
import './Rules.css';

function RulesPage() {
    return (
        <main className="rules-page">
            <header className="rules-header">
                <span className="rules-eyebrow">
                    HOW PYROBET WORKS
                </span>

                <h1>Game Rules</h1>

                <p>
                    Everything you need to know about making predictions
                    and competing with other players.
                </p>
            </header>

            <section className="rules-grid">
                <article className="rule-card">
                    <span className="rule-number">01</span>

                    <h2>Create your account</h2>

                    <p>
                        Register on PyroBet to access predictions,
                        track your points and compete with other players.
                    </p>
                </article>

                <article className="rule-card">
                    <span className="rule-number">02</span>

                    <h2>Explore matches</h2>

                    <p>
                        Browse available matches, check the teams,
                        competitions, dates and venues.
                    </p>
                </article>

                <article className="rule-card">
                    <span className="rule-number">03</span>

                    <h2>Predict the score</h2>

                    <p>
                        Enter the number of goals you predict for
                        the home team and the away team.
                    </p>
                </article>

                <article className="rule-card">
                    <span className="rule-number">04</span>

                    <h2>Earn points</h2>

                    <p>
                        Once a match is finished, your prediction
                        is evaluated and points are assigned.
                    </p>
                </article>

                <article className="rule-card">
                    <span className="rule-number">05</span>

                    <h2>Climb the ranking</h2>

                    <p>
                        Your accumulated points determine your position
                        in the global leaderboard.
                    </p>
                </article>
            </section>

            <section className="rules-cta">
                <h2>Ready to make your predictions?</h2>

                <p>
                    Explore the available matches and start competing.
                </p>

                <Link to="/matches" className="rules-button">
                    Explore matches
                </Link>
            </section>
        </main>
    );
}

export default RulesPage;