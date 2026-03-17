export default function Denied() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center transition-colors duration-300">
      <h1 className="text-4xl font-black text-gray-800 dark:text-gray-200 mb-4 transition-colors">403</h1>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 transition-colors">Access Denied</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6 transition-colors">You don't have permission to view this page.</p>
      <a href="/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold hover:underline transition-colors uppercase tracking-widest text-sm">
        Back to Dashboard
      </a>
    </div>
  );
}
