import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f5f5f0] flex">
      <Sidebar />
      {/* Main content — offset by sidebar width */}
      <main className="ml-56 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
