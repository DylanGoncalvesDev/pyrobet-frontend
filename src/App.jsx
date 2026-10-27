import { Link, Navigate, Route, Routes } from 'react-router';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginForm from './features/auth/components/LoginForm';
import RegisterForm from './features/auth/components/RegisterForm';
import ProfilePage from './features/profile/ProfilePage';
import { useAuth } from './features/auth/AuthContext';

function Hero() {
    return (
        <main className="main-content" id="inicio">
            <section className="hero-section" aria-labelledby="hero-title">
                <div className="hero-container">
                    <h2 id="hero-title" className="hero-title">
                        Welcome to PyroBet
                    </h2>

                    <p className="hero-description">
                        Your sports prediction platform.
                        Earn points and dominate the global leaderboard.
                    </p>

                    <Link to="/#predicciones" className="hero-button">
                        Explore Predictions
                    </Link>
                </div>
            </section>
        </main>
    );
}

function NotFound() {
    return (
        <main className="main-content">
            <section className="hero-section">
                <div className="hero-container">
                    <h2 className="hero-title">Page not found</h2>

                    <p className="hero-description">
                        The page you are looking for does not exist.
                    </p>

                    <Link to="/" className="hero-button">
                        Return Home
                    </Link>
                </div>
            </section>
        </main>
    );
}

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function App() {
    return (
        <div className="app-container">
            <Header />

            <Routes>
                <Route path="/" element={<Hero />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<NotFound />} />
            </Routes>

            <Footer />
        </div>
    );
}

export default App;