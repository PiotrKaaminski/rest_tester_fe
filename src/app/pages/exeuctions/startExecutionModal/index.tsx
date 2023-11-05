import {useState} from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField} from "@mui/material";
import {endpoints} from "../../../api/endpoints/endpoints";
import {CreateExecution, CreateExecutionResponse} from "../../../api/model/executions";
import {useNavigate} from "react-router-dom";

export interface StartExecutionModalProps {
    state: StartExecutionModalState
    onClose: () => void
}

export interface StartExecutionModalState {
    open: boolean
    scenarioId: string
}

export const StartExecutionModal = ({
    state,
    onClose,
}: StartExecutionModalProps) => {
    const [baseUrl, setBaseUrl] = useState<string>('')
    const navigate = useNavigate()

    const startExecution = () => {
        const requestData: CreateExecution = {
            baseUrl: baseUrl
        }
        fetch(endpoints.executions.withScenarioPrefix(state.scenarioId), {
            method: 'POST',
            body: JSON.stringify(requestData),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(
            response => response.json()
        ).then((response: CreateExecutionResponse) => navigate(`/executions/${response.id}`))
    }

    return (
        <Dialog open={state.open}>
            <DialogTitle textAlign={'center'}>Uruchomienie testu</DialogTitle>
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
                        key={'baseUrl'}
                        label={'Bazowy adres'}
                        name={'baseUrl'}
                        onChange={e => setBaseUrl(e.target.value)}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{p: '1.25rem'}}>
                <Button variant={'contained'} onClick={onClose} color={'error'}>Anuluj</Button>
                <Button variant={'contained'} onClick={() => startExecution()} color={'success'}>Uruchom</Button>
            </DialogActions>
        </Dialog>
    )
}