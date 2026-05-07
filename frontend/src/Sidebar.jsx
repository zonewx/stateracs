import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, Package, Users, Shield, User, Settings, Menu, ChevronLeft, Home } from 'lucide-react';

export default function Sidebar({ currentUser, onLogout }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = true; // Match your app's dark theme

  const menuItems = [
    {
      id: 'social',
      label: 'Social',
      icon: Users,
      path: '/social',
      subItems: null
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: TrendingUp,
      path: null,
      subItems: [
        { id: 'overview', label: 'Overview', path: '/portfolio' },
        { id: 'holdings', label: 'Holdings', path: '/portfolio/holdings' },
        { id: 'transactions', label: 'Transactions', path: '/portfolio/transactions' },
        { id: 'dividends', label: 'Dividends', path: '/portfolio/dividends' },
        { id: 'ownership', label: 'Ownership', path: '/portfolio/ownership' },
      ]
    },
    {
      id: 'cs-skins',
      label: 'CS Skins',
      icon: Package,
      path: '/cs-skins',
      subItems: null
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: Shield,
      path: null,
      subItems: [
        { id: 'users', label: 'Users', path: '/admin' },
        { id: 'roles', label: 'Roles', path: '/admin/roles' },
      ],
      adminOnly: true
    }
  ];

  const handleItemClick = (item) => {
    if (item.subItems) {
      // Has sub-menu, expand it
      setActiveSubMenu(item.id);
      if (!isExpanded) setIsExpanded(true); // Auto-expand when opening sub-menu
    } else {
      // Direct navigation
      navigate(item.path);
      setActiveSubMenu(null);
    }
  };

  const handleSubItemClick = (path) => {
    navigate(path);
  };

  const handleBack = () => {
    setActiveSubMenu(null);
  };

  const isActive = (path) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const sidebarWidth = isExpanded ? 'w-60' : 'w-16';
  const bg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const hoverBg = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100';
  const activeBg = isDark ? 'bg-gray-800' : 'bg-gray-100';

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item => {
    if (item.adminOnly) {
      return currentUser?.role === 'admin' || currentUser?.role === 'moderator';
    }
    return true;
  });

  return (
    <div className={`${sidebarWidth} ${bg} border-r transition-all duration-300 flex flex-col h-screen sticky top-0`}>
      {/* Header with hamburger */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded-lg ${hoverBg} transition-colors`}
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <Menu size={20} className={textPrimary} />
        </button>
        {isExpanded && (
          <h1 className={`text-lg font-bold ${textPrimary}`}>Verumen</h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {activeSubMenu ? (
          // Sub-menu view
          <div className="space-y-1">
            {/* Back button */}
            <button
              onClick={handleBack}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${hoverBg} transition-colors ${textSecondary}`}
            >
              <ChevronLeft size={20} />
              {isExpanded && <span className="text-sm font-medium">Back</span>}
            </button>

            {/* Sub-menu title */}
            {isExpanded && (
              <div className={`px-3 py-2 ${textPrimary} font-semibold text-sm uppercase tracking-wide`}>
                {menuItems.find(m => m.id === activeSubMenu)?.label}
              </div>
            )}

            {/* Sub-menu items */}
            {menuItems.find(m => m.id === activeSubMenu)?.subItems.map(subItem => (
              <button
                key={subItem.id}
                onClick={() => handleSubItemClick(subItem.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(subItem.path) ? activeBg : hoverBg
                } ${textPrimary}`}
              >
                <div className="w-5" /> {/* Spacer for alignment */}
                {isExpanded && <span className="text-sm">{subItem.label}</span>}
              </button>
            ))}
          </div>
        ) : (
          // Main menu view
          <div className="space-y-1">
            {visibleMenuItems.map(item => {
              const Icon = item.icon;
              const active = item.path ? isActive(item.path) : false;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    active ? activeBg : hoverBg
                  } ${textPrimary} group`}
                  title={!isExpanded ? item.label : ''}
                >
                  <Icon size={20} className={active ? 'text-blue-400' : textSecondary} />
                  {isExpanded && (
                    <span className="text-sm flex-1 text-left">{item.label}</span>
                  )}
                  {isExpanded && item.subItems && (
                    <ChevronLeft size={16} className={`${textSecondary} -rotate-180`} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer - User profile */}
      <div className="border-t border-gray-800 p-2">
        <button
          onClick={() => navigate(`/profile/${currentUser?.username}`)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${hoverBg} transition-colors ${textPrimary}`}
          title={!isExpanded ? currentUser?.username : ''}
        >
          <User size={20} className={textSecondary} />
          {isExpanded && (
            <div className="flex-1 text-left">
              <p className="text-sm font-medium truncate">{currentUser?.username}</p>
              <p className="text-xs text-gray-500">{currentUser?.role}</p>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}