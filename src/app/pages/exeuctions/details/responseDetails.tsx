import {
    ExecutionResponse,
    ExecutionResponseField, ExecutionResponseFieldAssertionStatus,
    ExecutionResponseFieldValueType
} from "../../../api/model/executionStep";
import React, {useEffect, useState} from "react";
import {TextField} from "@mui/material";
import {MaterialReactTable, MRT_ColumnDef} from "material-react-table";
import {ResponseFieldValueType} from "../../../api/model/response";
import {StructureFieldType} from "../../../api/model/structureField";

export interface ResponseDetailsProps {
    response: ExecutionResponse | undefined
}

const responseFieldValueTypeNameMap: Record<ResponseFieldValueType, string> = {
    ANY: "Dowolna wartość",
    NULL: "NULL / Brak pola",
    PARAMETER: "Parametr",
    STRICT: "Dokładny"
}

const fieldTypeTextMap: Record<ExecutionResponseFieldValueType, string> = {
    STRING: 'Znakowy',
    NUMBER: 'Liczbowy',
    BOOLEAN: 'Boolowski',
    UNKNOWN: 'Nieokreślony'
}

const assertionStatusTextMap: Record<ExecutionResponseFieldAssertionStatus, string> = {
    FIELD_DOESNT_EXIST: "Pole nie istnieje",
    SUCCESS: "Sukces",
    TYPE_MISMATCH: "Rozbieżność typu",
    UNKNOWN_FIELD: "Nieznane pole",
    VALUE_MISMATCH: "Rozbieżność wartości",
    WRONG_PARAMETER_VALUE: "Zła wartość parametru"
}

export function ExecutionResponseDetailsView(props: ResponseDetailsProps) {
    const [response, setResponse] = useState<ExecutionResponse | undefined>(props.response)

    useEffect(() => {
        setResponse(props.response)
    }, [props.response]);

    const columns: MRT_ColumnDef<ExecutionResponseField>[] = [
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
            accessorFn: (field) => responseFieldValueTypeNameMap[field.assertionMode],
            header: 'Typ porównania',
            enableColumnFilter: false
        },
        {
            accessorFn: (field) => fieldTypeTextMap[field.expectedValueType],
            header: 'Oczekiwany typ wartości',
            enableColumnFilter: false
        },
        {
            accessorFn: (field) => field.expectedValue === null ? '-' : field.expectedValue,
            header: 'Oczekiwana wartość',
            enableColumnFilter: false
        },
        {
            accessorFn: (field) => fieldTypeTextMap[field.actualValueType],
            header: 'Otrzymany typ wartości',
            enableColumnFilter: false
        },
        {
            accessorFn: (field) => field.actualValue === null ? '-' : field.actualValue,
            header: 'Otrzymana wartość',
            enableColumnFilter: false
        },
        {
            accessorFn: (field) => assertionStatusTextMap[field.assertionStatus],
            header: 'Wynik porównania',
            enableColumnFilter: false
        }
    ]

    return (
        <>
            <TextField
                key={'httpStatus'}
                label={'Oczekiwany status HTTP'}
                type={'number'}
                value={response?.expectedHttpStatus ?? 200}
            />
            <br/>
            <TextField
                key={'httpStatus'}
                label={'Otrzymany status HTTP'}
                type={'number'}
                className={'mt-4'}
                value={response?.actualHttpStatus ?? 200}
            />
            <h3 className={'mt-4'}>{response?.structureName ?? 'Brak struktury'}</h3>
            {response?.structureName && (
                <MaterialReactTable
                    columns={columns}
                    data={response?.fields ?? []}
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