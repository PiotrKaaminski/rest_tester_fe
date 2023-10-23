export interface Pagination {
    size: number;
    page: number;
}

export interface PaginatedResponse<Data> {
    rows: Data[];
    total: number;
    pagination: Pagination;
}

export function defaultPaginatedResponse<Data>(): PaginatedResponse<Data> {
    return {
        rows: [],
        total: 0,
        pagination: {
            size: 0,
            page: 0
        }
    }
}