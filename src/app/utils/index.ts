export function formatDate(date: string | undefined): string {
    if (date === undefined) {
        return '-'
    }
    return new Date(date).toLocaleString([], {
        hour12: false
    })
}