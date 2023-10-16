import {Container} from "react-bootstrap";
import {useState} from "react";

interface ITableRow {
    id: string;
    name: string;
    fieldsAmount: number;
    creationDate: string;
    updateDate: string;
}

export default function StructureList() {
    const [data, setData] = useState<ITableRow[]>([])

    const fetchData = async (e?: any) => {
            try {
                const response = await fetch('http://localhost:8080/structures')
                const jsonData = await response.json()
                setData(jsonData)
            } catch (error) {
                console.error(error)
        }
    }

    return (
        <Container>
            <p>hello from structure list</p>

        </Container>
    )
}