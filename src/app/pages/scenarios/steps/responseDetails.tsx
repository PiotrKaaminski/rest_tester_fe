import {ParameterInfo} from "../../../api/model/parameters";
import {Button, TextField} from "@mui/material";
import {StepResponseDetails, UpdateResponseRequest} from "../../../api/model/response";
import React, {useEffect, useState} from "react";
import {endpoints} from "../../../api/endpoints/endpoints";
import {SelectStructureModal} from "./selectStructureModal";

export interface ResponseDetailsProps {
    getParameters: () => ParameterInfo[]
    response: StepResponseDetails | undefined
    stepId: string | undefined
    refreshData: () => any
}

export function ResponseDetailsView(props: ResponseDetailsProps) {
    const [newHttpStatus, setNewHttpStatus] = useState<number>(200)
    const [openSelectStructureModal, setOpenSelectStructureModal] = useState<boolean>(false)

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
            <SelectStructureModal
                open={openSelectStructureModal}
                onSelect={updateStructure}
                onClose={() => setOpenSelectStructureModal(false)}
            />
        </>
    )
}