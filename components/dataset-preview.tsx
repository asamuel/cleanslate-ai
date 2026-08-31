import type { CsvDataset } from '@/types/data-quality';

interface DatasetPreviewProps {
  dataset: CsvDataset;
  maxRows?: number;
}

export function DatasetPreview({ dataset, maxRows = 8 }: DatasetPreviewProps) {
  const previewRows = dataset.rows.slice(0, maxRows);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Data preview</p>
        </div>

        <p className="text-xs text-zinc-500">
          First {previewRows.length} of {dataset.rows.length} rows
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-zinc-500">
                  #
                </th>

                {dataset.columns.map((column) => (
                  <th
                    key={column}
                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-zinc-500"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {previewRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-500">{rowIndex + 1}</td>

                  {dataset.columns.map((column) => (
                    <td
                      key={column}
                      className="max-w-64 truncate whitespace-nowrap px-4 py-3"
                      title={row[column]}
                    >
                      {row[column] || <span className="italic text-zinc-400">empty</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
