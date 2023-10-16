import {useParams} from "react-router-dom";

export default function StructureDetails() {
    const { id } = useParams();

    return (
        <p>hello from structure details with id {id}</p>
    )
}