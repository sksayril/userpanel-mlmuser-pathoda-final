import React, { useState, useEffect } from 'react';
import { Users, UserPlus, TrendingUp, DollarSign, ChevronDown, ChevronRight, Search, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';
import { MlmChainResponse, ChainUser, UplineUser } from '../types/api';

const MyNetwork: React.FC = () => {
  const [chainData, setChainData] = useState<MlmChainResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchReferralCode, setSearchReferralCode] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [maxLevel, setMaxLevel] = useState(20);

  const fetchChainData = async (referralCode?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getMlmChain({
        referralCode: referralCode || undefined,
        maxLevel: maxLevel,
      });
      setChainData(data);
      // Expand first level by default
      const firstLevelIds = new Set<string>();
      data.downline.tree.forEach(user => {
        firstLevelIds.add(user.id);
      });
      setExpandedNodes(firstLevelIds);
    } catch (err: any) {
      setError(err.message || 'Failed to load MLM chain');
      console.error('Error fetching chain data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChainData();
  }, [maxLevel]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleSearch = () => {
    if (searchReferralCode.trim()) {
      fetchChainData(searchReferralCode.trim());
    } else {
      fetchChainData();
    }
  };

  const handleReset = () => {
    setSearchReferralCode('');
    fetchChainData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const renderTreeNode = (user: ChainUser, level: number = 0): JSX.Element => {
    const hasChildren = user.children && user.children.length > 0;
    const isExpanded = expandedNodes.has(user.id);

    return (
      <div key={user.id} className="mb-2">
        <div
          className={`flex items-start p-4 rounded-lg border transition-all duration-200 ${
            level === 0
              ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={() => toggleNode(user.id)}
              className="mr-3 mt-1 text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          ) : (
            <div className="w-8" />
          )}

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="flex items-start space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                  level === 0
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}>
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user.fullName}
                    {level > 0 && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        Level {user.level}
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Code: <span className="font-mono font-semibold">{user.referralCode}</span>
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-500 text-xs">Referrals</p>
                  <p className="font-semibold text-gray-900">{user.totalReferrals}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-xs">Commissions</p>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(user.totalCommissionsEarned)}
                  </p>
                </div>
                {user.directReferralsCount !== undefined && (
                  <div className="text-center">
                    <p className="text-gray-500 text-xs">Direct</p>
                    <p className="font-semibold text-blue-600">{user.directReferralsCount}</p>
                  </div>
                )}
                {user.childrenCount !== undefined && (
                  <div className="text-center">
                    <p className="text-gray-500 text-xs">Children</p>
                    <p className="font-semibold text-purple-600">{user.childrenCount}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap gap-4 text-xs text-gray-500">
              <span>Joined: {formatDate(user.joinedAt)}</span>
              {user.phone && <span>Phone: {user.phone}</span>}
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-8 mt-2 border-l-2 border-gray-300 pl-4">
            {user.children!.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading && !chainData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading MLM chain...</p>
        </div>
      </div>
    );
  }

  if (error && !chainData) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">My Network</h1>
          <p className="text-gray-600">View your MLM referral chain and network.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => fetchChainData()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">My Network</h1>
        <p className="text-gray-600">View your MLM referral chain and network structure.</p>
      </div>

      {/* Search and Controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Referral Code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchReferralCode}
                  onChange={(e) => setSearchReferralCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter referral code..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Search
              </button>
              {searchReferralCode && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Level
            </label>
            <input
              type="number"
              value={maxLevel}
              onChange={(e) => setMaxLevel(parseInt(e.target.value) || 20)}
              min="1"
              max="50"
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => fetchChainData(searchReferralCode || undefined)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {chainData && (
        <>
      {/* Network Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3">
                <Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">
                {chainData.downline.statistics.totalDownlineUsers}
              </p>
              <p className="text-gray-600 text-sm font-medium">Total Downline</p>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-3">
                <UserPlus className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">
                {chainData.downline.statistics.directReferrals}
              </p>
              <p className="text-gray-600 text-sm font-medium">Direct Referrals</p>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">
                {chainData.downline.statistics.totalDownlineReferrals}
              </p>
              <p className="text-gray-600 text-sm font-medium">Total Referrals</p>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">
                {formatCurrency(chainData.downline.statistics.totalDownlineCommissions)}
              </p>
              <p className="text-gray-600 text-sm font-medium">Total Commissions</p>
            </div>
      </div>

          {/* Current User Card */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                  {chainData.currentUser.firstName[0]}{chainData.currentUser.lastName[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{chainData.currentUser.fullName}</h2>
                  <p className="text-indigo-100">{chainData.currentUser.email}</p>
                  <p className="text-indigo-200 text-sm mt-1">
                    Referral Code: <span className="font-mono font-semibold">{chainData.currentUser.referralCode}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-indigo-200 text-sm">Total Referrals</p>
                  <p className="text-2xl font-bold">{chainData.currentUser.totalReferrals}</p>
                </div>
                <div>
                  <p className="text-indigo-200 text-sm">Commissions Earned</p>
                  <p className="text-2xl font-bold">{formatCurrency(chainData.currentUser.totalCommissionsEarned)}</p>
                </div>
                {chainData.currentUser.referralLevel && (
                  <div>
                    <p className="text-indigo-200 text-sm">Referral Level</p>
                    <p className="text-2xl font-bold">{chainData.currentUser.referralLevel}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upline Section */}
          {chainData.upline.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upline</h2>
              <div className="space-y-3">
                {chainData.upline.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {user.fullName}
                          <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                            Level {user.level} ({user.position})
                          </span>
                        </h3>
                        <p className="text-gray-600 text-sm">{user.email}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          Code: <span className="font-mono">{user.referralCode}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500 text-xs">Referrals</p>
                        <p className="font-semibold text-gray-900">{user.totalReferrals}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 text-xs">Commissions</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(user.totalCommissionsEarned)}
                        </p>
                      </div>
                    </div>
            </div>
          ))}
        </div>
      </div>
          )}

          {/* Downline Tree Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Downline Tree</h2>
              <div className="text-sm text-gray-500">
                Showing {chainData.chainInfo.totalLevels} of {chainData.chainInfo.maxLevel} levels
              </div>
            </div>

            {chainData.downline.tree.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No downline users found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chainData.downline.tree.map((user) => renderTreeNode(user, 0))}
              </div>
            )}
          </div>

          {/* Statistics by Level */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics by Level</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(chainData.downline.statistics.usersByLevel).map(([level, stats]) => (
                <div
                  key={level}
                  className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                >
                  <h3 className="font-semibold text-gray-900 mb-3">Level {level}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Users:</span>
                      <span className="font-semibold text-gray-900">{stats.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Commissions:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(stats.totalCommissions)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Referrals:</span>
                      <span className="font-semibold text-blue-600">{stats.totalReferrals}</span>
                    </div>
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default MyNetwork;
