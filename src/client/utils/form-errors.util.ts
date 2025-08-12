// Utilidad central para normalizar estructuras de error provenientes de TanStack Form, Zod, etc.
// Mantener pura y sin dependencias de React.
export function extractErrorMessage(errors: unknown): string {
    if (!errors) return '';
    if (typeof errors === 'string') return errors;
    if (Array.isArray(errors)) {
        return errors
            .map((e) =>
                typeof e === 'object' && e !== null && 'message' in e
                    ? (e as { message?: string }).message || ''
                    : String(e),
            )
            .filter(Boolean)
            .join(', ');
    }
    if (typeof errors === 'object' && errors !== null) {
        if ('message' in errors) {
            return (errors as { message?: string }).message || '';
        }
        if ('errors' in errors && Array.isArray((errors as { errors?: unknown[] }).errors)) {
            const nested = (errors as { errors?: Array<{ message?: string }> }).errors || [];
            const first = nested.find((n) => typeof n?.message === 'string');
            if (first?.message) return first.message;
        }
    }
    return String(errors);
}
