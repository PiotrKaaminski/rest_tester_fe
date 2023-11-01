import {HttpMethod} from "./steps";

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