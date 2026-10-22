import './AuthForms.css';

function RegisterForm() {
    return (
        <main className="auth-page">
            <section className="auth-card" aria-labelledby="register-title">
                <header className="auth-card__header">
                    <h1 id="register-title" className="auth-card__title">
                        Crear una cuenta
                    </h1>

                    <p className="auth-card__description">
                        Únete a PyroBet y empieza a sumar puntos.
                    </p>
                </header>

                <form
                    className="auth-form"
                    onSubmit={(event) => event.preventDefault()}
                >
                    <div className="auth-form__field">
                        <label htmlFor="register-username">
                            Nombre de usuario
                        </label>

                        <input
                            id="register-username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            placeholder="Elige un nombre de usuario"
                            required
                        />
                    </div>

                    <div className="auth-form__field">
                        <label htmlFor="register-email">
                            Correo electrónico
                        </label>

                        <input
                            id="register-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="nombre@ejemplo.com"
                            required
                        />
                    </div>

                    <div className="auth-form__field">
                        <label htmlFor="register-password">
                            Contraseña
                        </label>

                        <input
                            id="register-password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Crea una contraseña"
                            minLength={8}
                            required
                        />
                    </div>

                    <div className="auth-form__field">
                        <label htmlFor="register-password-confirmation">
                            Confirmar contraseña
                        </label>

                        <input
                            id="register-password-confirmation"
                            name="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Repite tu contraseña"
                            minLength={8}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                    >
                        Registrarse
                    </button>
                </form>
            </section>
        </main>
    );
}

export default RegisterForm;