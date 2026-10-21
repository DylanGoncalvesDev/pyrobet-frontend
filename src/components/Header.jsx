
function Header() {
return (
<header className="site-header">
<div className="header-container">

            <div className="brand">
                <h1 className="brand-name">PyroBet</h1>
            </div>

            <nav className="main-navigation" aria-label="Navegación principal">
                <ul className="navigation-list">
                    <li><a href="#inicio">Inicio</a></li>
                    <li><a href="#predicciones">Predicciones</a></li>
                    <li><a href="#ranking">Ranking</a></li>
                    <li><a href="#reglas">Reglas</a></li>
                </ul>
            </nav>

            <div className="authentication-actions">
                <button type="button" className="login-button">
                    Iniciar Sesión
                </button>

                <button type="button" className="register-button">
                    Registrarse
                </button>
            </div>

        </div>
    </header>
);

}

export default Header;