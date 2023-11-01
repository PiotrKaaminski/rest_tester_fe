import {ParameterInfo} from "../../../api/model/parameters";
import {HttpMethod, StepRequestDetails} from "../../../api/model/steps";
import Select from "@mui/material/Select";
import {UpdateRequestRequest} from "../../../api/model/request";
import MenuItem from "@mui/material/MenuItem";
import {Button, TextField} from "@mui/material";
import {endpoints} from "../../../api/endpoints/endpoints";
import {useEffect, useState} from "react";
import {SelectStructureModal} from "./selectStructureModal";

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

export function RequestDetailsView(props: RequestDetailsProps) {
    const [request, setRequest] = useState<StepRequestDetails | undefined>(props.request)
    const [newEndpoint, setNewEndpoint] = useState<string>('')
    const [openSelectStructureModal, setOpenSelectStructureModal] = useState<boolean>(false)

    const {
        parameters,
        stepId,
        refreshData
    } = props;
    useEffect(() => {
        setRequest(props.request)
        setNewEndpoint(props.request?.endpoint ?? '')
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
                color={'success'}
                variant={'contained'}
                onClick={(e) => {
                    setOpenSelectStructureModal(true)
                }}
            >
                {(request?.structure && ('Zmień strukturę')) || 'Przypisz strukturę'}
            </Button>
            <SelectStructureModal
                open={openSelectStructureModal}
                onSelect={updateStructure}
                onClose={() => setOpenSelectStructureModal(false)}/>
        </>
    )
}