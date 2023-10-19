import {Container} from "react-bootstrap";
import {useEffect, useState} from "react";
import {defaultPaginatedResponse, PaginatedResponse} from "../../../api/model";
import {endpoints} from "../../../api/endpoints";
import {MaterialReactTable, MRT_ColumnDef} from "material-react-table";

interface StructureInfo {
    id: string;
    name: string;
    fieldsAmount: number;
    creationDate: string;
    updateDate: string;
}

export default function StructureList() {
    const [data, setData] = useState<PaginatedResponse<StructureInfo>>(defaultPaginatedResponse<StructureInfo>())
    const columns: MRT_ColumnDef<StructureInfo>[] = [
        {
            accessorKey: 'id',
            header: 'Id',
            enableHiding: true,
        },
        {
            accessorKey: 'name',
            header: 'Nazwa',
            enableColumnFilter: true
        },
        {
            accessorKey: 'fieldsAmount',
            header: 'Ilość pól',
            enableColumnFilter: false
        },
        {
            accessorKey: 'creationDate',
            header: 'Data utworzenia',
            enableColumnFilter: false
        },
        {
            accessorKey: 'updateDate',
            header: 'Data aktualizacji',
            enableColumnFilter: false
        }
    ]

    const fetchData = () => {
        fetch(endpoints.structureList)
            .then(response => {
                return response.json()
            }).then(json => {
            setData(json)
        })
    }

    useEffect(() => {
        fetchData()
    }, []);

    return (
        <div className={'m-5'}>
            <MaterialReactTable
                columns={columns} data={data.rows}
                enableHiding={true} enableTopToolbar={false} enableColumnActions={true}
                    state={{
                    showColumnFilters: true,
                    columnVisibility: {
                        id: false
                    }
                }}
                muiTableBodyRowProps={({ row }) => ({
                    onClick: (event) => {
                        console.info(event, row.id);
                    },
                    sx: {
                        cursor: 'pointer',
                    },
                })}
                getRowId={(originalRow): string => {
                    return originalRow.id
                }}
            />
        </div>
    )
}