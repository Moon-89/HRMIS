export default function Denied() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">403</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
      <p className="text-gray-500 mb-6">You don't have permission to view this page.</p>
      <a href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline">
        Back to Dashboard
      </a>
    </div>
  );
}
