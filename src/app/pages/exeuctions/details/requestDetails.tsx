import {ExecutionRequest, ExecutionRequestField, ExecutionRequestFieldDataType} from "../../../api/model/executionStep";
import React, {useEffect, useState} from "react";
import Select from "@mui/material/Select";
import {HttpMethod} from "../../../api/model/steps";
import MenuItem from "@mui/material/MenuItem";
import {Box, IconButton, TextField, Tooltip} from "@mui/material";
import {MaterialReactTable, MRT_ColumnDef} from "material-react-table";
import {RequestFieldValueType} from "../../../api/model/request";
import {Edit} from "@mui/icons-material";

export interface RequestDetailsProps {
    request: ExecutionRequest | undefined
}

const httpMethodStyleMap: Record<HttpMethod, string> = {
    DELETE: "danger",
    GET: "success",
    PATCH: "info",
    POST: "warning",
    PUT: "primary"
}

const requestFieldValueTypeNameMap: Record<ExecutionRequestFieldDataType, string> = {
    STRING: 'Znakowy',
    NUMBER: 'Liczbowy',
    BOOLEAN: 'Boolowski'
}

export function ExecutionRequestDetailsView(props: RequestDetailsProps) {
    const [request, setRequest] = useState<ExecutionRequest | undefined>(props.request)

    useEffect(() => {
        setRequest(props.request)
    }, [props.request]);

    const columns: MRT_ColumnDef<ExecutionRequestField>[] = [
        {
            accessorKey: 'id',
            header: 'Id',
            enableHiding: true,
            enableColumnFilter: false
        },
        {
            accessorKey: 'name',
            header: 'Nazwa',
            enableColumnFilter: true,
            muiTableHeadCellFilterTextFieldProps: {
                placeholder: ''
            }
        },
        {
            accessorFn: (field) => requestFieldValueTypeNameMap[field.dataType],
            header: 'Typ wartości',
            enableColumnFilter: false
        },
        {
            accessorKey: 'value',
            header: 'Wartość',
            enableColumnFilter: false
        }
    ]

    return (
        <>
            <Select
                style={{width: '150px'}}
                className={`bg-${httpMethodStyleMap[request?.method ?? HttpMethod.GET]}-subtle`}
                key={'method'}
                readOnly={true}
                name={'Metoda HTTP'}
                aria-readonly={true}
                value={request?.method ?? HttpMethod.GET}
            >
                <MenuItem value={request?.method ?? HttpMethod.GET}>{request?.method ?? HttpMethod.GET}</MenuItem>
            </Select>
            <br/>
            <TextField
                key={'actualEndpoint'}
                label={'Endpoint'}
                name={'actualEndpoint'}
                className={'mt-4 me-2'}
                style={{width: '50%'}}
                value={request?.actualEndpoint}
            />
            <h3 className={'mt-4'}>{request?.structureName ?? 'Brak struktury'}</h3>
            {request?.structureName && (
                <MaterialReactTable
                    columns={columns}
                    data={request?.fields ?? []}
                    enableHiding={false}
                    enableDensityToggle={false}
                    enableFullScreenToggle={false}
                    enableGlobalFilter={false}
                    state={{
                        columnVisibility: {
                            id: false
                        }
                    }}
                    initialState={{
                        showColumnFilters: true
                    }}
                    getRowId={(originalRow): string => {
                        return originalRow.id
                    }}
                    enableTopToolbar={false}
                />
            )}
        </>
    )
}