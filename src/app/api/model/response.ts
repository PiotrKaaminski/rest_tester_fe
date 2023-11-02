import {StepStructureInfo} from "./steps";
import {StructureFieldType} from "./structureField";

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
    fieldType: StructureFieldType,
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

export class UpdateResponseRequest {
    httpStatus: number | null
    structureId: string | null


    constructor(httpStatus: number | null, structureId: string | null) {
        this.httpStatus = httpStatus;
        this.structureId = structureId;
    }
}