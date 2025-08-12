interface ErrorWithMessage {
    message: string;
}

export default function getErrorMessage(errors: unknown): string {
    if (!errors) return "";
    if (typeof errors === "string") return errors;
    if (Array.isArray(errors)) {
        return errors
            .map((e) =>
                typeof e === "object" && e !== null && "message" in e ? (e as ErrorWithMessage).message : String(e),
            )
            .join(", ");
    }
    if (typeof errors === "object" && errors !== null) {
        if ("message" in errors) {
            return (errors as ErrorWithMessage).message;
        }
        if ("errors" in errors && Array.isArray((errors as { errors: ErrorWithMessage[] }).errors)) {
            const nested = (errors as { errors: ErrorWithMessage[] }).errors;
            if (nested.length > 0 && typeof nested[0]?.message === "string") {
                return nested[0].message;
            }
        }
    }
    return String(errors);
}
