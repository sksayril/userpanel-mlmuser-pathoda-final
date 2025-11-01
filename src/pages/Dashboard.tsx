import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Gift, 
  ArrowDownToLine, 
  TrendingUp, 
  Users, 
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw,
  Calendar,
  UserCheck,
  CreditCard,
  TrendingDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiService } from '../services/api';
import { DashboardResponse } from '../types/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBalances, setShowBalances] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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

  // Chart configurations
  const monthlyEarningsChart = {
    labels: dashboardData?.charts.monthlyEarnings.map(item => item.month) || [],
    datasets: [
      {
        label: 'Monthly Earnings',
        data: dashboardData?.charts.monthlyEarnings.map(item => item.earnings) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const dailyEarningsChart = {
    labels: dashboardData?.charts.dailyEarnings.map(item => item.date) || [],
    datasets: [
      {
        label: 'Daily Earnings',
        data: dashboardData?.charts.dailyEarnings.map(item => item.earnings) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };

  const walletDistributionChart = {
    labels: ['Main Wallet', 'Benefit Wallet', 'Withdrawal Wallet'],
    datasets: [
      {
        data: dashboardData ? [
          dashboardData.charts.walletDistribution.mainWallet,
          dashboardData.charts.walletDistribution.benefitWallet,
          dashboardData.charts.walletDistribution.withdrawalWallet,
        ] : [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const earningsByTypeChart = {
    labels: ['Referral Bonus', 'Admin Referral', 'Deposit Approval', 'Deposit Bonus', 'Credit'],
    datasets: [
      {
        data: dashboardData ? [
          dashboardData.charts.earningsByType.referral_bonus,
          dashboardData.charts.earningsByType.admin_referral_bonus,
          dashboardData.charts.earningsByType.deposit_approval,
          dashboardData.charts.earningsByType.deposit_bonus,
          dashboardData.charts.earningsByType.credit,
        ] : [],
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(245, 158, 11)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value;
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {dashboardData.user?.firstName || 'User'}! 👋
        </h1>
          <p className="text-gray-600">Here's your comprehensive dashboard overview.</p>
        </div>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              {showBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Main Wallet</h3>
          <p className="text-2xl font-bold">
            {showBalances ? (dashboardData.wallets?.mainWallet?.formatted || 'N/A') : '••••••'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Gift className="w-6 h-6" />
            </div>
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              {showBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Benefit Wallet</h3>
          <p className="text-2xl font-bold">
            {showBalances ? (dashboardData.wallets?.benefitWallet?.formatted || 'N/A') : '••••••'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <ArrowDownToLine className="w-6 h-6" />
            </div>
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              {showBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Withdrawal Wallet</h3>
          <p className="text-2xl font-bold">
            {showBalances ? (dashboardData.wallets?.withdrawalWallet?.formatted || 'N/A') : '••••••'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              {showBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Balance</h3>
          <p className="text-2xl font-bold">
            {showBalances ? (dashboardData.wallets?.totalBalance?.formatted || 'N/A') : '••••••'}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(dashboardData.statistics?.totalEarnings || 0)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Monthly Earnings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(dashboardData.statistics?.monthlyEarnings || 0)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardData.statistics?.totalReferrals || 0}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-100">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
              <p className="text-gray-600 text-sm font-medium">Total Commissions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(dashboardData.statistics?.totalCommissions || 0)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-orange-100">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Earnings Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Monthly Earnings</h3>
          </div>
          <div className="h-64">
            <Line data={monthlyEarningsChart} options={chartOptions} />
          </div>
        </div>

        {/* Daily Earnings Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Daily Earnings</h3>
          </div>
          <div className="h-64">
            <Bar data={dailyEarningsChart} options={chartOptions} />
          </div>
        </div>

        {/* Wallet Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Wallet Distribution</h3>
          </div>
          <div className="h-64">
            <Doughnut data={walletDistributionChart} options={doughnutOptions} />
          </div>
        </div>

        {/* Earnings by Type */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Earnings by Type</h3>
          </div>
          <div className="h-64">
            <Doughnut data={earningsByTypeChart} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {dashboardData.recentActivity?.transactions?.length > 0 ? (
              dashboardData.recentActivity.transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    transaction.transactionType.includes('bonus') ? 'bg-green-100' :
                    transaction.transactionType.includes('withdrawal') ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}>
                    <CreditCard className={`w-4 h-4 ${
                      transaction.transactionType.includes('bonus') ? 'text-green-600' :
                      transaction.transactionType.includes('withdrawal') ? 'text-red-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">{transaction.description}</p>
                    <p className="text-gray-500 text-xs">{transaction.formattedDate}</p>
                  </div>
                </div>
                <span className={`font-semibold text-sm ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.formattedAmount}
                </span>
              </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recent transactions found</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Commissions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Commissions</h3>
          <div className="space-y-4">
            {dashboardData.recentActivity?.commissions?.length > 0 ? (
              dashboardData.recentActivity.commissions.slice(0, 5).map((commission) => (
              <div key={commission.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">
                      Level {commission.level} from {commission.fromUser ? `${commission.fromUser.firstName} ${commission.fromUser.lastName}` : 'Unknown User'}
                    </p>
                    <p className="text-gray-500 text-xs">{formatDate(commission.createdAt)}</p>
                  </div>
                </div>
                <span className="font-semibold text-sm text-green-600">
                  {formatCurrency(commission.commissionAmount)}
                </span>
              </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recent commissions found</p>
              </div>
            )}
              </div>
            </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Performance */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Referrals</span>
              <span className="font-semibold">{dashboardData.performance.referralStats.totalDirectReferrals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Referrals</span>
              <span className="font-semibold">{dashboardData.performance.referralStats.activeReferrals}</span>
              </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Earnings</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(dashboardData.performance.referralStats.totalEarningsFromReferrals)}
              </span>
            </div>
          </div>
        </div>

        {/* Deposit Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Deposit Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Deposits</span>
              <span className="font-semibold">{dashboardData.performance.depositStats.totalDeposits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-semibold">{formatCurrency(dashboardData.performance.depositStats.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Amount</span>
              <span className="font-semibold">{formatCurrency(dashboardData.performance.depositStats.averageDepositAmount)}</span>
            </div>
          </div>
        </div>

        {/* Network Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Downline</span>
              <span className="font-semibold">{dashboardData.performance.downlineStats.totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Commissions</span>
              <span className="font-semibold">{formatCurrency(dashboardData.performance.downlineStats.totalCommissions)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Referrals</span>
              <span className="font-semibold">{dashboardData.performance.downlineStats.totalReferrals}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;