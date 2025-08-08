interface PageWrapperProps {
  children: React.ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-8">
        {children}
      </div>
    </main>
  );
}