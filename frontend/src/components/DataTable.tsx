"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

type Column<T> = {
    header: string
    accessor: keyof T
    cell?: (value: any, row: T) => React.ReactNode
}

type DataTableProps<T> = {
    columns: Column<T>[]
    data: T[]
    loading?: boolean
    pageSize?: number
}

export function DataTable<T>({
    columns,
    data,
    loading = false,
    pageSize = 10,
}: DataTableProps<T>) {
    const [page, setPage] = useState(0)
    const totalPages = Math.ceil(data.length / pageSize)
    const paginatedData = data.slice(page * pageSize, (page + 1) * pageSize)

    return (
        <div className="w-full overflow-x-auto rounded-md border border-border bg-background space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead key={String(col.accessor)}>{col.header}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {loading ? (
                        Array.from({ length: pageSize }).map((_, i) => (
                            <TableRow key={i}>
                                {columns.map((_, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className="h-4 w-full" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : paginatedData.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="text-center text-muted-foreground py-6"
                            >
                                Aucune donnée disponible
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedData.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {columns.map((col) => {
                                    const value = row[col.accessor]
                                    return (
                                        <TableCell key={String(col.accessor)}>
                                            {col.cell ? col.cell(value, row) : String(value ?? "")}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center px-4 pb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(p - 1, 0))}
                        disabled={page === 0}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Précédent
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page + 1} / {totalPages}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                        disabled={page >= totalPages - 1}
                    >
                        Suivant
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    )
}
