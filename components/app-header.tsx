import { FileCheck2 } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileCheck2 aria-hidden="true" className="size-5" />
          </div>

          <div>
            <p className="font-semibold tracking-tight">CleanSlate AI</p>

            <p className="text-xs text-muted-foreground">Data quality, clarified.</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <span className="size-2 rounded-full bg-success" />

          <span>Human-reviewed cleanup</span>
        </div>
      </div>
    </header>
  );
}
