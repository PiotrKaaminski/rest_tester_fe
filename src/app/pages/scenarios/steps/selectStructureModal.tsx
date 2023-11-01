import {StructureInfo} from "../../../api/model/structures";
import {useEffect, useState} from "react";
import {endpoints} from "../../../api/endpoints/endpoints";
import {MaterialReactTable, MRT_ColumnDef, MRT_Row} from "material-react-table";
import {formatDate} from "../../../utils";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TableCellProps} from "@mui/material";

export interface SelectStructureModalProps {
    open: boolean
    onSelect: (structureId: string | null) => any
    onClose: () => void
}

export const SelectStructureModal = ({
    open,
    onSelect,
    onClose
}: SelectStructureModalProps) => {
    const [structures, setStructures] = useState<StructureInfo[]>([])

    const fetchStructures = async () => {
        fetch(endpoints.structures.base)
            .then(response => response.json())
            .then(paginatedResponse => setStructures(paginatedResponse.rows))
    }

    useEffect(() => {
        fetchStructures()
    }, []);

    const respondWithId = (structureId: string | null) => {
        onSelect(structureId)
        onClose()
    }

    const onClickNavigateToDetails = (row: MRT_Row<StructureInfo>): TableCellProps => {
        return {
            onClick: () => {
                respondWithId(row.id)
            },
            sx: {
                cursor: 'pointer'
            }
        }
    }

    const columns: MRT_ColumnDef<StructureInfo>[] = [
        {
            accessorKey: 'id',
            header: 'Id',
            enableHiding: true
        },
        {
            accessorKey: 'name',
            header: 'Nazwa',
            enableColumnFilter: true,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToDetails(row),
            muiTableHeadCellFilterTextFieldProps: {
                placeholder: ''
            }
        },
        {
            accessorKey: 'fieldsAmount',
            header: 'Ilość pól',
            enableColumnFilter: false,
            enableEditing: false,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToDetails(row)
        },
        {
            accessorKey: 'creationDate',
            accessorFn: (structureInfo) => formatDate(structureInfo.creationDate),
            header: 'Data utworzenia',
            enableColumnFilter: false,
            enableEditing: false,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToDetails(row)
        },
        {
            accessorKey: 'updateDate',
            accessorFn: (structureInfo) => formatDate(structureInfo.updateDate),
            header: 'Data aktualizacji',
            enableColumnFilter: false,
            enableEditing: false,
            muiTableBodyCellProps: ({ row }) => onClickNavigateToDetails(row)
        }
    ]

    return (
        <Dialog open={open} fullWidth={true} maxWidth={'xl'}>
            <DialogTitle textAlign={'center'}>Wybierz strukturę</DialogTitle>
            <DialogContent>
                <MaterialReactTable
                    columns={columns}
                    data={structures}
                    enableHiding={false}
                    enableColumnActions={true}
                    enableDensityToggle={false}
                    enableFullScreenToggle={false}
                    enableGlobalFilter={false}
                    enableTopToolbar={false}
                    state={{
                        columnVisibility: {
                            id: false
                        }
                    }}
                    initialState={{
                        showColumnFilters: true
                    }}
                    getRowId={(originalRow): string => {
                        return originalRow.id
                    }}
                />
            </DialogContent>
            <DialogActions sx={{p: '1.25rem'}}>
                <Button variant={'contained'} onClick={onClose} color={'error'}>Anuluj</Button>
                <Button variant={'contained'} onClick={() => respondWithId(null)} color={'warning'}>Usuń strukturę</Button>
            </DialogActions>
        </Dialog>
    )
}

