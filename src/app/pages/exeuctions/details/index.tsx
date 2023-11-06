import {useNavigate, useParams} from "react-router-dom";
import {ExecutionDetails, ExecutionStatus} from "../../../api/model/executions";
import React, {useEffect, useState} from "react";
import {endpoints} from "../../../api/endpoints/endpoints";
import {MaterialReactTable, MRT_ColumnDef, MRT_Row} from "material-react-table";
import {TableCellProps} from "@mui/material";
import {ExecutionDetailsStep, ExecutionStepStatus} from "../../../api/model/executionStep";
import {formatDate} from "../../../utils";

const executionStepStatusNameMap: Record<ExecutionStepStatus, string> = {
    FAILED: "Błąd",
    SKIPPED: "Pominięty",
    SUCCESS: "Sukces",
    WAITING: "Oczekuje"
}

const executionStepStatusColorMap: Record<ExecutionStepStatus, string> = {
    FAILED: "red",
    SKIPPED: "grey",
    SUCCESS: "green",
    WAITING: "blue"
}

const executionStatusColumnColorMap: Record<ExecutionStatus, string> = {
    PENDING: 'blue',
    SUCCESS: "green",
    FAILED: "red"
}

export default function ExecutionDetailsView() {
    const {id} = useParams()
    const [execution, setExecution] = useState<ExecutionDetails>()
    const navigate = useNavigate()

    const fetchExecution = async () => {
        if (!id) return
        fetch(endpoints.executions.withId(id))
            .then(response => response.json())
            .then(setExecution)
    }

    useEffect(() => {
        fetchExecution()
    }, []);

    const onClickNavigateToStepDetails = (row: MRT_Row<ExecutionDetailsStep>): TableCellProps => {
        return {
            onClick: () => {
                navigate(`/executions/steps/${row.id}`)
            },
            sx: {
                cursor: 'pointer'
            }
        }
    }

    const getStatusColumnColor = (row: MRT_Row<ExecutionDetailsStep>): TableCellProps => {
        return {
            sx: {
                color: executionStepStatusColorMap[row.original.status]
            }
        }
    }

    const executionStepColumns: MRT_ColumnDef<ExecutionDetailsStep>[] = [
        {
            accessorKey: 'id',
            header: 'Id',
            enableHiding: true,
            enableColumnFilter: false
        },
        {
            accessorKey: 'title',
            header: 'Tytuł',
            enableColumnFilter: true,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToStepDetails(row),
            muiTableHeadCellFilterTextFieldProps: {
                placeholder: ''
            }
        },
        {
            accessorKey: 'method',
            header: 'Metoda HTTP',
            enableColumnFilter: true,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToStepDetails(row),
            muiTableHeadCellFilterTextFieldProps: {
                placeholder: ''
            }
        },
        {
            accessorKey: 'endpoint',
            header: 'Endpoint',
            enableColumnFilter: true,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToStepDetails(row),
            muiTableHeadCellFilterTextFieldProps: {
                placeholder: ''
            }
        },
        {
            accessorFn: field => formatDate(field.executionDate),
            muiTableBodyCellProps: ({ row }) => onClickNavigateToStepDetails(row),
            header: 'Data utworzenia',
            enableColumnFilter: false,
        },
        {
            accessorFn: (row) => executionStepStatusNameMap[row.status],
            header: 'Status',
            muiTableBodyCellProps: ({ row }): TableCellProps => {
                return {
                    ...onClickNavigateToStepDetails(row),
                    ...getStatusColumnColor(row)
                }
            },
            muiTableHeadCellFilterTextFieldProps: {
                placeholder: ''
            }
        },
    ]

    return (
        <>
            <div className={'container mt-5'}>
                <div
                    style={{
                        width: '100%',
                        height: '50px',
                        backgroundColor: executionStatusColumnColorMap[execution?.status ?? ExecutionStatus.PENDING],
                        borderRadius: '10px'
                    }}
                />
                <div className={'mt-5 d-flex justify-content-center'}>
                    <h2>{execution?.scenarioName}</h2>
                </div>
                <ul className={'mt-4'}>
                    <li className={'mb-2'}><b>Data utworzenia:</b> {formatDate(execution?.startDate)}</li>
                    <li><b>Data aktualizacji:</b> {formatDate(execution?.finishDate)}</li>
                </ul>
                <h4 className={'mt-4'}>
                    Kroki scenariusza:
                </h4>
                <div className={'m-2'}/>
                <MaterialReactTable
                    columns={executionStepColumns}
                    data={execution?.steps ?? []}
                    enableHiding={false}
                    enableDensityToggle={false}
                    enableFullScreenToggle={false}
                    enableGlobalFilter={false}
                    enableTopToolbar={false}
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
                />
            </div>
        </>
    )
}