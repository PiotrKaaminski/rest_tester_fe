import {useParams} from "react-router-dom";

export default function ExecutionStepView() {
    const {id}= useParams()

    return (
        <>
            <p>step id: {id}</p>
        </>
    )
}