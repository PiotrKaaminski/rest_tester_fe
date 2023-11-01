import {RandomValue, RequestFieldValueType, StepRequestDetails} from "./request";

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE'
}

export class CreateOrUpdateStepRequest {
    title: string | null;
    sequence: number | null;


    constructor(title: string | null, sequence: number | null) {
        this.title = title;
        this.sequence = sequence;
    }
}

export enum StepValidationError {
    TITLE_EMPTY = 'TITLE_EMPTY',
    TITLE_NOT_UNIQUE = 'TITLE_NOT_UNIQUE',
    TITLE_TOO_LONG = 'TITLE_TOO_LONG',
    SEQUENCE_LESS_THAN_ONE = 'SEQUENCE_LESS_THAN_ONE',
    SEQUENCE_TOO_HIGH = 'SEQUENCE_TOO_HIGH'
}

export interface StepValidationErrorResponse {
    status: StepValidationError
}

export interface StepDetails {
    id: string,
    title: string,
    creationDate: string,
    updateDate: string,
    scenario: {
        id: string,
        name: string
    },
    request: StepRequestDetails,
    response: StepResponseDetails
}

export interface StepResponseDetails {
    id: string,
    httpStatus: number,
    structure: StepStructureInfo | null,
    fields: StepResponseField[] | null
}

export interface StepResponseField {
    id: string,
    name: string,
    valueType: ResponseFieldValueType,
    strictValue: string | null,
    parameterToReadId: string | null,
    saveToParameter: boolean,
    parameterToSaveId: string | null
}

export enum ResponseFieldValueType {
    NULL = 'NULL',
    STRICT = 'STRICT',
    PARAMETER = 'PARAMETER',
    ANY = 'ANY'
}

export interface StepStructureInfo {
    id: string,
    name: string
}