

export default function getErrorMessage(errors: unknown): string {
    if (!errors) return "";
    if (typeof errors === "string") return errors;
    if (Array.isArray(errors)) {
        return errors
            .map((e) =>
                typeof e === "object" && e !== null && "message" in e
                    ? (e as { message: string }).message
                    : String(e),
            )
            .join(", ");
    }
    if (typeof errors === "object" && errors !== null) {
        if ("message" in errors) {
            return (errors as { message: string }).message;
        }
        if ("errors" in errors && Array.isArray((errors as { errors: unknown[] }).errors)) {
            const nested = (errors as { errors: unknown[] }).errors;
            if (
                nested.length > 0 &&
                typeof nested[0] === "object" &&
                nested[0] !== null &&
                "message" in nested[0]
            ) {
                return (nested[0] as { message: string }).message;
            }
        }
    }
    return String(errors);
}
