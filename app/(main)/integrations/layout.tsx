export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No authentication required for local testing
  
  return (
    <div className="relative flex min-h-screen">
      <main className="flex-grow">{children}</main>
    </div>
  );
}