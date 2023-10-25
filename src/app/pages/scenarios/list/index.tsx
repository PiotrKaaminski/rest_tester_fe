import {useEffect, useState} from "react";
import {defaultPaginatedResponse, PaginatedResponse} from "../../../api/model/common";
import {ScenarioInfo} from "../../../api/model/scenarios";
import {endpoints} from "../../../api/endpoints/endpoints";
import {MaterialReactTable, MRT_ColumnDef, MRT_Row} from "material-react-table";
import {formatDate} from "../../../utils";
import {Box, Button, IconButton, TableCellProps, Tooltip} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {Delete, Edit} from "@mui/icons-material";

export default function ScenarioList() {
    const [data, setData] = useState<PaginatedResponse<ScenarioInfo>>(defaultPaginatedResponse<ScenarioInfo>);
    const navigate = useNavigate();

    const fetchData = async () => {
        const response = await fetch(endpoints.scenarios.base);
        const json = await response.json();
        setData(json);
    }

    useEffect(() => {
        fetchData()
    }, [])

    const onClickNavigateToDetails = (row: MRT_Row<ScenarioInfo>): TableCellProps => {
        return {
            onClick: () => {
                navigate(`/scenarios/${row.id}`)
                console.log(row.id)
            },
            sx: {
                cursor: 'pointer'
            }
        }
    }

    const columns: MRT_ColumnDef<ScenarioInfo>[] = [
        {
            accessorKey: 'id',
            header: 'Id',
            enableHiding: true,
            enableColumnFilter: false,
            enableEditing: false
        },
        {
            accessorKey: 'name',
            header: 'Nazwa',
            enableColumnFilter: true,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToDetails(row),
            muiTableHeadCellFilterTextFieldProps: {
                placeholder: ''
            }
        },
        {
            accessorKey: 'stepsAmount',
            header: 'Ilość kroków',
            enableColumnFilter: false,
            enableEditing: false,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToDetails(row)
        },
        {
            accessorKey: 'testExecutionsAmount',
            header: 'Ilość wykonań',
            enableColumnFilter: false,
            enableEditing: false,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToDetails(row)
        },
        {
            accessorKey: 'creationDate',
            accessorFn: (structureInfo) => formatDate(structureInfo.creationDate),
            header: 'Data utworzenia',
            enableColumnFilter: false,
            enableEditing: false,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToDetails(row)
        },
        {
            accessorKey: 'updateDate',
            accessorFn: (structureInfo) => formatDate(structureInfo.updateDate),
            header: 'Data aktualizacji',
            enableColumnFilter: false,
            enableEditing: false,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToDetails(row)
        }
    ]
    return (
        <div className={'m-5'}>
            <MaterialReactTable
                columns={columns}
                data={data.rows}
                enableHiding={false}
                enableColumnActions={true}
                enableDensityToggle={false}
                enableFullScreenToggle={false}
                enableGlobalFilter={false}
                enableEditing={true}
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
                positionActionsColumn="last"
                displayColumnDefOptions={{
                    'mrt-row-actions': {
                        header: 'Akcje'
                    }
                }}
                renderRowActions={({row }) => (
                    <Box sx={{ display: 'flex', gap: '1rem'}}>
                        <Tooltip title={"Edytuj"} arrow={true} placement={'left'}>
                            <IconButton
                                // onClick={() => setModalState({
                                //     open: true,
                                //     reason: `UPDATE`,
                                //     onSubmit: (updatedStructure) => handleUpdateRow(updatedStructure, row.id),
                                //     currentName: row.original.name
                                // })}
                            >
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={"Usuń"} arrow={true} placement={'left'}>
                            <IconButton
                                // todo prawdopodobnie zamienić na modal zamiast confirm
                                // onClick={() => handleDeleteRow(row)}
                            >
                                <Delete/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
                renderTopToolbarCustomActions={() => (
                    <Button
                        color={"success"}
                        // onClick={() => setModalState({
                        //     open: true,
                        //     reason: 'CREATE',
                        //     onSubmit: handleCreateNewRow,
                        //     currentName: ''
                        // })}
                        variant={"contained"}>
                        Dodaj scenariusz
                    </Button>
                )}
            />
            {/*<CreateOrUpdateModal*/}
            {/*    onClose={() => setModalState({...modalState, open: false})}*/}
            {/*    state={modalState}*/}
            {/*/>*/}
        </div>
    )
}