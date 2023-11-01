import {ParameterInfo} from "../../../api/model/parameters";
import {HttpMethod} from "../../../api/model/steps";
import Select from "@mui/material/Select";
import {
    RandomValue,
    RequestFieldValueType,
    StepRequestDetails,
    StepRequestField,
    UpdateRequestRequest
} from "../../../api/model/request";
import MenuItem from "@mui/material/MenuItem";
import {
    Autocomplete,
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
import {endpoints} from "../../../api/endpoints/endpoints";
import React, {useEffect, useState} from "react";
import {SelectStructureModal} from "./selectStructureModal";
import {MaterialReactTable, MRT_ColumnDef} from "material-react-table";
import {Edit} from "@mui/icons-material";
import {StructureFieldType} from "../../../api/model/structureField";

export interface RequestDetailsProps {
    parameters: ParameterInfo[]
    request: StepRequestDetails | undefined,
    stepId: string | undefined,
    refreshData: () => any
}

const httpMethodStyleMap: Record<HttpMethod, string> = {
    DELETE: "danger",
    GET: "success",
    PATCH: "info",
    POST: "warning",
    PUT: "primary"
}

const requestFieldValueTypeNameMap: Record<RequestFieldValueType, string> = {
    NULL: "NULL / Brak pola",
    PARAMETER: "Parametr",
    RANDOM: "Losowy",
    STRICT: "Dokładny"
}

const fieldTypeTextMap: Record<StructureFieldType, string> = {
    STRING: 'Znakowy',
    NUMBER: 'Liczbowy',
    BOOLEAN: 'Boolowski'
}

export function RequestDetailsView(props: RequestDetailsProps) {
    const [request, setRequest] = useState<StepRequestDetails | undefined>(props.request)
    const [newEndpoint, setNewEndpoint] = useState<string>('')
    const [openSelectStructureModal, setOpenSelectStructureModal] = useState<boolean>(false)
    const [modifyRequestFieldState, setModifyRequestFieldState] = useState<ModifyRequestFieldModalState>({
        open: false,
        initialData: null,
        parameters: []
    })

    const {
        parameters,
        stepId,
        refreshData
    } = props;
    useEffect(() => {
        setRequest(props.request)
        setNewEndpoint(props.request?.endpoint ?? '')
        setModifyRequestFieldState({...modifyRequestFieldState, parameters: parameters})
    }, [props.request]);

    const updateRequest = async (requestData: UpdateRequestRequest) => {
        if (!stepId) return
        // todo pokazać błąd aktualizacji endpintu
        fetch(endpoints.requests.withStepPrefix(stepId), {
            method: 'PATCH',
            body: JSON.stringify(requestData),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            refreshData()
        })
    }

    const updateStructure = async (structureId: string | null) => {
        updateRequest(new UpdateRequestRequest(structureId, null, null))
    }

    const getFieldValue = (field: StepRequestField): string => {
        switch (field.valueType) {
            case RequestFieldValueType.NULL:
                return '-'
            case RequestFieldValueType.PARAMETER:
                return field.parameterId === null ? '-' : findParameterNameById(field.parameterId)
            case RequestFieldValueType.RANDOM:
                return field.randomValue === null ? '-' : `${field.randomValue.from} - ${field.randomValue.to}`
            case RequestFieldValueType.STRICT:
                return field.strictValue === null ? '-' : field.strictValue
        }
    }

    const findParameterNameById = (id: string): string => {
        return parameters.find(value => value.id === id)?.name ?? ''
    }

    const requestFieldColumns: MRT_ColumnDef<StepRequestField>[] = [
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
            accessorFn: (field) => requestFieldValueTypeNameMap[field.valueType],
            header: 'Typ porównania',
            enableColumnFilter: false
        },
        {
            accessorFn: getFieldValue,
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
                name={'Metoda HTTP'}
                value={request?.method ?? HttpMethod.GET}
                onChange={(e) => {
                    updateRequest(new UpdateRequestRequest(request?.structure?.id ?? null, e.target.value as HttpMethod, null))
                }}
            >
                <MenuItem value={HttpMethod.GET}>{HttpMethod.GET}</MenuItem>
                <MenuItem value={HttpMethod.POST}>{HttpMethod.POST}</MenuItem>
                <MenuItem value={HttpMethod.PUT}>{HttpMethod.PUT}</MenuItem>
                <MenuItem value={HttpMethod.PATCH}>{HttpMethod.PATCH}</MenuItem>
                <MenuItem value={HttpMethod.DELETE}>{HttpMethod.DELETE}</MenuItem>
            </Select>
            <br/>
            <TextField
                key={'endpoint'}
                label={'Endpoint'}
                name={'endpoint'}
                className={'mt-4 me-2'}
                style={{width: '50%'}}
                value={newEndpoint}
                onChange={(e) => {
                    setNewEndpoint(e.target.value)
                }}
            />
            <Button
                className={'mt-4'}
                style={{height: '55px'}}
                color={'success'}
                variant={'contained'}
                onClick={(e) => {
                    updateRequest(new UpdateRequestRequest(request?.structure?.id ?? null, null, newEndpoint))
                }}
            >
                Aktualizuj
            </Button>
            <h3 className={'mt-4'}>{request?.structure?.name ?? 'Brak struktury'}</h3>
            <Button
                className={'mb-4'}
                color={'success'}
                variant={'contained'}
                onClick={(e) => {
                    setOpenSelectStructureModal(true)
                }}
            >
                {(request?.structure && ('Zmień strukturę')) || 'Przypisz strukturę'}
            </Button>
            {request?.structure && (
                <MaterialReactTable
                    columns={requestFieldColumns}
                    data={request?.fields ?? []}
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
                    enableTopToolbar={false}
                    renderRowActions={({row }) => (
                        <Box sx={{ display: 'flex', gap: '1rem'}}>
                            <Tooltip title={"Edytuj"} arrow={true} placement={'left'}>
                                <IconButton
                                    onClick={() => setModifyRequestFieldState({
                                        ...modifyRequestFieldState,
                                        open: true,
                                        initialData: row.original
                                    })}>
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                />
            )}
            <div className={'mb-5'}/>
            <SelectStructureModal
                open={openSelectStructureModal}
                onSelect={updateStructure}
                onClose={() => setOpenSelectStructureModal(false)}
            />
            <ModifyRequestFieldModal
                parameters={parameters}
                onClose={() => setModifyRequestFieldState({...modifyRequestFieldState, open: false})}
                state={modifyRequestFieldState}
            />
        </>
    )
}

interface ModifyRequestFieldModalProps {
    onClose: () => void
    state: ModifyRequestFieldModalState
    parameters: ParameterInfo[]
}

interface ModifyRequestFieldModalState{
    open: boolean
    initialData: StepRequestField | null
    parameters: ParameterInfo[]
}

const ModifyRequestFieldModal = ({
    onClose,
    state
}: ModifyRequestFieldModalProps) => {
    const [valueType, setValueType] = useState<RequestFieldValueType>(state.initialData?.valueType ?? RequestFieldValueType.NULL)
    const [strictValue, setStrictValue] = useState<string | null>(state.initialData?.strictValue ?? null)
    const [parameterId, setParameterId] = useState<string | null>(state.initialData?.parameterId ?? null)
    const [randomValue, setRandomValue] = useState<RandomValue | null>(state.initialData?.randomValue ?? null)

    useEffect(() => {
        setValueType(state.initialData?.valueType ?? RequestFieldValueType.NULL)
        setStrictValue(state.initialData?.strictValue ?? null)
        setParameterId(state.initialData?.parameterId ?? null)
        setRandomValue(state.initialData?.randomValue ?? null)
    }, [state.initialData]);

    const handleSubmit = () => {
        // todo update field
        onClose()
    }

    const handleTypeChange = (newType: RequestFieldValueType) => {
        switch (newType) {
            case RequestFieldValueType.NULL: {
                setStrictValue(null)
                setParameterId(null)
                setRandomValue(null)
                break
            }
            case RequestFieldValueType.STRICT: {
                setParameterId(null)
                setRandomValue(null)
                break
            }
            case RequestFieldValueType.PARAMETER: {
                console.log(state.parameters)
                setStrictValue(null)
                setRandomValue(null)
                break
            }
            case RequestFieldValueType.RANDOM: {
                setStrictValue(null)
                setParameterId(null)
                if (state.initialData?.fieldType === StructureFieldType.BOOLEAN)
                    setRandomValue(null)
                break
            }
        }
        setValueType(newType)
    }

    const renderFormForStrictValue = () => {
        return (
            <TextField
                key={'strictValue'}
                label={'Dokładna wartość'}
                defaultValue={strictValue}
                onChange={(e) => {
                    setStrictValue(e.target.value)
                }}
            />
        )
    }

    const renderFormForParameterValue = () => {
        // todo fix
        return (
            <Autocomplete
                disablePortal
                renderInput={(params) => <TextField {...params} label={'Parametr'}/>}
                getOptionLabel={(option) => option.name}
                options={state.parameters}
                onChange={(e, newParameter) =>
                    console.log(newParameter === null ? 'null param id' : newParameter.id)
                }
            />
        )
    }

    const renderFormForRandomValue = () => {
        return (
            <div>
                <TextField
                    label={'Od'}
                    defaultValue={randomValue === null ? null : randomValue.from}
                    type={'number'}
                    onChange={(e) => {
                        if (randomValue === null) {
                            setRandomValue({from: e.target.value as unknown as number, to: 0})
                        } else {
                            setRandomValue({...randomValue, from: e.target.value as unknown as number})
                        }
                    }}
                />
                <TextField
                    label={'Do'}
                    type={'number'}
                    defaultValue={randomValue === null ? null : randomValue.to}
                    onChange={(e) => {
                        if (randomValue === null) {
                            setRandomValue({to: e.target.value as unknown as number, from: 0})
                        } else {
                            setRandomValue({...randomValue, to: e.target.value as unknown as number})
                        }
                    }}
                />
            </div>
        )
    }

    const renderValueForm = () => {
        switch (valueType) {
            case RequestFieldValueType.NULL: return (<></>)
            case RequestFieldValueType.STRICT: return renderFormForStrictValue()
            case RequestFieldValueType.PARAMETER: return renderFormForParameterValue()
            case RequestFieldValueType.RANDOM: return renderFormForRandomValue()
        }
    }

    return (
        <Dialog open={state.open}>
            <DialogTitle textAlign={'center'}>Aktualizacja porównania</DialogTitle>
            <DialogContent>
                <Stack
                    sx={{
                        width: '100%',
                        minWidth: { xs: '300px', sm: '360px', md: '400px'},
                        marginTop: '1rem',
                        gap: '1.5rem',
                    }}
                >
                    <TextField
                        key={'name'}
                        label={'Nazwa'}
                        name={'name'}
                        disabled={true}
                        defaultValue={state.initialData?.name}
                    />
                    <TextField
                        key={'fieldType'}
                        label={'Typ wartości'}
                        name={'fieldType'}
                        disabled={true}
                        defaultValue={fieldTypeTextMap[state.initialData?.fieldType ?? StructureFieldType.STRING]}
                    />
                    <Select
                        key={'valueType'}
                        name={'valueType'}
                        defaultValue={state.initialData?.valueType}
                        onChange={(e) => {
                            handleTypeChange(e.target.value as RequestFieldValueType)
                        }}
                    >
                        <MenuItem value={RequestFieldValueType.NULL}>{requestFieldValueTypeNameMap[RequestFieldValueType.NULL]}</MenuItem>
                        <MenuItem value={RequestFieldValueType.STRICT}>{requestFieldValueTypeNameMap[RequestFieldValueType.STRICT]}</MenuItem>
                        <MenuItem value={RequestFieldValueType.PARAMETER}>{requestFieldValueTypeNameMap[RequestFieldValueType.PARAMETER]}</MenuItem>
                        <MenuItem value={RequestFieldValueType.RANDOM}>{requestFieldValueTypeNameMap[RequestFieldValueType.RANDOM]}</MenuItem>
                    </Select>
                    {renderValueForm()}
                </Stack>
            </DialogContent>
            <DialogActions sx={{p: '1.25rem'}}>
                <Button onClick={onClose}>Anuluj</Button>
                <Button color={"success"} onClick={handleSubmit} variant={"contained"}>
                    Aktualizuj
                </Button>
            </DialogActions>
        </Dialog>
    )
}