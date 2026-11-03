import { useAuth } from '../auth/AuthContext';
import './ProfilePage.css';

function ProfilePage() {
    const { user, role } = useAuth();

    const displayName = user?.name?.trim() || 'Usuario';

    const displayRole = role
        ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
        : 'User';

    const avatarLetter = displayName.charAt(0).toUpperCase();

    return (
        <main className="profile-page">
            <section className="profile-card" aria-labelledby="profile-title">
                <header className="profile-card__header">
                    <h1 id="profile-title" className="profile-card__title">
                        Mi perfil
                    </h1>

                    <p className="profile-card__description">
                        Gestiona y consulta la información de tu cuenta de PyroBet.
                    </p>
                </header>

                <section className="profile-hero" aria-label="Identidad del usuario">
                    <div className="profile-hero__avatar" aria-hidden="true">
                        {avatarLetter}
                    </div>

                    <div className="profile-hero__content">
                        <h2 className="profile-hero__name">
                            {displayName}
                        </h2>

                        <span className="profile-hero__role">
                            {displayRole}
                        </span>
                    </div>
                </section>

                <section
                    className="profile-information"
                    aria-labelledby="profile-information-title"
                >
                    <div className="profile-information__heading">
                        <h2 id="profile-information-title">
                            Información de la cuenta
                        </h2>

                        <p>
                            Datos asociados a tu usuario.
                        </p>
                    </div>

                    <dl className="profile-details">
                        <div className="profile-details__item">
                            <dt>Nombre completo</dt>
                            <dd>{user?.name || 'No disponible'}</dd>
                        </div>

                        <div className="profile-details__item">
                            <dt>Correo electrónico</dt>
                            <dd>{user?.email || 'No disponible'}</dd>
                        </div>

                        <div className="profile-details__item">
                            <dt>Rol de usuario</dt>
                            <dd>{displayRole}</dd>
                        </div>
                    </dl>
                </section>
            </section>
        </main>
    );
}

export default ProfilePage;