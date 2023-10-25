import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {CreateOrUpdateStructureRequest, StructureDetails, StructureDetailsField} from "../../../api/model/structures";
import {endpoints} from "../../../api/endpoints/endpoints";
import {formatDate} from "../../../utils";
import {MaterialReactTable, MRT_ColumnDef, MRT_Row} from "material-react-table";
import {
    CreateOrUpdateStructureFieldRequest,
    StructureFieldType,
    StructureFieldValidationError, StructureFieldValidationErrorResponse
} from "../../../api/model/structureField";
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, FormControl,
    IconButton,
    Stack,
    TextField,
    Tooltip
} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";

const fieldTypeTextMap: Record<StructureFieldType, string> = {
    STRING: 'Znakowy',
    NUMBER: 'Liczbowy',
    BOOLEAN: 'Boolowski'
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
    const [descriptionState, setDescriptionState] = useState<'VIEW' | 'MODIFY'>('VIEW')
    const [newDescriptionValue, setNewDescriptionValue] = useState<string>('')
    const { id } = useParams();

    const fetchData = async () => {
        if (!id) return
        fetch(endpoints.structures.withId(id))
            .then(response => response.json())
            .then(structure => {
                setStructure(structure)
            })
    }

    useEffect( () => {
        fetchData()
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

    const handleCreateField = async (newField: CreateOrUpdateStructureFieldRequest): Promise<StructureFieldValidationError | null> => {
        if (!id) return null;
        const response = await fetch(endpoints.structureFields.withStructurePrefix(id), {
            method: 'POST',
            body: JSON.stringify(newField),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (response.ok) {
            fetchData();
            return null;
        }
        const errorResponse = await response.json() as StructureFieldValidationErrorResponse
        return errorResponse.status
    }

    const handleUpdateField = async (newField: CreateOrUpdateStructureFieldRequest, fieldId: string): Promise<StructureFieldValidationError | null> => {
        if (!id) return null;
        const response = await fetch(endpoints.structureFields.withId(fieldId), {
            method: 'PATCH',
            body: JSON.stringify(newField),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (response.ok) {
            fetchData();
            return null;
        }
        const errorResponse = await response.json() as StructureFieldValidationErrorResponse
        return errorResponse.status
    }

    const handleDeleteField = async (row: MRT_Row<StructureDetailsField>)=> {
        // eslint-disable-next-line no-restricted-globals
        if (!confirm(`Jesteś pewny, że chcesz usunąć polke ${row.original.name}?`)) {
            return;
        }
        await fetch(endpoints.structureFields.withId(row.id), {
            method: 'DELETE'
        })
        fetchData()
    }

    const initiateDescriptionUpdate = () => {
        setNewDescriptionValue(structure?.description ?? '')
        setDescriptionState('MODIFY')
    }

    const handleDescriptionUpdate = async () => {
        if (!id) return null;
        const body = new CreateOrUpdateStructureRequest(null, newDescriptionValue)
        await fetch(endpoints.structures.withId(id), {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        setDescriptionState('VIEW')
        fetchData()
    }

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
                {descriptionState === 'VIEW' && (
                    <>
                        <p style={{whiteSpace: 'pre-wrap'}}>{structure?.description}</p>
                        <button className={'btn btn-primary mt-3'} onClick={() => initiateDescriptionUpdate()}>Edycja opisu</button>
                    </>
                )}
                {descriptionState === 'MODIFY' && (
                    <>
                        <textarea style={{width: '100%', height: '200px'}} defaultValue={structure?.description} onChange={(e) => {setNewDescriptionValue(e.target.value)}}/>
                        <button className={'btn btn-warning mt-3'} onClick={() => setDescriptionState('VIEW')}>Anuluj</button>
                        <button className={'btn btn-success mt-3 ms-3'} onClick={() => handleDescriptionUpdate()}>Zapisz</button>
                    </>
                )}
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
                                    onClick={() => setStructureFieldModalState({
                                        open: true,
                                        reason: `UPDATE`,
                                        onSubmit: (updatedStructure) => handleUpdateField(updatedStructure, row.id),
                                        initialData: {
                                            name: row.original.name,
                                            type: row.original.type
                                        }
                                    })}>
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={"Usuń"} arrow={true} placement={'left'}>
                                <IconButton
                                    // todo prawdopodobnie zamienić na modal zamiast confirm
                                    onClick={() => handleDeleteField(row)}>
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
                                onSubmit: handleCreateField,
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

    useEffect(() => {
        if (!state.open) {
            setNameValidationError(null)
        }
    }, [state.open])

    useEffect(() => {
        setName(state.initialData?.name ?? '')
        setType(state.initialData?.type ?? StructureFieldType.STRING)
    }, [state.initialData])
    const nameErrorInfoMap = new Map<StructureFieldValidationError, string> ([
        [StructureFieldValidationError.NAME_CONTAINS_WHITESPACE, "Nazwa zawiera biały znak"],
        [StructureFieldValidationError.NAME_EMPTY, "Nazwa jest pusta"],
        [StructureFieldValidationError.NAME_NOT_UNIQUE, "Nazwa nie jest unikalna"],
        [StructureFieldValidationError.NAME_TOO_LONG, "Nazwa jest za długa"]
    ])

    const handleSubmit = async () => {
        if (name.indexOf(' ') >= 0) {
            setNameValidationError(StructureFieldValidationError.NAME_CONTAINS_WHITESPACE)
            return
        }
        if (name === '') {
            setNameValidationError(StructureFieldValidationError.NAME_EMPTY)
            return
        }
        const error = await state.onSubmit(new CreateOrUpdateStructureFieldRequest(name, type));
        if (error == null) {
            onClose()
        }
        setNameValidationError(error)
    }

    const nameErrorInfo: string | undefined = nameValidationError == null ? undefined : nameErrorInfoMap.get(nameValidationError)

    const title = state.reason === 'CREATE' ? 'Nowe pole' : 'Aktualizacja pola'
    const submitLabel = state.reason === 'CREATE' ? 'Dodaj' : 'Aktualizuj'

    return (
        <Dialog open={state.open}>
            <DialogTitle textAlign={"center"}>{title}</DialogTitle>
            <DialogContent>
                <FormControl>
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
                                if (e.target.value.indexOf(' ') >= 0) {
                                    setNameValidationError(StructureFieldValidationError.NAME_CONTAINS_WHITESPACE)
                                } else if (e.target.value === '') {
                                    setNameValidationError(StructureFieldValidationError.NAME_EMPTY)
                                } else {
                                    setNameValidationError(null);
                                }
                                setName(e.target.value)
                            }}
                        />
                        <Select
                            key={'type'}
                            name={'type'}
                            defaultValue={state.initialData?.type ?? StructureFieldType.STRING}
                            onChange={(event) => {
                                setType(event.target.value as StructureFieldType)
                            }}
                        >
                            <MenuItem value={StructureFieldType.STRING}>{fieldTypeTextMap[StructureFieldType.STRING]}</MenuItem>
                            <MenuItem value={StructureFieldType.NUMBER}>{fieldTypeTextMap[StructureFieldType.NUMBER]}</MenuItem>
                            <MenuItem value={StructureFieldType.BOOLEAN}>{fieldTypeTextMap[StructureFieldType.BOOLEAN]}</MenuItem>
                        </Select>
                    </Stack>
                </FormControl>
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