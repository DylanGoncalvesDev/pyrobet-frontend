import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function getLogoUrl(logo) {
    if (!logo) {
        return '';
    }

    if (/^https?:\/\//i.test(logo)) {
        return logo;
    }

    const origin = API_BASE_URL.replace(/\/api\/?$/, '');
    const path = logo.replace(/^\/+/, '');

    return `${origin}/${path.startsWith('storage/') ? path : `storage/${path}`}`;
}

function AdminResourceForm({
    kind,
    item,
    onSubmit,
    onCancel,
    isSaving
}) {
    const [form, setForm] = useState({});
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');

    const isTeam = kind === 'team';

    useEffect(() => {
        if (isTeam) {
            setForm({
                name: item?.name ?? '',
                country: item?.country ?? '',
                founded_at: String(item?.founded_at ?? ''),
                type: item?.type ?? '',
                sport: item?.sport ?? ''
            });
        } else {
            setForm({
                name: item?.name ?? '',
                description: item?.description ?? '',
                status: item?.status ?? '',
                start_date: item?.start_date?.slice(0, 10) ?? '',
                end_date: item?.end_date?.slice(0, 10) ?? ''
            });
        }

        setLogoFile(null);
    }, [kind, item]);

    useEffect(() => {
        if (!logoFile) {
            setLogoPreview(item?.logo ? getLogoUrl(item.logo) : '');
            return;
        }

        const objectUrl = URL.createObjectURL(logoFile);

        setLogoPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [logoFile, item]);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (isTeam) {
            const payload = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                if (key !== 'logo' && value !== null && value !== undefined) {
                    payload.append(key, value);
                }
            });

            if (logoFile) {
                payload.append('logo', logoFile);
            }

           await onSubmit(payload);
           return;
       }

       await onSubmit(form);
    }

    return (
        <div
            className="admin-modal-backdrop"
            onMouseDown={onCancel}
        >
            <section
                className="admin-modal"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <header className="admin-modal-header">
                    <div>
                        <span className="admin-eyebrow">
                            PYROBET ADMIN
                        </span>

                        <h2>
                            {item
                                ? isTeam
                                    ? 'Editar equipo'
                                    : 'Editar competición'
                                : isTeam
                                    ? 'Nuevo equipo'
                                    : 'Nueva competición'}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="admin-modal-close"
                        onClick={onCancel}
                        disabled={isSaving}
                        aria-label="Cerrar formulario"
                    >
                        ×
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="admin-form">
                    <label>
                        Nombre

                        <input
                            type="text"
                            name="name"
                            value={form.name ?? ''}
                            onChange={handleChange}
                            maxLength="255"
                            required
                        />
                    </label>

                    {isTeam ? (
                        <>
                            <label>
                                País

                                <input
                                    type="text"
                                    name="country"
                                    value={form.country ?? ''}
                                    onChange={handleChange}
                                />
                            </label>

                            <label>
                                Fecha de fundación

                                <input
                                    type="number"
                                    name="founded_at"
                                    value={form.founded_at ?? ''}
                                    onChange={handleChange}
                                    min="1800"
                                    max={new Date().getFullYear()}
                                    step="1"
                                    required
                                />
                            </label>

                            <div className="admin-form-grid">
                                <label>
                                    Tipo

                                    <input
                                        type="text"
                                        name="type"
                                        value={form.type ?? ''}
                                        onChange={handleChange}
                                    />
                                </label>

                                <label>
                                    Deporte

                                    <input
                                        type="text"
                                        name="sport"
                                        value={form.sport ?? ''}
                                        onChange={handleChange}
                                    />
                                </label>
                            </div>

                            <label>
                                Logotipo del equipo

                                <input
                                    type="file"
                                    name="logo"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={(event) =>
                                        setLogoFile(event.target.files?.[0] ?? null)
                                    }
                                />
                            </label>

                            {logoPreview && (
                                <div className="admin-logo-preview">
                                    <img
                                        src={logoPreview}
                                        alt="Vista previa del logotipo"
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <label>
                                Descripción

                                <textarea
                                    name="description"
                                    value={form.description ?? ''}
                                    onChange={handleChange}
                                    rows="3"
                                />
                            </label>

                            <label>
                                Estado

                                <input
                                    type="text"
                                    name="status"
                                    value={form.status ?? ''}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <div className="admin-form-grid">
                                <label>
                                    Fecha de inicio

                                    <input
                                        type="date"
                                        name="start_date"
                                        value={form.start_date ?? ''}
                                        onChange={handleChange}
                                    />
                                </label>

                                <label>
                                    Fecha de finalización

                                    <input
                                        type="date"
                                        name="end_date"
                                        value={form.end_date ?? ''}
                                        onChange={handleChange}
                                    />
                                </label>
                            </div>
                        </>
                    )}

                    <div className="admin-form-actions">
                        <button
                            type="button"
                            className="admin-button admin-button-secondary"
                            onClick={onCancel}
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="admin-button admin-button-primary"
                            disabled={isSaving}
                        >
                            {isSaving
                                ? 'Guardando...'
                                : item
                                    ? 'Guardar cambios'
                                    : 'Crear'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default AdminResourceForm;