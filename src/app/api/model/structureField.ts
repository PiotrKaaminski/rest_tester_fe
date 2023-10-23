export enum StructureFieldType {
    NUMBER = 'NUMBER',
    STRING = 'STRING',
    BOOLEAN = 'BOOLEAN'
}

export enum StructureFieldValidationError {
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    STRUCTURE_NOT_FOUND = 'STRUCTURE_NOT_FOUND',
    NOT_FOUND = 'NOT_FOUND',
    NAME_EMPTY = 'NAME_EMPTY',
    NAME_NOT_UNIQUE = 'NAME_NOT_UNIQUE',
    NAME_CONTAINS_WHITESPACE = 'NAME_CONTAINS_WHITESPACE',
    NAME_TOO_LONG = 'NAME_TOO_LONG',
    TYPE_EMPTY = 'TYPE_EMPTY'
}

export interface StructureFieldValidationErrorResponse {
    status: StructureFieldValidationError
}

export class CreateOrUpdateStructureFieldRequest {
    name: string | null;
    type: StructureFieldType | null;

    constructor(name: string | null, type: StructureFieldType | null) {
        this.name = name;
        this.type = type;
    }
}