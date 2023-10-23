import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {StructureDetails, StructureDetailsField} from "../../../api/model/structures";
import {endpoints} from "../../../api/endpoints/structures";
import {formatDate} from "../../../utils";
import {MaterialReactTable, MRT_ColumnDef} from "material-react-table";
import {
    CreateOrUpdateStructureFieldRequest,
    StructureFieldType,
    StructureFieldValidationError
} from "../../../api/model/structureField";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Tooltip
} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";

const fieldTypeTextMap: Record<StructureFieldType, string> = {
    [StructureFieldType.STRING]: 'Znakowy',
    [StructureFieldType.NUMBER]: 'Liczbowy',
    [StructureFieldType.BOOLEAN]: 'Boolowski'
}

interface StructureFieldModalState {
    open: boolean
    reason: 'CREATE' | 'UPDATE'
    onSubmit: ((fieldData: CreateOrUpdateStructureFieldRequest) => Promise<StructureFieldValidationError | null>)
    initialData: CreateOrUpdateStructureFieldRequest | null
}

export default function StructureDetailsView() {
    const [structureFieldModalState, setStructureFieldModalState] = useState<StructureFieldModalState>({
        open: false,
        reason: 'CREATE',
        onSubmit: async () => null,
        initialData: null
    })
    const [structure, setStructure] = useState<StructureDetails>();
    const { id } = useParams();

    useEffect( () => {
        if (!id) return
        fetch(endpoints.structure(id))
            .then(response => response.json())
            .then(structure => {
                setStructure(structure)
            })
    }, [id])

    const fieldColumns: MRT_ColumnDef<StructureDetailsField>[] = [
        {
            accessorKey: 'id',
            header: 'Id',
            enableHiding: true,
            enableColumnFilter: false,
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
            accessorKey: 'type',
            accessorFn: (field => fieldTypeTextMap[field.type]),
            header: 'Typ',
            enableColumnFilter: false
        },
        {
            accessorKey: 'creationDate',
            accessorFn: (field) => formatDate(field.creationDate),
            header: 'Data utworzenia',
            enableColumnFilter: false,
        },
        {
            accessorKey: 'updateDate',
            accessorFn: (field) => formatDate(field.updateDate),
            header: 'Data aktualizacji',
            enableColumnFilter: false,
        }
    ]
    return (
        <>
            <div className={'container mt-5'}>
                <div className={'d-flex justify-content-center'}>
                    <h2>{structure?.name}</h2>
                </div>
                <ul className={'mt-4'}>
                    <li className={'mb-2'}><b>Data utworzenia:</b> {formatDate(structure?.creationDate)}</li>
                    <li><b>Data aktualizacji:</b> {formatDate(structure?.updateDate)}</li>
                </ul>
                <h4 className={'mt-4'}>Opis:</h4>
                <p>{structure?.description}</p>
                <button className={'btn btn-primary mt-4'}>Edycja opisu</button>
                <h4 className={'mt-4'}>Pola:</h4>
            </div>
            <div className={'m-5 mt-4'}>
                <MaterialReactTable
                    columns={fieldColumns}
                    data={structure?.fields ?? []}
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
                                    // })}>
                                    >
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={"Usuń"} arrow={true} placement={'left'}>
                                <IconButton
                                    // todo prawdopodobnie zamienić na modal zamiast confirm
                                    // onClick={() => handleDeleteRow(row)}>
                                    >
                                    <Delete/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    renderTopToolbarCustomActions={() => (
                        <Button
                            color={"success"}
                            onClick={() => setStructureFieldModalState({
                                open: true,
                                reason: 'CREATE',
                                onSubmit: async () => null,
                                initialData: null
                            })}
                            variant={"contained"}>
                            Dodaj pole
                        </Button>
                    )}
                />
            </div>
            <StructureFieldModal
                onClose={() => setStructureFieldModalState({...structureFieldModalState, open: false})}
                state={structureFieldModalState}
            />
        </>
    )
}

interface StructureFieldModalProps {
    onClose: () => void;
    state: StructureFieldModalState
}

export const StructureFieldModal = ({
    onClose,
    state
}: StructureFieldModalProps) => {
    const [name, setName] = useState<string>(state.initialData?.name ?? '')
    const [type, setType] = useState<StructureFieldType>(state.initialData?.type ?? StructureFieldType.STRING)
    const [nameValidationError, setNameValidationError] = useState<StructureFieldValidationError | null>(null)
    const [typeValidationError, setTypeValidationError] = useState<StructureFieldValidationError | null>(null)

    useEffect(() => {
        if (!state.open) {
            setNameValidationError(null)
            setTypeValidationError(null)
        }
    }, [state.open])

    const nameErrorInfoMap = new Map<StructureFieldValidationError, string> ([
        [StructureFieldValidationError.NAME_CONTAINS_WHITESPACE, "Nazwa zawiera biały znak"],
        [StructureFieldValidationError.NAME_EMPTY, "Nazwa jest pusta"],
        [StructureFieldValidationError.NAME_NOT_UNIQUE, "Nazwa nie jest unikalna"],
        [StructureFieldValidationError.NAME_TOO_LONG, "Nazwa jest za długa"]
    ])

    const typeErrorInfoMap = new Map<StructureFieldValidationError, string> ([
        [StructureFieldValidationError.TYPE_EMPTY, "Typ jest pusty"]
    ])

    const handleSubmit = async () => {
        if (name.indexOf(' ') >= 0) {
            setNameValidationError(StructureFieldValidationError.NAME_CONTAINS_WHITESPACE)
            return
        }
        if (name == '') {
            setNameValidationError(StructureFieldValidationError.NAME_EMPTY)
            return
        }
        const error = await state.onSubmit(new CreateOrUpdateStructureFieldRequest(name, type));
        if (error == null) {
            onClose()
        }
        if (error == StructureFieldValidationError.TYPE_EMPTY) {
            setTypeValidationError(error)
        } else {
            setNameValidationError(error)
        }
    }

    const nameErrorInfo: string | undefined = nameValidationError == null ? undefined : nameErrorInfoMap.get(nameValidationError)
    const typeErrorInfo: string | undefined = typeValidationError == null ? undefined : typeErrorInfoMap.get(typeValidationError)

    const title = state.reason === 'CREATE' ? 'Nowe pole' : 'Aktualizacja pola'
    const submitLabel = state.reason === 'CREATE' ? 'Dodaj' : 'Aktualizuj'

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
                            gap: '1.5rem',
                        }}>
                        <TextField
                            key={'name'}
                            label={'Nazwa'}
                            name={'name'}
                            error={nameValidationError != null}
                            helperText={nameErrorInfo}
                            defaultValue={state.initialData?.name}
                            onChange={(e) => {
                                console.log(e.target.value)
                            }}
                        />
                        <TextField
                            key={'type'}
                            label={'Typ'}
                            name={'type'}
                            error={typeValidationError != null}
                            helperText={typeErrorInfo}
                            defaultValue={state.initialData?.type}
                            onChange={(e) => {
                                console.log(e.target.value)
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