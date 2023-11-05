import {useEffect, useState} from "react";
import {ExecutionInfo, ExecutionStatus} from "../../../api/model/executions";
import {defaultPaginatedResponse, PaginatedResponse} from "../../../api/model/common";
import {useNavigate} from "react-router-dom";
import {endpoints} from "../../../api/endpoints/endpoints";
import {MaterialReactTable, MRT_ColumnDef, MRT_Row} from "material-react-table";
import {TableCellProps} from "@mui/material";
import {formatDate} from "../../../utils";

const executionStatusNameMap: Record<ExecutionStatus, string> = {
    PENDING: "W trakcie",
    SUCCESS: "Sukces",
    FAILED: "Błąd"

}
const statusColumnColorMap: Record<ExecutionStatus, string> = {
    PENDING: 'orange',
    SUCCESS: "green",
    FAILED: "red"

}

export default function ExecutionList() {
    const [data, setData] = useState<PaginatedResponse<ExecutionInfo>>(defaultPaginatedResponse<ExecutionInfo>)
    const navigate = useNavigate()

    const fetchData = async () => {
        const response = await fetch(endpoints.executions.base)
        const json = await response.json()
        setData(json)
    }

    useEffect(() => {
        fetchData()
    }, []);

    const onClickNavigateToDetails = (row: MRT_Row<ExecutionInfo>): TableCellProps => {
        return {
            onClick: () => {
                navigate(`/executions/${row.id}`)
                console.log(row.id)
            },
            sx: {
                cursor: 'pointer'
            }
        }
    }

    const getStatusColumnColor = (row: MRT_Row<ExecutionInfo>): TableCellProps => {
        return {
            sx: {
                color: statusColumnColorMap[row.original.status]
            }
        }
    }

    const columns: MRT_ColumnDef<ExecutionInfo>[] = [
        {
            accessorKey: 'id',
            header: 'Id',
            enableHiding: true,
            enableColumnFilter: false,
        },
        {
            accessorKey: 'scenarioName',
            header: 'Nazwa scenariusza',
            enableColumnFilter: true,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToDetails(row),
            muiTableHeadCellFilterTextFieldProps: {
                placeholder: ''
            }
        },
        {
            accessorFn: (row) => executionStatusNameMap[row.status],
            header: 'Status',
            muiTableBodyCellProps: ({ row }): TableCellProps => {
                return {
                    ...onClickNavigateToDetails(row),
                    ...getStatusColumnColor(row)
                }
            },
            muiTableHeadCellFilterTextFieldProps: {
                placeholder: ''
            }
        },
        {
            accessorKey: 'baseUrl',
            header: 'Bazowy adres',
            enableColumnFilter: true,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToDetails(row),
            muiTableHeadCellFilterTextFieldProps: {
                placeholder: ''
            }
        },
        {
            accessorKey: 'startDate',
            accessorFn: (row) => formatDate(row.startDate),
            header: 'Data startu',
            enableColumnFilter: false,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToDetails(row)
        },
        {
            accessorKey: 'finishDate',
            accessorFn: (row) => formatDate(row.finishDate),
            header: 'Data końca',
            enableColumnFilter: false,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToDetails(row)
        }
    ]
    return (
        <div className={'m-5'}>
            <MaterialReactTable
                columns={columns}
                data={data.rows}
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
    )
}