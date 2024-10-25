import {useNavigate, useParams} from "react-router-dom";
import {StepDetails} from "../../../api/model/steps";
import React, {useEffect, useState} from "react";
import {ParameterInfo} from "../../../api/model/parameters";
import {endpoints} from "../../../api/endpoints/endpoints";
import {Box, Tab, Tabs, Typography} from "@mui/material";
import {RequestDetailsView} from "./requestDetails";
import {ResponseDetailsView} from "./responseDetails";

type TabIndex= 'REQUEST' | 'RESPONSE'

export default function ScenarioStepView() {
    const { id} = useParams()
    const [step, setStep] = useState<StepDetails>()
    const [parameters, setParameters] = useState<ParameterInfo[]>([])
    const navigate = useNavigate();
    const [tab, setTab] = useState<TabIndex>('REQUEST')

    const fetchStep = async () => {
        if (!id) return
        const response = await fetch(endpoints.steps.withId(id))
        const step = await response.json()
        const parametersResponse = await fetch(endpoints.parameters.withScenarioPrefix(step.scenario.id))
        const parameters = await parametersResponse.json()
        setParameters(parameters)
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
                <h3 style={{color: 'grey', cursor: 'pointer'}} onClick={() => navigate(`/scenarios/${step?.scenario.id}`)}>{step?.scenario.name}</h3>
                <div className={'d-flex justify-content-center'}>
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
                        <RequestDetailsView getParameters={() => parameters} request={step?.request} stepId={id} refreshData={fetchStep}/>
                    </CustomTabPanel>
                    <CustomTabPanel index={'RESPONSE'} selectedTab={tab}>
                        <ResponseDetailsView getParameters={() => parameters} response={step?.response} stepId={id} refreshData={fetchStep}/>
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