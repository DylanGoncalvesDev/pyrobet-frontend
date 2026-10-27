import { Link, useNavigate } from 'react-router';
import { useAuth } from '../features/auth/AuthContext';

function Header() {
    const navigate = useNavigate();
    const { user, role, isAuthenticated, logout } = useAuth();

    function handleLogout() {
        logout();
        navigate('/', { replace: true });
    }

    return (
        <header className="site-header">
            <div className="header-container">
                <div className="brand">
                    <Link to="/" className="brand-link">
                        <h1 className="brand-name">PyroBet</h1>
                    </Link>
                </div>

                <nav className="main-navigation" aria-label="Navegación principal">
                    <ul className="navigation-list">
                        <li>
                            <Link to="/#inicio">Inicio</Link>
                        </li>
                        <li>
                            <Link to="/#predicciones">Predicciones</Link>
                        </li>
                        <li>
                            <Link to="/#ranking">Ranking</Link>
                        </li>
                        <li>
                            <Link to="/#reglas">Reglas</Link>
                        </li>
                    </ul>
                </nav>

                <div className="authentication-actions">
                    {isAuthenticated ? (
                        <>
                            <span className="authenticated-user">
                                {user.name}
                            </span>

                            {role && (
                                <span className="authenticated-role">
                                    {role}
                                </span>
                            )}

                            <button
                                type="button"
                                className="login-button"
                                onClick={handleLogout}
                            >
                                Cerrar sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="login-button">
                                Iniciar Sesión
                            </Link>

                            <Link to="/register" className="register-button">
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;