import { useAuth } from '../auth/AuthContext';
import './ProfilePage.css';

function ProfilePage() {
    const { user, role } = useAuth();

    return (
        <main className="profile-page">
            <section className="profile-card" aria-labelledby="profile-title">
                <header className="profile-card__header">
                    <h1 id="profile-title" className="profile-card__title">
                        Mi perfil
                    </h1>

                    <p className="profile-card__description">
                        Consulta la información de tu cuenta de PyroBet.
                    </p>
                </header>

                <dl className="profile-details">
                    <div className="profile-details__item">
                        <dt>Nombre</dt>
                        <dd>{user?.name || 'No disponible'}</dd>
                    </div>

                    <div className="profile-details__item">
                        <dt>Correo electrónico</dt>
                        <dd>{user?.email || 'No disponible'}</dd>
                    </div>

                    <div className="profile-details__item">
                        <dt>Rol</dt>
                        <dd>{role || 'No disponible'}</dd>
                    </div>
                </dl>
            </section>
        </main>
    );
}

export default ProfilePage;