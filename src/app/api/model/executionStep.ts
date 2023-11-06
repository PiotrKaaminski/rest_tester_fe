import {HttpMethod} from "./steps";

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