import './AuthForms.css';

function LoginForm() {
    return (
        <main className="auth-page">
            <section className="auth-card" aria-labelledby="login-title">
                <header className="auth-card__header">
                    <h1 id="login-title" className="auth-card__title">
                        Iniciar sesión
                    </h1>

                    <p className="auth-card__description">
                        Accede a tu cuenta de PyroBet.
                    </p>
                </header>

                <form
                    className="auth-form"
                    onSubmit={(event) => event.preventDefault()}
                >
                    <div className="auth-form__field">
                        <label htmlFor="login-identifier">
                            Correo electrónico o nombre de usuario
                        </label>

                        <input
                            id="login-identifier"
                            name="identifier"
                            type="text"
                            autoComplete="username"
                            placeholder="Introduce tu correo o usuario"
                            required
                        />
                    </div>

                    <div className="auth-form__field">
                        <label htmlFor="login-password">
                            Contraseña
                        </label>

                        <input
                            id="login-password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Introduce tu contraseña"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                    >
                        Iniciar sesión
                    </button>
                </form>
            </section>
        </main>
    );
}

export default LoginForm;