import { Link } from 'react-router';
import { useAuth } from '../features/auth/AuthContext';
import UserProfileMenu from './UserProfileMenu';

function Header() {
    const { isAuthenticated, role } = useAuth();

    const isAdmin =
        isAuthenticated &&
        String(role ?? '').toLowerCase() === 'admin';

    return (
        <header className="site-header">
            <div className="header-container">
                <div className="brand">
                    <Link
                        to="/"
                        className="brand-link"
                        aria-label="PyroBet - Inicio"
                    >
                        <h1 className="brand-name">PyroBet</h1>
                    </Link>
                </div>

                <nav
                    className="main-navigation"
                    aria-label="Navegación principal"
                >
                    <ul className="navigation-list">
                        <li>
                            <Link to="/">Inicio</Link>
                        </li>

                        {isAdmin && (
                            <li>
                                <Link to="/admin">Administración</Link>
                            </li>
                        )}

                       {isAuthenticated && (
                          <>
                             <li>
                                 <Link to="/my-predictions">
                                     Mis predicciones
                                 </Link>
                             </li>

                             <li>
                                 <Link to="/ranking">Ranking</Link>
                             </li>
                          </>
                       )}

                        <li>
                            <Link to="/rules">Reglas</Link>
                        </li>
                    </ul>
                </nav>

                <div className="authentication-actions">
                    {isAuthenticated ? (
                        <UserProfileMenu />
                    ) : (
                        <>
                            <Link to="/login" className="login-button">
                                Iniciar sesión
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