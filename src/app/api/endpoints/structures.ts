const url = "http://localhost:8080"

export const endpoints = {
    structures: url + "/structures",
    structure: (id: string): string => {
        return endpoints.structures + `/${id}`;
    }
}