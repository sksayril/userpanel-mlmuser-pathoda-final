import React from 'react';
import { Users, UserPlus, MessageCircle, Star } from 'lucide-react';

const MyNetwork: React.FC = () => {
  const connections = [
    { name: 'Sarah Johnson', role: 'Digital Marketer', mutual: 15, status: 'online' },
    { name: 'Michael Chen', role: 'Software Engineer', mutual: 8, status: 'offline' },
    { name: 'Emily Davis', role: 'Product Manager', mutual: 23, status: 'online' },
    { name: 'Alex Rodriguez', role: 'UX Designer', mutual: 11, status: 'away' },
    { name: 'Jessica Wilson', role: 'Data Analyst', mutual: 19, status: 'online' },
  ];

  const suggestions = [
    { name: 'David Kim', role: 'Marketing Director', company: 'TechCorp' },
    { name: 'Lisa Zhang', role: 'Frontend Developer', company: 'StartupXYZ' },
    { name: 'Robert Smith', role: 'Business Analyst', company: 'FinanceInc' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">My Network</h1>
        <p className="text-gray-600">Connect and grow your professional network.</p>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Connections', value: '1,247', icon: Users, color: 'from-blue-500 to-blue-600' },
          { label: 'New This Week', value: '23', icon: UserPlus, color: 'from-green-500 to-green-600' },
          { label: 'Messages', value: '156', icon: MessageCircle, color: 'from-purple-500 to-purple-600' },
          { label: 'Top Rated', value: '4.9', icon: Star, color: 'from-yellow-500 to-yellow-600' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* My Connections */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Connections</h2>
        <div className="space-y-4">
          {connections.map((connection, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {connection.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    connection.status === 'online' ? 'bg-green-500' :
                    connection.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{connection.name}</h3>
                  <p className="text-gray-600 text-sm">{connection.role}</p>
                  <p className="text-gray-500 text-xs">{connection.mutual} mutual connections</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                Message
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Connections */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">People You May Know</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold mx-auto mb-3">
                  {suggestion.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{suggestion.name}</h3>
                <p className="text-gray-600 text-sm mb-1">{suggestion.role}</p>
                <p className="text-gray-500 text-xs mb-4">{suggestion.company}</p>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium">
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyNetwork;