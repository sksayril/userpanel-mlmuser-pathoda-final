import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  BarChart3,
  Network,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import {
  CommissionStructureResponse,
  CommissionSummaryResponse,
  CommissionHistoryResponse,
  DownlineReportResponse,
  NetworkTreeResponse,
  ReferralHierarchyResponse,
  DownlineUsersResponse,
  CommissionHistoryParams,
  DownlineUsersParams,
  CommissionStructure,
  CommissionByLevel,
  RecentCommission,
  CommissionHistoryItem,
  ReferralHierarchyItem,
  DownlineLevel,
  DownlineUser,
  NetworkTreeNode
} from '../types/api';

const MyLevels: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'structure' | 'history' | 'network' | 'downline'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [commissionStructure, setCommissionStructure] = useState<CommissionStructureResponse | null>(null);
  const [commissionSummary, setCommissionSummary] = useState<CommissionSummaryResponse | null>(null);
  const [commissionHistory, setCommissionHistory] = useState<CommissionHistoryResponse | null>(null);
  const [downlineReport, setDownlineReport] = useState<DownlineReportResponse | null>(null);
  const [networkTree, setNetworkTree] = useState<NetworkTreeResponse | null>(null);
  const [referralHierarchy, setReferralHierarchy] = useState<ReferralHierarchyResponse | null>(null);
  const [, setDownlineUsers] = useState<DownlineUsersResponse | null>(null);
  
  // Filter states
  const [historyFilters, setHistoryFilters] = useState<CommissionHistoryParams>({
    page: 1,
    limit: 20,
    level: undefined,
    status: undefined
  });
  const [downlineFilters] = useState<DownlineUsersParams>({
    page: 1,
    limit: 50,
    maxLevel: 20
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set());

  // Load data based on active tab
  useEffect(() => {
    loadDataForTab(activeTab);
  }, [activeTab, historyFilters, downlineFilters]);

  const loadDataForTab = async (tab: string) => {
    setLoading(true);
    setError(null);
    
    try {
      switch (tab) {
        case 'overview':
          await Promise.all([
            loadCommissionSummary(),
            loadCommissionStructure()
          ]);
          break;
        case 'structure':
          await loadCommissionStructure();
          break;
        case 'history':
          await loadCommissionHistory();
          break;
        case 'network':
          await Promise.all([
            loadNetworkTree(),
            loadReferralHierarchy()
          ]);
          break;
        case 'downline':
          await Promise.all([
            loadDownlineReport(),
            loadDownlineUsers()
          ]);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadCommissionStructure = async () => {
    const data = await apiService.getCommissionStructure();
    setCommissionStructure(data);
  };

  const loadCommissionSummary = async () => {
    const data = await apiService.getCommissionSummary();
    setCommissionSummary(data);
  };

  const loadCommissionHistory = async () => {
    const data = await apiService.getCommissionHistory(historyFilters);
    setCommissionHistory(data);
  };

  const loadDownlineReport = async () => {
    const data = await apiService.getDownlineReport(downlineFilters.maxLevel);
    setDownlineReport(data);
  };

  const loadNetworkTree = async () => {
    const data = await apiService.getNetworkTree(5);
    setNetworkTree(data);
  };

  const loadReferralHierarchy = async () => {
    const data = await apiService.getReferralHierarchy();
    setReferralHierarchy(data);
  };

  const loadDownlineUsers = async () => {
    const data = await apiService.getDownlineUsers(downlineFilters);
    setDownlineUsers(data);
  };

  const handleRefresh = () => {
    loadDataForTab(activeTab);
  };

  const toggleLevelExpansion = (level: number) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(level)) {
      newExpanded.delete(level);
    } else {
      newExpanded.add(level);
    }
    setExpandedLevels(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'structure', label: 'Commission Structure', icon: Layers },
    { id: 'history', label: 'Commission History', icon: Calendar },
    { id: 'network', label: 'Network Tree', icon: Network },
    { id: 'downline', label: 'Downline Report', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Layers className="w-8 h-8 text-blue-600" />
                My Levels & Commissions
              </h1>
              <p className="text-gray-600 mt-1">Track your MLM commission structure and earnings</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Error loading data</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading data...</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && commissionSummary && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Commissions</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(commissionSummary.totalCommissionsEarned)}
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Count</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {commissionSummary.totalCommissionsCount}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(commissionSummary.monthlyEarnings)}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Downline</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {commissionSummary.networkStats.totalDownline}
                        </p>
                      </div>
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Users className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Commissions by Level */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Commissions by Level</h3>
                  <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {commissionSummary.commissionsByLevel.map((item: CommissionByLevel, index: number) => {
                        const getLevelColor = (level: number) => {
                          if (level === 1) return 'from-blue-600 to-purple-600';
                          if (level === 2) return 'from-green-500 to-blue-500';
                          if (level === 3) return 'from-yellow-500 to-orange-500';
                          if (level === 4) return 'from-purple-500 to-pink-500';
                          return 'from-gray-500 to-gray-700';
                        };

                        return (
                          <div key={item.level} className="group relative">
                            {/* Connection line to next item */}
                            {index < commissionSummary.commissionsByLevel.length - 1 && (
                              <div className="hidden lg:block absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-0.5 bg-gradient-to-r from-gray-300 to-transparent group-hover:from-blue-400 transition-colors"></div>
                            )}
                            
                            <div className={`bg-gradient-to-r ${getLevelColor(item.level)} text-white rounded-xl p-4 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium opacity-90">Level {item.level}</span>
                                <div className="p-1.5 bg-white bg-opacity-20 rounded-lg">
                                  <Layers className="w-3 h-3" />
                                </div>
                              </div>
                              <p className="text-xl font-bold mb-1">
                                {formatCurrency(item.totalAmount)}
                              </p>
                              <p className="text-xs opacity-90">
                                {item.count} commissions
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Recent Commissions */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Commissions</h3>
                  <div className="space-y-3">
                    {commissionSummary.recentCommissions.map((commission: RecentCommission) => (
                      <div key={commission.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Layers className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Level {commission.level} Commission
                            </p>
                            <p className="text-sm text-gray-600">
                              From {commission.fromUser.firstName} {commission.fromUser.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(commission.commissionAmount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(commission.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Commission Structure Tab */}
            {activeTab === 'structure' && commissionStructure && (
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {commissionStructure.description}
                    </h3>
                    <p className="text-gray-600">
                      Total Levels: {commissionStructure.totalLevels}
                    </p>
                  </div>
                </div>

                {/* Tree Structure View */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Commission Tree Structure</h4>
                    <p className="text-gray-600 text-sm">Visual representation of your commission levels with connecting relationships</p>
                  </div>
                  
                  <div className="relative">
                    {/* Tree Container */}
                    <div className="flex flex-col items-center space-y-8">
                      {/* Level 1 - Top Level */}
                      <div className="relative">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium opacity-90">Level 1</span>
                            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                              <Layers className="w-4 h-4" />
                            </div>
                          </div>
                          <p className="text-3xl font-bold mb-1">
                            {commissionStructure.commissionStructure[0]?.formattedPercentage || '4.00%'}
                          </p>
                          <p className="text-sm opacity-90">Direct Commission</p>
                        </div>
                        
                        {/* Connection Line to Level 2 */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-blue-600 to-gray-300"></div>
                      </div>

                      {/* Level 2 */}
                      <div className="relative">
                        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl p-5 shadow-lg transform hover:scale-105 transition-all duration-300">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium opacity-90">Level 2</span>
                            <div className="p-1.5 bg-white bg-opacity-20 rounded-lg">
                              <Layers className="w-3 h-3" />
                            </div>
                          </div>
                          <p className="text-2xl font-bold mb-1">
                            {commissionStructure.commissionStructure[1]?.formattedPercentage || '2.00%'}
                          </p>
                          <p className="text-xs opacity-90">Secondary Commission</p>
                        </div>
                        
                        {/* Connection Line to Level 3 */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-green-500 to-gray-300"></div>
                      </div>

                      {/* Level 3 */}
                      <div className="relative">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl p-4 shadow-lg transform hover:scale-105 transition-all duration-300">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium opacity-90">Level 3</span>
                            <div className="p-1.5 bg-white bg-opacity-20 rounded-lg">
                              <Layers className="w-3 h-3" />
                            </div>
                          </div>
                          <p className="text-xl font-bold mb-1">
                            {commissionStructure.commissionStructure[2]?.formattedPercentage || '1.00%'}
                          </p>
                          <p className="text-xs opacity-90">Tertiary Commission</p>
                        </div>
                        
                        {/* Connection Line to Level 4 */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-yellow-500 to-gray-300"></div>
                      </div>

                      {/* Level 4 */}
                      <div className="relative">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-4 shadow-lg transform hover:scale-105 transition-all duration-300">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium opacity-90">Level 4</span>
                            <div className="p-1.5 bg-white bg-opacity-20 rounded-lg">
                              <Layers className="w-3 h-3" />
                            </div>
                          </div>
                          <p className="text-xl font-bold mb-1">
                            {commissionStructure.commissionStructure[3]?.formattedPercentage || '0.50%'}
                          </p>
                          <p className="text-xs opacity-90">Quaternary Commission</p>
                        </div>
                        
                        {/* Connection Line to Levels 5-20 */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-purple-500 to-gray-300"></div>
                      </div>

                      {/* Levels 5-20 - Grouped */}
                      <div className="relative">
                        <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium opacity-90">Levels 5-20</span>
                            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                              <Layers className="w-4 h-4" />
                            </div>
                          </div>
                          <p className="text-2xl font-bold mb-1">
                            {commissionStructure.commissionStructure[4]?.formattedPercentage || '0.25%'}
                          </p>
                          <p className="text-sm opacity-90">Standard Commission</p>
                          <div className="mt-2 text-xs opacity-75">
                            <p>16 levels with consistent rate</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Grid View */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Detailed Commission Structure</h4>
                    <p className="text-gray-600 text-sm">Complete breakdown of all commission levels</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {commissionStructure.commissionStructure.map((level: CommissionStructure, index: number) => {
                      const getLevelColor = (levelNum: number) => {
                        if (levelNum === 1) return 'from-blue-600 to-purple-600';
                        if (levelNum === 2) return 'from-green-500 to-blue-500';
                        if (levelNum === 3) return 'from-yellow-500 to-orange-500';
                        if (levelNum === 4) return 'from-purple-500 to-pink-500';
                        return 'from-gray-500 to-gray-700';
                      };

                      const getLevelSize = (levelNum: number) => {
                        if (levelNum <= 2) return 'text-2xl';
                        if (levelNum <= 4) return 'text-xl';
                        return 'text-lg';
                      };

                      return (
                        <div key={level.level} className="group relative">
                          {/* Connection indicator */}
                          {index < commissionStructure.commissionStructure.length - 1 && (
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gray-300 group-hover:bg-blue-400 transition-colors"></div>
                          )}
                          
                          <div className={`bg-gradient-to-r ${getLevelColor(level.level)} text-white rounded-xl p-4 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium opacity-90">Level {level.level}</span>
                              <div className="p-1.5 bg-white bg-opacity-20 rounded-lg">
                                <Layers className="w-3 h-3" />
                              </div>
                            </div>
                            <p className={`${getLevelSize(level.level)} font-bold mb-1`}>
                              {level.formattedPercentage}
                            </p>
                            <p className="text-xs opacity-90">
                              Commission Rate
                            </p>
                            
                            {/* Level description */}
                            <div className="mt-2 text-xs opacity-75">
                              {level.level === 1 && <p>Direct referral</p>}
                              {level.level === 2 && <p>Second level</p>}
                              {level.level === 3 && <p>Third level</p>}
                              {level.level === 4 && <p>Fourth level</p>}
                              {level.level >= 5 && <p>Standard level</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Commission Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Commission Structure Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">4.00%</div>
                      <div className="text-sm text-gray-600">Level 1 (Direct)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">2.00%</div>
                      <div className="text-sm text-gray-600">Level 2 (Secondary)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">1.00%</div>
                      <div className="text-sm text-gray-600">Level 3 (Tertiary)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">0.25%</div>
                      <div className="text-sm text-gray-600">Levels 5-20</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Commission History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Commission History</h3>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Filter className="w-4 h-4" />
                      Filters
                      {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                        <select
                          value={historyFilters.level || ''}
                          onChange={(e) => setHistoryFilters({
                            ...historyFilters,
                            level: e.target.value ? parseInt(e.target.value) : undefined,
                            page: 1
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All Levels</option>
                          {Array.from({ length: 20 }, (_, i) => i + 1).map(level => (
                            <option key={level} value={level}>Level {level}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={historyFilters.status || ''}
                          onChange={(e) => setHistoryFilters({
                            ...historyFilters,
                            status: e.target.value as any || undefined,
                            page: 1
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
                        <select
                          value={historyFilters.limit}
                          onChange={(e) => setHistoryFilters({
                            ...historyFilters,
                            limit: parseInt(e.target.value),
                            page: 1
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* History List */}
                {commissionHistory && (
                  <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-6">
                      <div className="space-y-4">
                        {commissionHistory.commissions.map((commission: CommissionHistoryItem) => (
                          <div key={commission.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <Layers className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Level {commission.level} Commission
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    From {commission.fromUser.name} ({commission.fromUser.referralCode})
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Deposit: {commission.formattedDepositAmount}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold text-gray-900">
                                  {commission.formattedCommissionAmount}
                                </p>
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(commission.status)}`}>
                                  {getStatusIcon(commission.status)}
                                  {commission.status}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  {commission.formattedDate}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {commissionHistory.pagination.pages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                          <p className="text-sm text-gray-700">
                            Showing {((commissionHistory.pagination.current - 1) * commissionHistory.pagination.limit) + 1} to{' '}
                            {Math.min(commissionHistory.pagination.current * commissionHistory.pagination.limit, commissionHistory.pagination.total)} of{' '}
                            {commissionHistory.pagination.total} results
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setHistoryFilters({ ...historyFilters, page: historyFilters.page! - 1 })}
                              disabled={commissionHistory.pagination.current <= 1}
                              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() => setHistoryFilters({ ...historyFilters, page: historyFilters.page! + 1 })}
                              disabled={commissionHistory.pagination.current >= commissionHistory.pagination.pages}
                              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Network Tree Tab */}
            {activeTab === 'network' && (
              <div className="space-y-6">
                {/* Referral Hierarchy */}
                {referralHierarchy && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Hierarchy (Upline)</h3>
                    <div className="space-y-4">
                      {referralHierarchy.hierarchy.map((member: ReferralHierarchyItem, index: number) => (
                        <div key={member.userId} className="relative">
                          {/* Connection line */}
                          {index < referralHierarchy.hierarchy.length - 1 && (
                            <div className="absolute left-6 top-full w-0.5 h-4 bg-gradient-to-b from-blue-400 to-gray-300"></div>
                          )}
                          
                          <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-xl ${
                                member.level === 0 ? 'bg-gradient-to-r from-blue-600 to-purple-600' :
                                member.level === 1 ? 'bg-gradient-to-r from-green-500 to-blue-500' :
                                member.level === 2 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                'bg-gradient-to-r from-gray-500 to-gray-700'
                              }`}>
                                <UserCheck className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  Level {member.level}: {member.firstName} {member.lastName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {member.email} • {member.referralCode}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {member.totalReferrals} referrals • {formatCurrency(member.totalCommissionsEarned)} earned
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Network Tree */}
                {networkTree && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Tree (Max Depth: {networkTree.maxDepth})</h3>
                    <div className="relative">
                      <div className="space-y-4">
                        {renderEnhancedNetworkTreeNode(networkTree.networkTree, 0)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Downline Report Tab */}
            {activeTab === 'downline' && (
              <div className="space-y-6">
                {/* Summary */}
                {downlineReport && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Users</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {downlineReport.summary.totalUsers}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Commissions</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(downlineReport.summary.totalCommissions)}
                          </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                          <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {downlineReport.summary.totalReferrals}
                          </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <UserCheck className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Downline by Level */}
                {downlineReport && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Downline by Level</h3>
                    <div className="space-y-4">
                      {downlineReport.byLevel.map((level: DownlineLevel, index: number) => {
                        const getLevelColor = (levelNum: number) => {
                          if (levelNum === 1) return 'from-blue-600 to-purple-600';
                          if (levelNum === 2) return 'from-green-500 to-blue-500';
                          if (levelNum === 3) return 'from-yellow-500 to-orange-500';
                          if (levelNum === 4) return 'from-purple-500 to-pink-500';
                          return 'from-gray-500 to-gray-700';
                        };

                        return (
                          <div key={level.level} className="relative">
                            {/* Connection line to next level */}
                            {index < downlineReport.byLevel.length - 1 && (
                              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-gray-300 to-transparent"></div>
                            )}
                            
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() => toggleLevelExpansion(level.level)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 bg-gradient-to-r ${getLevelColor(level.level)} rounded-lg`}>
                                    <Layers className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="text-left">
                                    <p className="font-medium text-gray-900">Level {level.level}</p>
                                    <p className="text-sm text-gray-600">
                                      {level.userCount} users • {level.totalReferrals} referrals • {formatCurrency(level.totalCommissions)} commissions
                                    </p>
                                  </div>
                                </div>
                                {expandedLevels.has(level.level) ? (
                                  <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                              
                              {expandedLevels.has(level.level) && (
                                <div className="border-t border-gray-200 p-4 bg-gray-50">
                                  <div className="space-y-3">
                                    {level.users.map((user: DownlineUser, userIndex: number) => (
                                      <div key={user.userId} className="relative">
                                        {/* Connection line between users */}
                                        {userIndex < level.users.length - 1 && (
                                          <div className="absolute -bottom-1.5 left-6 w-0.5 h-3 bg-gray-300"></div>
                                        )}
                                        
                                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                          <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                              <UserCheck className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                              <p className="font-medium text-gray-900">
                                                {user.firstName} {user.lastName}
                                              </p>
                                              <p className="text-sm text-gray-600">
                                                {user.email} • {user.referralCode}
                                              </p>
                                              <p className="text-sm text-gray-500">
                                                Joined: {formatDate(user.joinedAt)}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                              {user.totalReferrals} referrals
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              {formatCurrency(user.totalCommissionsEarned)} earned
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );


  function renderEnhancedNetworkTreeNode(node: NetworkTreeNode, depth: number): React.ReactNode {
    if (depth > 3) return null; // Limit depth for performance

    const getLevelColor = (level: number) => {
      if (level === 0) return 'from-blue-600 to-purple-600';
      if (level === 1) return 'from-green-500 to-blue-500';
      if (level === 2) return 'from-yellow-500 to-orange-500';
      if (level === 3) return 'from-purple-500 to-pink-500';
      return 'from-gray-500 to-gray-700';
    };

    const getLevelSize = (level: number) => {
      if (level === 0) return 'p-4';
      if (level === 1) return 'p-3';
      if (level === 2) return 'p-3';
      return 'p-2';
    };

    return (
      <div key={node.id} className="relative">
        {/* Connection line from parent */}
        {depth > 0 && (
          <div className="absolute -top-4 left-6 w-0.5 h-4 bg-gradient-to-b from-gray-300 to-transparent"></div>
        )}
        
        <div className={`ml-${depth * 4} mb-4`}>
          <div className={`bg-gradient-to-r ${getLevelColor(node.level)} text-white rounded-xl ${getLevelSize(node.level)} shadow-lg transform hover:scale-105 transition-all duration-300`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">
                  {node.firstName} {node.lastName}
                </p>
                <p className="text-sm opacity-90">
                  {node.email} • {node.referralCode}
                </p>
                <p className="text-sm opacity-75">
                  Level {node.level} • {node.totalReferrals} referrals • {formatCurrency(node.totalCommissionsEarned)} earned
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-75">Level {node.level}</div>
                <div className="text-sm font-semibold">{node.totalReferrals} refs</div>
              </div>
            </div>
          </div>
        </div>
        
        {node.children && node.children.length > 0 && (
          <div className="relative">
            {/* Vertical connection line */}
            <div className="absolute left-6 top-0 w-0.5 h-full bg-gradient-to-b from-gray-300 to-transparent"></div>
            
            <div className="ml-8">
              {node.children.map((child: NetworkTreeNode) => (
                <div key={child.id} className="relative">
                  {/* Horizontal connection line */}
                  <div className="absolute -left-8 top-6 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-transparent"></div>
                  {renderEnhancedNetworkTreeNode(child, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default MyLevels;
