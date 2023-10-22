import {useEffect, useState} from "react";
import {defaultPaginatedResponse, PaginatedResponse} from "../../../api/model";
import {
    StructureValidationError,
    StructureValidationErrorResponse,
    CreateOrUpdateStructureRequest,
    endpoints,
    StructureInfo
} from "../../../api/endpoints/structures";
import {MaterialReactTable, type MRT_ColumnDef, MRT_Row} from "material-react-table";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack, TableCellProps,
    TextField,
    Tooltip
} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";

interface ModalState {
    open: boolean
    reason: 'CREATE' | 'UPDATE' | null
    onSubmit: ((newStructure: CreateOrUpdateStructureRequest) => Promise<StructureValidationError | null>)
    currentName: string
}

export default function StructureList() {
    const [modalState, setModalState] = useState<ModalState>({
        open: false,
        reason: null,
        onSubmit: async () => null,
        currentName: ''
    })
    const [data, setData] = useState<PaginatedResponse<StructureInfo>>(defaultPaginatedResponse<StructureInfo>())
    const navigate = useNavigate();
    const fetchData = async () => {
        const response = await fetch(endpoints.structures);
        const json = await response.json();
        setData(json);
    }

    useEffect(() => {
        fetchData()
    }, []);

    const onClickNavigateToDetails = (row: MRT_Row<StructureInfo>): TableCellProps => {
            return {
                onClick: () => {
                    navigate(`/structures/${row.id}`)
                    console.log(row.id)
                },
                sx: {
                    cursor: 'pointer'
                }
            }
    }

    const columns: MRT_ColumnDef<StructureInfo>[] = [
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
            accessorKey: 'fieldsAmount',
            header: 'Ilość pól',
            enableColumnFilter: false,
            enableEditing: false,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToDetails(row)
        },
        {
            accessorKey: 'creationDate',
            header: 'Data utworzenia',
            enableColumnFilter: false,
            enableEditing: false,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToDetails(row)
        },
        {
            accessorKey: 'updateDate',
            header: 'Data aktualizacji',
            enableColumnFilter: false,
            enableEditing: false,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToDetails(row)
        }
    ]

    const handleCreateNewRow = async (newStructure: CreateOrUpdateStructureRequest): Promise<StructureValidationError | null> => {
        const response = await fetch(endpoints.structures, {
            method: 'POST',
            body: JSON.stringify(newStructure),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (response.ok) {
            fetchData()
            return null;
        }
        const errorResponse = await response.json() as StructureValidationErrorResponse
        return errorResponse.status;
    }

    const handleUpdateRow = async (updatedStructure: CreateOrUpdateStructureRequest, id: string): Promise<StructureValidationError | null> => {
        const response = await fetch(endpoints.structure(id), {
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
        const errorResponse = await response.json() as StructureValidationErrorResponse
        return errorResponse.status;
    }

    const handleDeleteRow = async (row: MRT_Row<StructureInfo>) => {
        // eslint-disable-next-line no-restricted-globals
        if (!confirm(`Jesteś pewny, że chcesz usunąć strukturę ${row.original.name}?`)) {
            return;
        }
        await fetch(endpoints.structure(row.id), {
            method: 'DELETE'
        })
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
                                })}>
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={"Usuń"} arrow={true} placement={'left'}>
                            <IconButton
                                // todo prawdopodobnie zamienić na modal zamiast confirm
                                onClick={() => handleDeleteRow(row)}>
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
                        })} variant={"contained"}>
                        Dodaj strukturę
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
    const [validationError, setValidationError] = useState<StructureValidationError | null>();

    useEffect(() => {
        if (!state.open) {
            setValidationError(null)
        }
    }, [state.open])

    const errorInfoMap: Record<StructureValidationError, string> = {
        [StructureValidationError.INTERNAL_SERVER_ERROR]: 'Wystąpił nieoczekiwany błąd',
        [StructureValidationError.NAME_EMPTY]: 'Nazwa jest pusta',
        [StructureValidationError.NAME_CONTAINS_WHITESPACE]: 'Nazwa zawiera biały znak',
        [StructureValidationError.NAME_NOT_UNIQUE]: 'Nazwa nie jest unikalna',
        [StructureValidationError.NAME_TOO_LONG]: 'Nazwa jest za długa'
    }

    const errorInfo: string | null = validationError == null ? null : errorInfoMap[validationError]

    const title = state.reason === 'CREATE' ? 'Nowa struktura' : 'Aktualizacja struktury';
    const submitLabel = state.reason === 'CREATE' ? 'Dodaj' : 'Aktualizuj';

    const handleSubmit = async () => {
        if (name.indexOf(' ') >= 0) {
            setValidationError(StructureValidationError.NAME_CONTAINS_WHITESPACE)
            return;
        }
        if (name === '') {
            setValidationError(StructureValidationError.NAME_EMPTY)
            return;
        }
        const error = await state.onSubmit(new CreateOrUpdateStructureRequest(name, null));
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
                            minWidth: { xs: '300px', sm: '360px', md: '400px'},
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
                                if (e.target.value.indexOf(' ') >= 0) {
                                    setValidationError(StructureValidationError.NAME_CONTAINS_WHITESPACE)
                                } else if (e.target.value === '') {
                                    setValidationError(StructureValidationError.NAME_EMPTY)
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