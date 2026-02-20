import { Bot } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-900 font-semibold text-lg">Red Team Library</span>
        </div>

        {/* Right side - User */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            JD
          </div>
          <div className="text-sm">
            <div className="text-gray-900 font-medium">Jane Doe</div>
          </div>
        </div>
      </div>
    </header>
  );
}