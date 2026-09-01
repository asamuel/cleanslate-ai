import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { CsvDataset } from '@/types/data-quality';

interface DatasetPreviewProps {
  dataset: CsvDataset;
  maxRows?: number;
}

export function DatasetPreview({ dataset, maxRows = 8 }: DatasetPreviewProps) {
  const previewRows = dataset.rows.slice(0, maxRows);

  return (
    <Card className="rounded-xl shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base">Original preview</CardTitle>

          <p className="mt-1 text-sm text-muted-foreground">
            Showing {previewRows.length} of {dataset.rows.length.toLocaleString()} rows
          </p>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>

              {dataset.columns.map((column) => (
                <TableHead key={column} className="whitespace-nowrap">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {previewRows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {rowIndex + 1}
                </TableCell>

                {dataset.columns.map((column) => (
                  <TableCell key={column} className="max-w-56 whitespace-nowrap">
                    {row[column] ? (
                      <span title={row[column]}>{row[column]}</span>
                    ) : (
                      <span className="italic text-muted-foreground">empty</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
