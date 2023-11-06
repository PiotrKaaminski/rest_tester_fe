export function formatDate(date: string | undefined | null): string {
    if (date === undefined || date === null) {
        return '-'
    }
    return new Date(date).toLocaleString([], {
        hour12: false
    })
}