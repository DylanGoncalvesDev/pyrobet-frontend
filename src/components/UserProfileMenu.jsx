import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../features/auth/AuthContext';
import './UserProfileMenu.css';

function UserProfileMenu() {
    const { user, role, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const triggerRef = useRef(null);

    const displayName = user?.name?.trim() || 'Usuario';
    const avatarLetter = displayName.charAt(0).toUpperCase();

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function handlePointerDown(event) {
            if (!menuRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        }

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    function handleLogout() {
        logout();
        setIsOpen(false);
        navigate('/', { replace: true });
    }

    return (
        <div className="profile-menu" ref={menuRef}>
            <button
                ref={triggerRef}
                type="button"
                className="profile-menu__trigger"
                aria-label={`Abrir menú de ${displayName}`}
                aria-expanded={isOpen}
                aria-controls="profile-menu-dropdown"
                onClick={() => setIsOpen((previousState) => !previousState)}
            >
                <span className="profile-menu__avatar" aria-hidden="true">
                    {avatarLetter}
                </span>

                <span className="profile-menu__name">
                    {displayName}
                </span>

                <span className="profile-menu__chevron" aria-hidden="true">
                    {isOpen ? '⌃' : '⌄'}
                </span>
            </button>

            <div
                id="profile-menu-dropdown"
                className="profile-menu__dropdown"
                hidden={!isOpen}
            >
                <div className="profile-menu__identity">
                    <span className="profile-menu__identity-name">
                        {displayName}
                    </span>

                    <span className="profile-menu__identity-email">
                        {user?.email}
                    </span>

                    {role && (
                        <span className="profile-menu__identity-role">
                            {role}
                        </span>
                    )}
                </div>

                <div className="profile-menu__divider" />

                <Link
                    to="/profile"
                    className="profile-menu__item"
                    onClick={() => setIsOpen(false)}
                >
                    Mi perfil
                </Link>

                <button
                    type="button"
                    className="profile-menu__item profile-menu__item--danger"
                    onClick={handleLogout}
                >
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
}

export default UserProfileMenu;