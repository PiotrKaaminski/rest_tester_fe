import {HttpMethod} from "./steps";
import {ResponseFieldValueType} from "./response";

export interface ExecutionDetailsStep {
    id: string,
    title: string,
    method: HttpMethod,
    endpoint: string,
    sequence: number,
    status: ExecutionStepStatus,
    executionDate: string | null
}

export enum ExecutionStepStatus {
    WAITING = 'WAITING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    SKIPPED = 'SKIPPED'
}

export interface ExecutionStep {
    id: string,
    title: string,
    status: ExecutionStepStatus
    executionDate: string | null
    execution: {
        id: string
        name: string
    }
    request: ExecutionRequest
    response: ExecutionResponse
}

export interface ExecutionRequest {
    id: string
    method: HttpMethod
    endpointTemplate: string
    actualEndpoint: string
    structureName: string | null
    fields: ExecutionRequestField[]
}

export interface ExecutionRequestField {
    id: string
    name: string
    valueType: ExecutionRequestFieldValueType
    dataType: ExecutionRequestFieldDataType
    value: string
}

export enum ExecutionRequestFieldValueType {
    NULL = 'NULL',
    STRICT = 'STRICT',
    PARAMETER = 'PARAMETER'
}

export enum ExecutionRequestFieldDataType {
    BOOLEAN = 'BOOLEAN',
    STRING = 'STRING',
    NUMBER = 'NUMBER'
}

export interface ExecutionResponse {
    id: string
    expectedHttpStatus: number
    actualHttpStatus: number | null
    structureName: string | null
    fields: ExecutionResponseField[]
}

export interface ExecutionResponseField {
    id: string
    name: string
    assertionMode: ResponseFieldValueType
    expectedValueType: ExecutionResponseFieldValueType
    expectedValue: string | null
    assertionStatus: ExecutionResponseFieldAssertionStatus
    actualValueType: ExecutionResponseFieldValueType
    actualValue: string | null
}

export enum ExecutionResponseFieldValueType {
    BOOLEAN = 'BOOLEAN',
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    UNKNOWN = 'UNKNOWN'
}

export enum ExecutionResponseFieldAssertionStatus {
    SUCCESS = 'SUCCESS',
    FIELD_DOESNT_EXIST = 'FIELD_DOESNT_EXIST',
    TYPE_MISMATCH = 'TYPE_MISMATCH',
    WRONG_PARAMETER_VALUE = 'WRONG_PARAMETER_VALUE',
    VALUE_MISMATCH = 'VALUE_MISMATCH',
    UNKNOWN_FIELD = 'UNKNOWN_FIELD',
}
