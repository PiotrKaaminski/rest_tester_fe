export interface CreateExecution {
    baseUrl: string
}

export interface CreateExecutionResponse {
    id: string
}

export interface ExecutionInfo {
    id: string,
    scenarioName: string,
    status: ExecutionStatus,
    baseUrl: string,
    startDate: string,
    finishDate: string
}

export enum ExecutionStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED'
}