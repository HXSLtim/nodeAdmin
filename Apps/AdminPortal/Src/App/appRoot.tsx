import { MessagePanel } from '@/Components/Business/messagePanel';

export function AppRoot(): JSX.Element {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold">Node 中台 IM MVP</h1>
        <p className="text-sm text-muted-foreground">AdminPortal · Tailwind + shadcn/ui 基线</p>
      </div>
      <MessagePanel />
    </main>
  );
}
