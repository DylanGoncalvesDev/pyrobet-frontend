import { useState } from 'react';
import { useNavigate } from 'react-router';
import { login as loginRequest } from '../../../services/authService';
import { useAuth } from '../AuthContext';
import './AuthForms.css';

function LoginForm() {
    const navigate = useNavigate();
    const { setSession } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError('');
        setIsSubmitting(true);

        try {
            const response = await loginRequest(email, password);

            if (!response.token || !response.user) {
                throw new Error('La respuesta del servidor no contiene el usuario y el token esperados.');
            }

            setSession({
                token: response.token,
                user: response.user
            });

            navigate('/', { replace: true });
        } catch (error) {
            const validationErrors = error.response?.data?.errors;

            const validationMessage = validationErrors
                ? Object.values(validationErrors).flat().join(' ')
                : '';

            setError(
                validationMessage ||
                error.response?.data?.message ||
                (
                    error.request
                        ? 'No se pudo conectar con el servidor. Comprueba que Laravel esté ejecutándose.'
                        : error.message || 'No se pudo iniciar sesión.'
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    }

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

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-form__field">
                        <label htmlFor="login-email">
                            Correo electrónico
                        </label>

                        <input
                            id="login-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
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
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            minLength={8}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </button>

                    {error && (
                        <p
                            className="auth-form__message auth-form__message--error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}
                </form>
            </section>
        </main>
    );
}

export default LoginForm;
