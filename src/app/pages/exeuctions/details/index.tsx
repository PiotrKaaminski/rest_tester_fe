import {useParams} from "react-router-dom";

export default function ExecutionDetailsView() {
    const {id} = useParams()

    return (
        <p>execution details for id {id}</p>
    )
}