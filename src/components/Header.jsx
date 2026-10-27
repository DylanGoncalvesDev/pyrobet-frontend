import { Link } from 'react-router';
import { useAuth } from '../features/auth/AuthContext';
import UserProfileMenu from './UserProfileMenu';

function Header() {
    const { isAuthenticated } = useAuth();

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
                        <UserProfileMenu />
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