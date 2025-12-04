export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-500">
          <p>
            Built with Bona Fide Intelligence | © {new Date().getFullYear()} Inspection Systems
            Direct LLC
          </p>
        </div>
      </div>
    </footer>
  );
}