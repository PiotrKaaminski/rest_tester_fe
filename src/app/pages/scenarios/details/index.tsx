import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {
    ScenarioDetails,
    ScenarioDetailsStep,
} from "../../../api/model/scenarios";
import {formatDate} from "../../../utils";
import {endpoints} from "../../../api/endpoints/endpoints";
import {
    CreateOrUpdateParameterRequest,
    ParameterInfo,
    ParameterValidationError,
    ParameterValidationErrorResponse
} from "../../../api/model/parameters";
import {MaterialReactTable, MRT_ColumnDef, MRT_Row} from "material-react-table";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    Stack, TableCellProps,
    TextField,
    Tooltip
} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";
import {CreateOrUpdateStepRequest, StepValidationError, StepValidationErrorResponse} from "../../../api/model/steps";

interface ParameterFieldModalState {
    open: boolean
    reason: 'CREATE' | 'UPDATE'
    onSubmit: ((parameterData: CreateOrUpdateParameterRequest) => Promise<ParameterValidationError | null>)
    initialData: CreateOrUpdateParameterRequest | null
}

interface StepModalState {
    open: boolean
    reason: 'CREATE' | 'UPDATE'
    onSubmit: ((scenarioData: CreateOrUpdateStepRequest) => Promise<StepValidationError | null>)
    initialData: CreateOrUpdateStepRequest | null
}

export default function ScenarioDetailsView() {
    const {id} = useParams()
    const [scenario, setScenario] = useState<ScenarioDetails>()
    const [stepModalState, setStepModalState] = useState<StepModalState>({
        open: false,
        reason: 'CREATE',
        onSubmit: async () => null,
        initialData: null
    })
    const [parameters, setParameters] = useState<ParameterInfo[]>([])
    const [parameterModalState, setParameterModalState] = useState<ParameterFieldModalState>({
        open: false,
        reason: 'CREATE',
        onSubmit: async () => null,
        initialData: null
    })
    const navigate = useNavigate()

    const fetchScenario = async () => {
        if (!id) return
        fetch(endpoints.scenarios.withId(id))
            .then(response => response.json())
            .then(scenario => setScenario(scenario))
    }

    const fetchParameters = async () => {
        if (!id) return
        fetch(endpoints.parameters.withScenarioPrefix(id))
            .then(response => response.json())
            .then(parameters => setParameters(parameters))
    }

    useEffect(() => {
        fetchScenario()
        fetchParameters()
    }, []);


    const parameterColumns: MRT_ColumnDef<ParameterInfo>[] = [
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
            accessorKey: 'initialValue',
            header: 'Początkowa wartość',
            enableColumnFilter: false
        }
    ]

    const handleCreateParameter = async (newParameter: CreateOrUpdateParameterRequest): Promise<ParameterValidationError | null> => {
        if (!id) return null;
        const response = await fetch(endpoints.parameters.withScenarioPrefix(id), {
            method: 'POST',
            body: JSON.stringify(newParameter),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (response.ok) {
            fetchParameters()
            return null;
        }
        const errorResponse = await response.json() as ParameterValidationErrorResponse
        return errorResponse.status
    }

    const handleUpdateParameter = async (updatedParameter: CreateOrUpdateParameterRequest, parameterId: string): Promise<ParameterValidationError | null> => {
        if (!id) return null;
        const response = await fetch(endpoints.parameters.withId(parameterId), {
            method: 'PATCH',
            body: JSON.stringify(updatedParameter),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (response.ok) {
            fetchParameters()
            return null;
        }
        const errorResponse = await response.json() as ParameterValidationErrorResponse
        return errorResponse.status
    }

    const handleDeleteParameter = async (row: MRT_Row<ParameterInfo>) => {
        // eslint-disable-next-line no-restricted-globals
        if (!confirm(`Jesteś pewny, że chcesz usunąć parametr ${row.original.name}?`)) {
            return;
        }
        await fetch(endpoints.parameters.withId(row.id), {
            method: 'DELETE'
        })
        fetchParameters()
    }

    const handleCreateStep = async (newStep: CreateOrUpdateStepRequest): Promise<StepValidationError | null> => {
        if (!id) return null;
        const response = await fetch(endpoints.steps.withScenarioPrefix(id), {
            method: 'POST',
            body: JSON.stringify(newStep),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (response.ok) {
            fetchScenario()
            return null;
        }
        const errorResponse = await response.json() as StepValidationErrorResponse
        return errorResponse.status
    }

    const handleUpdateStep = async (updatedStep: CreateOrUpdateStepRequest, stepId: string): Promise<StepValidationError | null> => {
        if (!id) return null;
        const response = await fetch(endpoints.steps.withId(stepId), {
            method: 'PATCH',
            body: JSON.stringify(updatedStep),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (response.ok) {
            fetchScenario()
            return null;
        }
        const errorResponse = await response.json() as StepValidationErrorResponse
        return errorResponse.status
    }

    const handleDeleteStep = async (row: MRT_Row<ScenarioDetailsStep>) => {
        // eslint-disable-next-line no-restricted-globals
        if (!confirm(`Jesteś pewny, że chcesz usunąć krok ${row.original.title}?`)) {
            return;
        }
        // delete nie zaimplementowany
        // await fetch(endpoints.steps.withId(row.id), {
        //     method: 'DELETE'
        // })
        fetchScenario()
    }

    const onClickNavigateToStepDetails = (row: MRT_Row<ScenarioDetailsStep>): TableCellProps => {
        return {
            onClick: () => {
                navigate(`/scenarios/steps/${row.id}`)
            },
            sx: {
                cursor: 'pointer'
            }
        }
    }

    const stepColumns: MRT_ColumnDef<ScenarioDetailsStep>[] = [
        {
            accessorKey: 'id',
            header: 'Id',
            enableHiding: true,
            enableColumnFilter: false
        },
        {
            accessorKey: 'sequence',
            header: 'Kolejność',
            muiTableBodyCellProps: ({ row }) => onClickNavigateToStepDetails(row),
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
            accessorKey: 'creationDate',
            accessorFn: field => formatDate(field.creationDate),
            muiTableBodyCellProps: ({ row }) => onClickNavigateToStepDetails(row),
            header: 'Data utworzenia',
            enableColumnFilter: false,
        },
        {
            accessorKey: 'updateDate',
            accessorFn: (field) => formatDate(field.updateDate),
            muiTableBodyCellProps: ({ row }) => onClickNavigateToStepDetails(row),
            header: 'Data aktualizacji',
            enableColumnFilter: false,
        }
    ]

    return (
        <>
            <div className={'container mt-5'}>
                <div className={'d-flex justify-content-center'}>
                    <h2>{scenario?.name}</h2>
                </div>
                <ul className={'mt-4'}>
                    <li className={'mb-2'}><b>Data utworzenia:</b> {formatDate(scenario?.creationDate)}</li>
                    <li><b>Data aktualizacji:</b> {formatDate(scenario?.updateDate)}</li>
                </ul>
                <h4 className={'mt-4'}>Parametry:</h4>
                <MaterialReactTable
                    columns={parameterColumns}
                    data={parameters}
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
                                    onClick={() => setParameterModalState({
                                        open: true,
                                        reason: `UPDATE`,
                                        onSubmit: (updatedParameter) => handleUpdateParameter(updatedParameter, row.id),
                                        initialData: {
                                            name: row.original.name,
                                            initialValue: row.original.initialValue
                                        }})}
                                >
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={"Usuń"} arrow={true} placement={'left'}>
                                <IconButton
                                    onClick={() => handleDeleteParameter(row)}
                                >
                                    <Delete/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    renderTopToolbarCustomActions={() => (
                        <Button
                            color={"success"}
                            onClick={() => setParameterModalState({
                                open: true,
                                reason: 'CREATE',
                                onSubmit: handleCreateParameter,
                                initialData: null
                            })}
                            variant={"contained"}>
                            Dodaj parametr
                        </Button>
                    )}
                />
                <h4 className={'mt-4'}>
                    Kroki scenariusza:
                </h4>
            </div>
            <div className={'m-5 mt-4'}>
                <MaterialReactTable
                    columns={stepColumns}
                    data={scenario?.steps ?? []}
                    enableHiding={false}
                    enableColumnActions={true}
                    enableDensityToggle={false}
                    enableFullScreenToggle={false}
                    enableGlobalFilter={false}
                    enableEditing={true}
                    enableRowOrdering={true}
                    muiTableBodyRowDragHandleProps={({ table }) => ({
                        onDragEnd: () => {
                            const { draggingRow, hoveredRow } = table.getState();
                            if (hoveredRow && draggingRow) {
                                const hovered = hoveredRow as MRT_Row<ScenarioDetailsStep>
                                handleUpdateStep(new CreateOrUpdateStepRequest(null, hovered.original.sequence), draggingRow.id)
                            }
                        },
                    })}
                    state={{
                        columnVisibility: {
                            id: false,
                            sequence: false
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
                        },
                        'mrt-row-drag': {
                            header: 'Zmień kolejność'
                        }
                    }}
                    renderRowActions={({row }) => (
                        <Box sx={{ display: 'flex', gap: '1rem'}}>
                            <Tooltip title={"Edytuj"} arrow={true} placement={'left'}>
                                <IconButton
                                    onClick={() => setStepModalState({
                                        open: true,
                                        reason: `UPDATE`,
                                        onSubmit: (updatedStep) => handleUpdateStep(updatedStep, row.id),
                                        initialData: {
                                            title: row.original.title,
                                            sequence: null
                                        }})}
                                >
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={"Usuń"} arrow={true} placement={'left'}>
                                <IconButton
                                    onClick={() => handleDeleteStep(row)}
                                >
                                    <Delete/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    renderTopToolbarCustomActions={() => (
                        <Button
                            color={"success"}
                            onClick={() => setStepModalState({
                                open: true,
                                reason: 'CREATE',
                                onSubmit: handleCreateStep,
                                initialData: null
                            })}
                            variant={"contained"}>
                            Dodaj krok
                        </Button>
                    )}
                />
            </div>
            <ParameterFieldModal
                onClose={() => setParameterModalState({...parameterModalState, open: false})}
                state={parameterModalState}
            />
            <ScenarioModal
                onClose={() => setStepModalState({...stepModalState, open: false})}
                state={stepModalState}
            />
        </>
    )
}

interface ParameterFieldModalProps {
    onClose: () => void;
    state: ParameterFieldModalState
}

export const ParameterFieldModal = ({
    onClose,
    state
}: ParameterFieldModalProps) => {
    const [name, setName] = useState<string>(state.initialData?.name ?? '')
    const [initialValue, setInitialValue] = useState<string>(state.initialData?.initialValue ?? '')
    const [nameValidationError, setNameValidationError] = useState<ParameterValidationError | null>(null)
    const [valueValidationError, setValueValidationError] = useState<ParameterValidationError | null>(null)

    useEffect(() => {
        if (!state.open) {
            setNameValidationError(null)
            setValueValidationError(null)
        }
    }, [state.open])

    useEffect(() => {
        setName(state.initialData?.name ?? '')
        setInitialValue(state.initialData?.initialValue ?? '')
    }, [state.initialData]);

    const handleSubmit = async () => {
        if (name.indexOf(' ') >= 0) {
            setNameValidationError(ParameterValidationError.NAME_CONTAINS_WHITESPACE)
            return
        }
        if (name === '') {
            setNameValidationError(ParameterValidationError.NAME_EMPTY)
            return
        }
        const error = await state.onSubmit(new CreateOrUpdateParameterRequest(name, initialValue))
        if (error == null) {
            onClose()
        }
        if (error === ParameterValidationError.VALUE_TOO_LONG) {
            setValueValidationError(error)
        } else {
            setNameValidationError(error)
        }
    }

    const nameErrorInfoMap = new Map<ParameterValidationError, string> ([
        [ParameterValidationError.NAME_EMPTY, "Nazwa jest pusta"],
        [ParameterValidationError.NAME_CONTAINS_WHITESPACE, "Nazwa zawiera biały znak"],
        [ParameterValidationError.NAME_NOT_UNIQUE, "Nazwa nie jest unikalna"],
        [ParameterValidationError.NAME_TOO_LONG, "Nazwa jest za długa"],
    ])

    const valueErrorInfoMap = new Map<ParameterValidationError, string> ([
        [ParameterValidationError.NAME_TOO_LONG, "Wartość początkowa jest za długa"],
    ])

    const nameErrorInfo: string | undefined = nameValidationError == null ? undefined : nameErrorInfoMap.get(nameValidationError)
    const valueErrorInfo: string | undefined = valueValidationError == null ? undefined : valueErrorInfoMap.get(valueValidationError)

    const title = state.reason === 'CREATE' ? 'Nowy parametr' : 'Aktualizacja parametru'
    const submitLabel = state.reason === 'CREATE' ? 'Dodaj' : 'Aktualizuj'

    return (
        <Dialog open={state.open}>
            <DialogTitle textAlign={'center'}>{title}</DialogTitle>
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
                            disabled={state.reason === 'UPDATE'}
                            error={nameValidationError != null}
                            helperText={nameErrorInfo}
                            defaultValue={state.initialData?.name}
                            onChange={(e) => {
                                if (e.target.value.indexOf(' ') >= 0) {
                                    setNameValidationError(ParameterValidationError.NAME_CONTAINS_WHITESPACE)
                                } else if (e.target.value === '') {
                                    setNameValidationError(ParameterValidationError.NAME_EMPTY)
                                } else {
                                    setNameValidationError(null);
                                }
                                setName(e.target.value)
                            }}
                        />
                        <TextField
                            key={'initialValue'}
                            label={'Wartość początkowa'}
                            name={'initialValue'}
                            error={valueValidationError != null}
                            helperText={valueErrorInfo}
                            defaultValue={state.initialData?.initialValue}
                            onChange={(e) => {
                                setInitialValue(e.target.value)
                            }}
                        />
                    </Stack>
                </FormControl>
            </DialogContent>
            <DialogActions sx={{p: '1.25rem'}}>
                <Button onClick={onClose}>Anuluj</Button>
                <Button color={'success'} onClick={handleSubmit} variant={'contained'}>
                    {submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

interface ScenarioModalProps {
    onClose: () => void;
    state: StepModalState
}

export const ScenarioModal = ({
    onClose,
    state
}: ScenarioModalProps) => {
    const [title, setTitle] = useState<string>(state.initialData?.title ?? '')
    const [titleValidationError, setTitleValidationError] = useState<StepValidationError | null>(null)

    useEffect(() => {
        if (!state.open) {
            setTitleValidationError(null)
        }
    }, [state.open])

    useEffect(() => {
        setTitle(state.initialData?.title ?? '')
    }, [state.initialData]);

    const handleSubmit = async () => {
        if (title === '') {
            setTitleValidationError(StepValidationError.TITLE_EMPTY)
            return
        }
        const error = await state.onSubmit(new CreateOrUpdateStepRequest(title, null))
        if (error == null) {
            onClose()
        }
        setTitleValidationError(error)
    }

    const nameErrorInfoMap = new Map<StepValidationError, string> ([
        [StepValidationError.TITLE_EMPTY, "Tytuł jest pusty"],
        [StepValidationError.TITLE_NOT_UNIQUE, "Tytuł nie jest unikalny"],
        [StepValidationError.TITLE_TOO_LONG, "Tytuł jest za długi"],
    ])

    const titleErrorInfo: string | undefined = titleValidationError == null ? undefined : nameErrorInfoMap.get(titleValidationError)

    const modalTitle = state.reason === 'CREATE' ? 'Nowy krok' : 'Aktualizacja kroku'
    const submitLabel = state.reason === 'CREATE' ? 'Dodaj' : 'Aktualizuj'

    return (
        <Dialog open={state.open}>
            <DialogTitle textAlign={'center'}>{modalTitle}</DialogTitle>
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
                            key={'title'}
                            label={'Tytuł'}
                            name={'title'}
                            error={titleValidationError != null}
                            helperText={titleErrorInfo}
                            defaultValue={state.initialData?.title}
                            onChange={(e) => {
                                if (e.target.value === '') {
                                    setTitleValidationError(StepValidationError.TITLE_EMPTY)
                                } else {
                                    setTitleValidationError(null);
                                }
                                setTitle(e.target.value)
                            }}
                        />
                    </Stack>
                </FormControl>
            </DialogContent>
            <DialogActions sx={{p: '1.25rem'}}>
                <Button onClick={onClose}>Anuluj</Button>
                <Button color={'success'} onClick={handleSubmit} variant={'contained'}>
                    {submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    )
}