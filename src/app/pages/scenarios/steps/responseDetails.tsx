import {ParameterInfo} from "../../../api/model/parameters";
import {StepRequestDetails, StepResponseDetails} from "../../../api/model/steps";

export interface ResponseDetailsProps {
    parameters: ParameterInfo[]
    response: StepResponseDetails | undefined
    stepId: string | undefined
    refreshData: () => any
}

export function ResponseDetailsView(props: ResponseDetailsProps) {
    const {
        parameters,
        response,
        stepId,
        refreshData
    } = props;

    return (
        <p>hello from response</p>
    )
}