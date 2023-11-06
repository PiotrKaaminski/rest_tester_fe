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
        base: url + "/scenarios",
        withId: (id: string): string => {
            return endpoints.scenarios.base + `/${id}`
        },
    },
    parameters: {
        base: url + "/parameters",
        withId: (id: string): string => {
            return endpoints.parameters.base + `/${id}`
        },
        withScenarioPrefix: (scenarioId: string): string => {
            return endpoints.scenarios.withId(scenarioId) + "/parameters"
        }
    },
    steps: {
        base: url + '/steps',
        withId: (id: string): string => {
            return endpoints.steps.base + `/${id}`
        },
        withScenarioPrefix: (scenarioId: string): string => {
            return endpoints.scenarios.withId(scenarioId) + '/steps'
        }
    },
    requests: {
        withStepPrefix: (stepId: string): string => {
            return endpoints.steps.withId(stepId) + '/request'
        }
    },
    responses: {
        withStepPrefix: (stepId: string): string => {
            return endpoints.steps.withId(stepId) + '/response'
        }
    },
    requestFields: {
        base: url + "/requestFields",
        withId: (id: string): string => {
            return endpoints.requestFields.base + `/${id}`
        }
    },
    responseFields: {
        base: url + "/responseFields",
        withId: (id: string): string => {
            return endpoints.responseFields.base + `/${id}`
        }
    },
    executions: {
        base: url + "/executions",
        withScenarioPrefix: (scenarioId: string): string => {
            return endpoints.scenarios.withId(scenarioId) + '/execute'
        },
        withId: (id: string): string => {
            return endpoints.executions.base + `/${id}`
        }
    }
}