export interface ParameterInfo {
    id: string,
    name: string,
    initialValue: string,
    usages: ParameterStepUsage[]
}

export interface ParameterStepUsage {
    id: string,
    title: string,
    place: ParameterUsagePlace
}

export enum ParameterUsagePlace {
    REQUEST = 'REQUEST',
    RESPONSE = 'RESPONSE'
}

export class CreateOrUpdateParameterRequest {
    name: string | null
    initialValue: string | null

    constructor(name: string | null, initialValue: string | null) {
        this.name = name;
        this.initialValue = initialValue;
    }
}

export enum ParameterValidationError {
    NOT_FOUND = 'NOT_FOUND',
    NAME_EMPTY = 'NAME_EMPTY',
    NAME_CONTAINS_WHITESPACE = 'NAME_CONTAINS_WHITESPACE',
    NAME_NOT_UNIQUE = 'NAME_NOT_UNIQUE',
    NAME_TOO_LONG = 'NAME_TOO_LONG',
    VALUE_EMPTY = 'VALUE_EMPTY',
    VALUE_TOO_LONG = 'VALUE_TOO_LONG'
}

export interface ParameterValidationErrorResponse {
     status: ParameterValidationError
}