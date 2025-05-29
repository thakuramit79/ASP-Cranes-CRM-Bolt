import React, { useState, useEffect } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { getUserNotifications, markNotificationAsRead } from '../../services/notificationService';
import { Notification } from '../../types/notification';
import { Badge } from '../common/Badge';

export function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);
  
  const fetchNotifications = async () => {
    if (user) {
      const userNotifications = await getUserNotifications(user.id);
      setNotifications(userNotifications);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      fetchNotifications();
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
    
    setShowNotifications(false);
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex justify-between items-center px-4 py-4 md:px-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          {user?.role === 'sales_agent' && 'Sales Dashboard'}
          {user?.role === 'operations_manager' && 'Operations Dashboard'}
          {user?.role === 'operator' && 'Operator Dashboard'}
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              className="relative text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-dropdown overflow-hidden z-20">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    <ul>
                      {notifications.map((notification) => (
                        <li 
                          key={notification.id} 
                          className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                            notification.read ? 'bg-white' : 'bg-primary-50'
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                            </div>
                            {!notification.read && (
                              <Badge variant="primary" className="ml-2">New</Badge>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={handleLogout}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}