import {useNavigate, useParams} from "react-router-dom";
import {ExecutionStep, ExecutionStepStatus} from "../../../api/model/executionStep";
import React, {useEffect, useState} from "react";
import {endpoints} from "../../../api/endpoints/endpoints";
import {Box, Tab, Tabs, Typography} from "@mui/material";
import {ExecutionStatus} from "../../../api/model/executions";
import {ExecutionRequestDetailsView} from "../details/requestDetails";
import {ExecutionResponseDetailsView} from "../details/responseDetails";

type TabIndex = 'REQUEST' | 'RESPONSE'

const executionStepStatusNameMap: Record<ExecutionStepStatus, string> = {
    FAILED: "Błąd",
    SKIPPED: "Pominięty",
    SUCCESS: "Sukces",
    WAITING: "Oczekuje"
}

const executionStepStatusColorMap: Record<ExecutionStepStatus, string> = {
    FAILED: "red",
    SKIPPED: "grey",
    SUCCESS: "green",
    WAITING: "blue"
}

export default function ExecutionStepView() {
    const {id}= useParams()
    const [step, setStep] = useState<ExecutionStep>()
    const navigate = useNavigate()
    const [tab, setTab] = useState<TabIndex>('REQUEST')

    const fetchStep = async () => {
        if (!id) return
        const response = await fetch(endpoints.executionSteps.withId(id))
        const step = await response.json()
        setStep(step)
    }

    useEffect(() => {
        fetchStep()
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: TabIndex) => {
        setTab(newValue)
    }

    return (
        <>
            <div className={'container mt-2'}>
                <h3 style={{color: 'grey', cursor: 'pointer'}} onClick={() => navigate(`/executions/${step?.execution.id}`)}>{step?.execution.name}</h3>
                <div
                    className={'mt-4'}
                    style={{
                        width: '100%',
                        height: '50px',
                        backgroundColor: executionStepStatusColorMap[step?.status ?? ExecutionStepStatus.WAITING],
                        borderRadius: '10px'
                    }}
                />
                <div className={'mt-5 d-flex justify-content-center'}>
                    <h2>{step?.title}</h2>
                </div>
                <Box sx={{width: '100%'}}>
                    <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                        <Tabs value={tab} onChange={handleTabChange} aria-label={'basic tabs example'}>
                            <Tab label={"Zapytanie"} value={'REQUEST'} {...allyProps('REQUEST')}/>
                            <Tab label={"Odpowiedź"} value={'RESPONSE'} {...allyProps('RESPONSE')}/>
                        </Tabs>
                    </Box>
                    <CustomTabPanel index={'REQUEST'} selectedTab={tab}>
                        <ExecutionRequestDetailsView request={step?.request}/>
                    </CustomTabPanel>
                    <CustomTabPanel index={'RESPONSE'} selectedTab={tab}>
                        <ExecutionResponseDetailsView response={step?.response}/>
                    </CustomTabPanel>
                </Box>
            </div>
        </>
    )
}

function allyProps(index: TabIndex) {
    return {
        id: `${index}`,
        'aria-controls': `${index}`,
    };
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: TabIndex;
    selectedTab: TabIndex;
}

function CustomTabPanel(props: TabPanelProps) {
    const {children, selectedTab, index} = props;
    return (
        <div
            role={'tabpanel'}
            hidden={selectedTab !== index}
            id={index}
            aria-labelledby={index}
        >
            {selectedTab === index && (
                <Typography className={'mt-4'}>
                    {children}
                </Typography>
            )}
        </div>
    )
}