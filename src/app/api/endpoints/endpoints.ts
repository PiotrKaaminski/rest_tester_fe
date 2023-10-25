const url = "http://localhost:8080"

export const endpoints = {
    structures: {
        base: url + "/structures",
        withId: (id: string): string => {
            return endpoints.structures.base + `/${id}`
        }
    },
    structureFields: {
        base: url + "/structureFields",
        withId: (id: string): string => {
            return endpoints.structureFields.base + `/${id}`
        },
        withStructurePrefix: (structureId: string): string => {
            return endpoints.structures.withId(structureId) + `/fields`
        }
    },
    scenarios: {
        base: url + "/scenarios"
    }
}