import {ParameterInfo} from "../../../api/model/parameters";
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle, FormControlLabel,
    IconButton,
    Stack,
    TextField,
    Tooltip
} from "@mui/material";
import {
    ResponseFieldValueType,
    StepResponseDetails,
    StepResponseField, UpdateResponseFieldRequest,
    UpdateResponseRequest
} from "../../../api/model/response";
import React, {useEffect, useState} from "react";
import {endpoints} from "../../../api/endpoints/endpoints";
import {SelectStructureModal} from "./selectStructureModal";
import {MaterialReactTable, MRT_ColumnDef} from "material-react-table";
import {Edit} from "@mui/icons-material";
import {StructureFieldType} from "../../../api/model/structureField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {
    AutocompleteChangeDetails,
    AutocompleteChangeReason,
    AutocompleteValue
} from "@mui/base/useAutocomplete/useAutocomplete";

export interface ResponseDetailsProps {
    getParameters: () => ParameterInfo[]
    response: StepResponseDetails | undefined
    stepId: string | undefined
    refreshData: () => any
}

const responseFieldValueTypeNameMap: Record<ResponseFieldValueType, string> = {
    ANY: "Dowolna wartość",
    NULL: "NULL / Brak pola",
    PARAMETER: "Parametr",
    STRICT: "Dokładny"
}

const fieldTypeTextMap: Record<StructureFieldType, string> = {
    STRING: 'Znakowy',
    NUMBER: 'Liczbowy',
    BOOLEAN: 'Boolowski'
}

export function ResponseDetailsView(props: ResponseDetailsProps) {
    const [newHttpStatus, setNewHttpStatus] = useState<number>(200)
    const [openSelectStructureModal, setOpenSelectStructureModal] = useState<boolean>(false)
    const [modifyResponseFieldState, setModifyResponseFieldState] = useState<ModifyResponseFieldModalState>({
        open: false,
        initialData: null,
        parameters: []
    })

    const {
        getParameters,
        response,
        stepId,
        refreshData
    } = props;

    useEffect(() => {
        setNewHttpStatus(response?.httpStatus ?? 200)
    }, []);

    const updateResponse = async (responseData: UpdateResponseRequest) => {
        if (!stepId) return
        fetch(endpoints.responses.withStepPrefix(stepId), {
            method: 'PATCH',
            body: JSON.stringify(responseData),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => {
            refreshData()
        })
    }

    const updateStructure = async (structureId: string | null) => {
        updateResponse(new UpdateResponseRequest(null, structureId))
    }

    const findParameterNameById = (id: string): string => {
        return getParameters().find(value => value.id === id)?.name ?? ''
    }

    const getFieldValue = (field: StepResponseField): string => {
        switch (field.valueType) {
            case ResponseFieldValueType.ANY:
            case ResponseFieldValueType.NULL:
                return '-'
            case ResponseFieldValueType.STRICT:
                return field.strictValue === null ? '-' : field.strictValue
            case ResponseFieldValueType.PARAMETER:
                return field.parameterToReadId === null ? '-' : findParameterNameById(field.parameterToReadId)
        }
    }

    const responseFieldColumns: MRT_ColumnDef<StepResponseField>[] = [
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
            accessorFn: (field) => responseFieldValueTypeNameMap[field.valueType],
            header: 'Typ wartości',
            enableColumnFilter: false
        },
        {
            accessorFn: getFieldValue,
            header: 'Wartość',
            enableColumnFilter: false
        },
        {
            accessorFn: (originalRow => originalRow.saveToParameter && originalRow.parameterToSaveId != null ? findParameterNameById(originalRow.parameterToSaveId) : '-'),
            header: 'Zapis do parametru',
            enableColumnFilter: false
        }
    ]

    const closeUpdateFieldModal = () => {
        setModifyResponseFieldState({...modifyResponseFieldState, open: false})
        refreshData()
    }

    return (
        <>
            <TextField
                key={'httpStatus'}
                label={'Status HTTP'}
                type={'number'}
                className={'me-2'}
                InputProps={{
                    inputProps: {
                        min: 100, max: 599
                    }
                }}
                value={newHttpStatus}
                onChange={e => {
                    setNewHttpStatus(e.target.value as unknown as number)
                }}
            />
            <Button
                style={{height: '55px'}}
                color={'success'}
                variant={'contained'}
                onClick={(e) => {
                    updateResponse(new UpdateResponseRequest(newHttpStatus, response?.structure?.id ?? null))
                }}
            >
                Aktualizuj
            </Button>
            <h3 className={'mt-4'}>{response?.structure?.name ?? 'Brak struktury'}</h3>
            <Button
                className={'mb-4'}
                color={'success'}
                variant={'contained'}
                onClick={(e) => {
                    setOpenSelectStructureModal(true)
                }}
            >
                {(response?.structure && ('Zmień strukturę')) || 'Przypisz strukturę'}
            </Button>
            {response?.structure && (
                <MaterialReactTable
                    columns={responseFieldColumns}
                    data={response?.fields ?? []}
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
                                    onClick={() => setModifyResponseFieldState({
                                        ...modifyResponseFieldState,
                                        parameters: getParameters(),
                                        open: true,
                                        initialData: row.original
                                    })}
                                >
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
            <ModifyResponseFieldModal
                onClose={closeUpdateFieldModal}
                state={modifyResponseFieldState}
            />
        </>
    )
}

interface ModifyResponseFieldModalProps {
    onClose: () => void
    state: ModifyResponseFieldModalState
}

interface ModifyResponseFieldModalState {
    open: boolean
    initialData: StepResponseField | null
    parameters: ParameterInfo[]
}

const ModifyResponseFieldModal = ({
    onClose,
    state
}: ModifyResponseFieldModalProps) => {
    const [valueType, setValueType] = useState<ResponseFieldValueType>(state.initialData?.valueType ?? ResponseFieldValueType.ANY)
    const [strictValue, setStrictValue] = useState<string | null>(state.initialData?.strictValue ?? null)
    const [parameterToReadId, setParameterToReadId] = useState<string | null>(state.initialData?.parameterToReadId ?? null)
    const [saveToParameter, setSaveToParameter] = useState<boolean>(state.initialData?.saveToParameter ?? false)
    const [parameterToSaveId, setParameterToSaveId] = useState<string | null>(state.initialData?.parameterToSaveId ?? null)

    useEffect(() => {
        setValueType(state.initialData?.valueType ?? ResponseFieldValueType.ANY)
        setStrictValue(state.initialData?.strictValue ?? null)
        setParameterToReadId(state.initialData?.parameterToReadId ?? null)
        setSaveToParameter(state.initialData?.saveToParameter ?? false)
        setParameterToSaveId(state.initialData?.parameterToSaveId ?? null)
    }, []);

    const handleSubmit = () => {
        if (state.initialData === null) return
        const request = new UpdateResponseFieldRequest(valueType, strictValue, parameterToReadId, saveToParameter, parameterToSaveId)
        fetch(endpoints.responseFields.withId(state.initialData.id), {
            method: 'PATCH',
            body: JSON.stringify(request),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => onClose())
    }

    const handleTypeChange = (newType: ResponseFieldValueType) => {
        switch (newType) {
            case ResponseFieldValueType.NULL:
            case ResponseFieldValueType.ANY: {
                setStrictValue(null)
                setParameterToReadId(null)
                break
            }
            case ResponseFieldValueType.PARAMETER: {
                setStrictValue(null)
                break
            }
            case ResponseFieldValueType.STRICT: {
                setParameterToReadId(null)
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

    const renderFormForParameterValue = (onChange: (event: React.SyntheticEvent, newParameter: ParameterInfo | null) => void) => {
        return (
            <Autocomplete
                disablePortal
                renderInput={(params) => <TextField {...params} label={'Parametr'}/>}
                getOptionLabel={(option) => option.name}
                options={state.parameters}
                onChange={onChange}
            />
        )
    }

    const renderValueForm = () => {
        switch (valueType) {
            case ResponseFieldValueType.ANY:
            case ResponseFieldValueType.NULL:
                return (<></>)
            case ResponseFieldValueType.STRICT: return renderFormForStrictValue()
            case ResponseFieldValueType.PARAMETER:
                return renderFormForParameterValue((e, newParameter) =>
                    setParameterToReadId(newParameter === null ? null : newParameter.id))
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
                        onChange={e => {
                            handleTypeChange(e.target.value as ResponseFieldValueType)
                        }}
                    >
                        <MenuItem value={ResponseFieldValueType.NULL}>{responseFieldValueTypeNameMap[ResponseFieldValueType.NULL]}</MenuItem>
                        <MenuItem value={ResponseFieldValueType.ANY}>{responseFieldValueTypeNameMap[ResponseFieldValueType.ANY]}</MenuItem>
                        <MenuItem value={ResponseFieldValueType.STRICT}>{responseFieldValueTypeNameMap[ResponseFieldValueType.STRICT]}</MenuItem>
                        <MenuItem value={ResponseFieldValueType.PARAMETER}>{responseFieldValueTypeNameMap[ResponseFieldValueType.PARAMETER]}</MenuItem>
                    </Select>
                    {renderValueForm()}
                    <FormControlLabel control={<Checkbox onChange={e => setSaveToParameter(e.target.checked)}/>} label={'Zapis do parametru'}/>
                    {saveToParameter &&
                        renderFormForParameterValue(
                            (e, newParameter) =>
                                setParameterToSaveId(newParameter === null ? null : newParameter.id)
                        )
                    }
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