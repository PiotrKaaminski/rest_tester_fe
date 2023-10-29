import {useEffect, useState} from "react";
import {defaultPaginatedResponse, PaginatedResponse} from "../../../api/model/common";
import {
    CreateOrUpdateScenarioRequest,
    ScenarioInfo,
    ScenarioValidationError,
    ScenarioValidationErrorResponse
} from "../../../api/model/scenarios";
import {endpoints} from "../../../api/endpoints/endpoints";
import {MaterialReactTable, MRT_ColumnDef, MRT_Row} from "material-react-table";
import {formatDate} from "../../../utils";
import {
    Box,
    Button,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TableCellProps, TextField,
    Tooltip
} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {Delete, Edit} from "@mui/icons-material";
import {
    CreateOrUpdateStructureRequest, StructureInfo,
    StructureValidationError,
    StructureValidationErrorResponse
} from "../../../api/model/structures";

interface ModalState {
    open: boolean
    reason: 'CREATE' | 'UPDATE' | null
    onSubmit: ((newStructure: CreateOrUpdateScenarioRequest) => Promise<ScenarioValidationError | null>)
    currentName: string
}

export default function ScenarioList() {
    const [modalState, setModalState] = useState<ModalState>({
        open: false,
        reason: null,
        onSubmit: async () => null,
        currentName: ''
    })
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

    const handleCreateNewRow = async (newScenario: CreateOrUpdateScenarioRequest): Promise<ScenarioValidationError | null> => {
        const response = await fetch(endpoints.scenarios.base, {
            method: 'POST',
            body: JSON.stringify(newScenario),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (response.ok) {
            fetchData()
            return null;
        }
        const errorResponse = await response.json() as ScenarioValidationErrorResponse
        return errorResponse.status
    }

    const handleUpdateRow = async (updatedStructure: CreateOrUpdateScenarioRequest, id: string): Promise<ScenarioValidationError | null> => {
        const response = await fetch(endpoints.scenarios.withId(id), {
            method: 'PATCH',
            body: JSON.stringify(updatedStructure),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (response.ok) {
            fetchData()
            return null;
        }
        const errorResponse = await response.json() as ScenarioValidationErrorResponse
        return errorResponse.status;
    }

    const handleDeleteRow = async (row: MRT_Row<ScenarioInfo>) => {
        // eslint-disable-next-line no-restricted-globals
        if (!confirm(`Jesteś pewny, że chcesz usunąć scenariusz ${row.original.name}?`)) {
            return;
        }
        // delete nie zaimplementowany
        // await fetch(endpoints.scenarios.withId(row.id), {
        //     method: 'DELETE'
        // })
        fetchData()
    }

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
                                onClick={() => setModalState({
                                    open: true,
                                    reason: `UPDATE`,
                                    onSubmit: (updatedStructure) => handleUpdateRow(updatedStructure, row.id),
                                    currentName: row.original.name
                                })}
                            >
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={"Usuń"} arrow={true} placement={'left'}>
                            <IconButton
                                onClick={() => handleDeleteRow(row)}
                            >
                                <Delete/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
                renderTopToolbarCustomActions={() => (
                    <Button
                        color={"success"}
                        onClick={() => setModalState({
                            open: true,
                            reason: 'CREATE',
                            onSubmit: handleCreateNewRow,
                            currentName: ''
                        })}
                        variant={"contained"}>
                        Dodaj scenariusz
                    </Button>
                )}
            />
            <CreateOrUpdateModal
                onClose={() => setModalState({...modalState, open: false})}
                state={modalState}
            />
        </div>
    )
}

interface CreateOrUpdateModalProps {
    onClose: () => void;
    state: ModalState;
}

export const CreateOrUpdateModal = ({
                                        state,
                                        onClose,
                                    }: CreateOrUpdateModalProps) => {
    const [name, setName] = useState<string>(state.currentName);
    const [validationError, setValidationError] = useState<ScenarioValidationError | null>();

    useEffect(() => {
        if (!state.open) {
            setValidationError(null)
        }
    }, [state.open])

    useEffect(() => {
        setName(state.currentName)
    }, [state.currentName])
    const errorInfoMap: Record<ScenarioValidationError, string> = {
        NOT_FOUND: 'Nie znaleziono scenariusza',
        INTERNAL_SERVER_ERROR: 'Wystąpił nieoczekiwany błąd',
        NAME_EMPTY: 'Nazwa jest pusta',
        NAME_NOT_UNIQUE: 'Nazwa nie jest unikalna',
        NAME_TOO_LONG: 'Nazwa jest za długa'
    }

    const errorInfo: string | null = validationError == null ? null : errorInfoMap[validationError]

    const title = state.reason === 'CREATE' ? 'Nowy scenariusz' : 'Aktualizacja scenariusza';
    const submitLabel = state.reason === 'CREATE' ? 'Dodaj' : 'Aktualizuj';

    const handleSubmit = async () => {
        if (name === '') {
            setValidationError(ScenarioValidationError.NAME_EMPTY)
            return;
        }
        const error = await state.onSubmit(new CreateOrUpdateScenarioRequest(name));
        if (error == null) {
            onClose();
        }
        setValidationError(error)
    }

    return (
        <Dialog open={state.open}>
            <DialogTitle textAlign={"center"}>{title}</DialogTitle>
            <DialogContent>
                <form onSubmit={(e) => e.preventDefault()}>
                    <Stack
                        sx={{
                            width: '100%',
                            minWidth: {xs: '300px', sm: '360px', md: '400px'},
                            marginTop: '1rem',
                            gap: '2.5rem',
                        }}>
                        <TextField
                            key={'name'}
                            label={'Nazwa'}
                            name={'name'}
                            error={validationError != null}
                            helperText={errorInfo}
                            defaultValue={state.currentName}
                            onChange={(e) => {
                                if (e.target.value === '') {
                                    setValidationError(ScenarioValidationError.NAME_EMPTY)
                                } else {
                                    setValidationError(null);
                                }
                                setName(e.target.value)
                            }}
                        />
                    </Stack>
                </form>
            </DialogContent>
            <DialogActions sx={{p: '1.25rem'}}>
                <Button onClick={onClose}>Anuluj</Button>
                <Button color={"success"} onClick={handleSubmit} variant={"contained"}>
                    {submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    )
}