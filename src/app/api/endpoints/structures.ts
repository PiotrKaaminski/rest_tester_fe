const url = "http://localhost:8080"

export const endpoints = {
    structures: url + "/structures",
    structure: (id: string): string => {
        return endpoints.structures + `/${id}`;
    }
}

export interface StructureInfo {
    id: string;
    name: string;
    fieldsAmount: number;
    creationDate: string;
    updateDate: string;
}

export class CreateOrUpdateStructureRequest {
    name: string | null;
    description: string | null;
    constructor(name: string | null, description: string | null) {
        this.name = name;
        this.description = description;
    }
}

export enum StructureValidationError {
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    NAME_EMPTY = 'NAME_EMPTY',
    NAME_CONTAINS_WHITESPACE = 'NAME_CONTAINS_WHITESPACE',
    NAME_NOT_UNIQUE = 'NAME_NOT_UNIQUE',
    NAME_TOO_LONG = 'NAME_TOO_LONG'
}

export interface StructureValidationErrorResponse {
    status: StructureValidationError
}