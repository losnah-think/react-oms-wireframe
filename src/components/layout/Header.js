import React from 'react';

const Header = ({ user }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OMS</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">React OMS</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="주문, 상품, 고객 검색..."
              className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">□</span>
            </div>
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 text-sm">
            □
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 text-sm">
            □
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-xs">U</span>
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {user?.username || '관리자'}
              </div>
              <div className="text-gray-500">
                {user?.role || 'Admin'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
