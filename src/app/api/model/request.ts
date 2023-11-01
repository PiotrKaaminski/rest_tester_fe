import {HttpMethod, StepStructureInfo} from "./steps";
import {StructureFieldType} from "./structureField";

export enum RequestFieldValueType {
    NULL = 'NULL',
    STRICT = 'STRICT',
    PARAMETER = 'PARAMETER',
    RANDOM = 'RANDOM'
}

export class UpdateRequestRequest {
    structureId: string | null
    method: HttpMethod | null
    endpoint: string | null

    constructor(structureId: string | null, method: HttpMethod | null, endpoint: string | null) {
        this.structureId = structureId;
        this.method = method;
        this.endpoint = endpoint;
    }
}

export class UpdateRequestFieldRequest {
    valueType: RequestFieldValueType
    strictValue: string | null
    parameterId: string | null
    randomValue: RandomValue | null

    constructor(valueType: RequestFieldValueType, strictValue: string | null, parameterId: string | null, randomValue: RandomValue | null) {
        this.valueType = valueType;
        this.strictValue = strictValue;
        this.parameterId = parameterId;
        this.randomValue = randomValue;
    }
}

export interface RandomValue {
    from: number,
    to: number
}

export interface StepRequestDetails {
    id: string,
    method: HttpMethod,
    endpoint: string,
    structure: StepStructureInfo | null,
    fields: StepRequestField[] | null
}

export interface StepRequestField {
    id: string,
    name: string,
    valueType: RequestFieldValueType,
    fieldType: StructureFieldType,
    strictValue: string | null,
    parameterId: string | null,
    randomValue: RandomValue | null
}