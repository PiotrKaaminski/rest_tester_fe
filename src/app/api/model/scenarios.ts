export interface ScenarioInfo {
    id: string,
    name: string,
    stepsAmount: number,
    testExecutionsAmount: string,
    creationDate: string,
    updateDate: string
}

export class CreateOrUpdateScenarioRequest {
    name: string | null;

    constructor(name: string | null) {
        this.name = name;
    }
}

export enum ScenarioValidationError {
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    NAME_EMPTY = 'NAME_EMPTY',
    NAME_NOT_UNIQUE = 'NAME_NOT_UNIQUE',
    NAME_TOO_LONG = 'NAME_TOO_LONG'
}

export interface ScenarioValidationErrorResponse {
    status: ScenarioValidationError
}