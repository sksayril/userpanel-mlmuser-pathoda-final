import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Wallet,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Coins
} from 'lucide-react';
import { apiService } from '../services/api';
import { 
  DashboardResponse,
  GoldTradingHistoryItem,
  ProfitLossSummaryResponse,
  GoldHoldingsResponse,
  CurrentGoldPrice
} from '../types/api';
import TransferToTrading from '../components/TransferToTrading';
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
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type TabType = 'gold' | 'history' | 'profit-loss' | 'holdings';

const Trade: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('gold');
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [holdingsData, setHoldingsData] = useState<GoldHoldingsResponse | null>(null);
  const [historyData, setHistoryData] = useState<{ trades: GoldTradingHistoryItem[]; pagination: any } | null>(null);
  const [profitLossData, setProfitLossData] = useState<ProfitLossSummaryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [tradingLoading, setTradingLoading] = useState(false);
  
  // Live Gold Price states
  const [currentGoldPrice, setCurrentGoldPrice] = useState<CurrentGoldPrice | null>(null);
  const [priceHistory, setPriceHistory] = useState<Array<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    price: number;
  }>>([]);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [useLivePrice, setUseLivePrice] = useState(true);
  
  // Buy/Sell form states
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [goldAmount, setGoldAmount] = useState('');
  const [goldPrice, setGoldPrice] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [buyTradeId, setBuyTradeId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);
  
  // History filters
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit] = useState(20);
  const [historyFilters, setHistoryFilters] = useState({
    tradeType: '' as '' | 'buy' | 'sell',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadDashboardData();
    if (activeTab === 'holdings') loadHoldingsData();
    if (activeTab === 'history') loadHistoryData();
    if (activeTab === 'profit-loss') loadProfitLossData();
  }, [activeTab, historyPage, historyFilters]);

  // Live Gold Price fetching every 1 second
  useEffect(() => {
    const fetchGoldPrice = async () => {
      try {
        const response = await apiService.getCurrentGoldPrice();
        if (response.success && response.data) {
          setCurrentGoldPrice(response.data);
          setPriceError(null);
          
          // Update price history for candlestick chart (keep last 50 data points)
          setPriceHistory(prev => {
            const now = new Date().toISOString();
            const currentMinute = Math.floor(Date.now() / 60000); // Group by minute
            
            // Get the last entry
            const lastEntry = prev[prev.length - 1];
            
            if (lastEntry && Math.floor(new Date(lastEntry.time).getTime() / 60000) === currentMinute) {
              // Update existing minute entry
              const updatedEntry = {
                ...lastEntry,
                high: Math.max(lastEntry.high, response.data.price),
                low: Math.min(lastEntry.low, response.data.price),
                close: response.data.price,
                price: response.data.price,
              };
              return [...prev.slice(0, -1), updatedEntry];
            } else {
              // Create new minute entry
              const newEntry = {
                time: now,
                open: response.data.price,
                high: response.data.price,
                low: response.data.price,
                close: response.data.price,
                price: response.data.price,
              };
              const updated = [...prev, newEntry];
              // Keep only last 50 entries
              return updated.slice(-50);
            }
          });

          // Auto-update gold price in form if useLivePrice is enabled
          if (useLivePrice) {
            setGoldPrice(response.data.price.toFixed(2));
          }
        }
      } catch (err: any) {
        console.error('Error fetching gold price:', err);
        setPriceError('Failed to fetch live gold price');
      }
    };

    // Fetch immediately
    fetchGoldPrice();

    // Set up interval to fetch every 1 second
    const interval = setInterval(fetchGoldPrice, 1000);

    return () => clearInterval(interval);
  }, [useLivePrice, goldPrice]);

  const loadDashboardData = async () => {
    try {
      const data = await apiService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const loadHoldingsData = async () => {
    try {
      setHistoryLoading(true);
      const data = await apiService.getGoldHoldings();
      setHoldingsData(data);
    } catch (err) {
      console.error('Failed to load holdings:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadHistoryData = async () => {
    try {
      setHistoryLoading(true);
      const params: any = {
        page: historyPage,
        limit: historyLimit,
      };
      if (historyFilters.tradeType) params.tradeType = historyFilters.tradeType;
      if (historyFilters.startDate) params.startDate = historyFilters.startDate;
      if (historyFilters.endDate) params.endDate = historyFilters.endDate;
      
      const data = await apiService.getGoldTradingHistory(params);
      setHistoryData(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadProfitLossData = async () => {
    try {
      setHistoryLoading(true);
      const params: any = {};
      if (historyFilters.startDate) params.startDate = historyFilters.startDate;
      if (historyFilters.endDate) params.endDate = historyFilters.endDate;
      
      const data = await apiService.getGoldProfitLossSummary(
        params.startDate,
        params.endDate
      );
      setProfitLossData(data);
    } catch (err) {
      console.error('Failed to load profit/loss data:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleTransferSuccess = () => {
    loadDashboardData();
  };

  const handleBuyGold = async () => {
    try {
      setTradingLoading(true);
      setError(null);
      setSuccess(null);

      const amount = parseFloat(goldAmount);
      const price = parseFloat(goldPrice);

      if (!amount || amount <= 0 || !price || price <= 0) {
        setError('Please enter valid gold amount and price');
        return;
      }

      const response = await apiService.buyGold({
        goldAmount: amount,
        goldPrice: price,
      });

      setSuccess(response);
      setGoldAmount('');
      setGoldPrice('');
      loadDashboardData();
      if (activeTab === 'holdings') loadHoldingsData();
      if (activeTab === 'history') loadHistoryData();
    } catch (err: any) {
      console.error('Buy gold error:', err);
      setError(err.message || 'Failed to buy gold');
    } finally {
      setTradingLoading(false);
    }
  };

  const handleSellGold = async () => {
    try {
      setTradingLoading(true);
      setError(null);
      setSuccess(null);

      const amount = parseFloat(goldAmount);
      const price = parseFloat(goldPrice);
      const buyPriceValue = buyPrice ? parseFloat(buyPrice) : undefined;

      if (!amount || amount <= 0 || !price || price <= 0) {
        setError('Please enter valid gold amount and price');
        return;
      }

      const response = await apiService.sellGold({
        goldAmount: amount,
        goldPrice: price,
        buyPrice: buyPriceValue,
        buyTradeId: buyTradeId || undefined,
      });

      setSuccess(response);
      setGoldAmount('');
      setGoldPrice('');
      setBuyPrice('');
      setBuyTradeId('');
      loadDashboardData();
      if (activeTab === 'holdings') loadHoldingsData();
      if (activeTab === 'history') loadHistoryData();
      if (activeTab === 'profit-loss') loadProfitLossData();
    } catch (err: any) {
      console.error('Sell gold error:', err);
      setError(err.message || 'Failed to sell gold');
    } finally {
      setTradingLoading(false);
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Gold Trading</h1>
        <p className="text-gray-600">Buy, sell, and manage your gold portfolio.</p>
      </div>

      {/* Live Gold Price Display */}
      {currentGoldPrice && (
        <div className="bg-gradient-to-r from-yellow-600 via-amber-500 to-orange-500 rounded-xl p-6 text-white mb-6 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Coins className="w-5 h-5 mr-2" />
                <h3 className="text-lg font-semibold">Live Gold Price (XAUUSD)</h3>
                <span className="ml-3 px-2 py-1 text-xs bg-white/20 rounded-full">
                  {currentGoldPrice.source}
                </span>
              </div>
              <div className="flex items-baseline gap-4">
                <p className="text-4xl font-bold">
                  ${currentGoldPrice.price.toFixed(2)}
                </p>
                <div className={`flex items-center ${currentGoldPrice.change >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                  {currentGoldPrice.change >= 0 ? (
                    <TrendingUp className="w-5 h-5 mr-1" />
                  ) : (
                    <TrendingDown className="w-5 h-5 mr-1" />
                  )}
                  <span className="text-xl font-semibold">
                    {currentGoldPrice.change >= 0 ? '+' : ''}{currentGoldPrice.change.toFixed(2)}
                  </span>
                  <span className="text-lg ml-2">
                    ({currentGoldPrice.changePercent >= 0 ? '+' : ''}{currentGoldPrice.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <span className="text-amber-200">High:</span>
                  <p className="font-semibold">${currentGoldPrice.high.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-amber-200">Low:</span>
                  <p className="font-semibold">${currentGoldPrice.low.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-amber-200">Open:</span>
                  <p className="font-semibold">${currentGoldPrice.open.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-amber-200">Volume:</span>
                  <p className="font-semibold">{currentGoldPrice.volume.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-xs text-amber-200 mt-2">
                Last updated: {new Date(currentGoldPrice.lastUpdate).toLocaleTimeString()}
              </p>
            </div>
            {priceError && (
              <div className="text-red-200 text-sm">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                {priceError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Candlestick Chart */}
      {priceHistory.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Price Chart</h3>
          <div className="h-64">
            <Line
              data={{
                labels: priceHistory.map((_, index) => {
                  const date = new Date(priceHistory[index].time);
                  return date.toLocaleTimeString();
                }),
                datasets: [
                  {
                    label: 'Price',
                    data: priceHistory.map(p => p.price),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.1,
                    fill: true,
                  },
                  {
                    label: 'High',
                    data: priceHistory.map(p => p.high),
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    pointRadius: 0,
                  },
                  {
                    label: 'Low',
                    data: priceHistory.map(p => p.low),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    pointRadius: 0,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top' as const,
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    title: {
                      display: true,
                      text: 'Price (USD)',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Trading Wallet Balance */}
      {dashboardData && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-600 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Wallet className="w-5 h-5 mr-2" />
                Trading Wallet Balance
              </h3>
              <p className="text-3xl font-bold mb-1">
                {dashboardData.wallets?.tradingWallet?.formatted || '$0.00'}
              </p>
              <p className="text-amber-100 text-sm">
                Available for trading
              </p>
            </div>
            <div className="text-right">
              <TrendingUp className="w-12 h-12 text-amber-200 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Transfer to Trading Wallet */}
      {dashboardData && (
        <div className="mb-6">
          <TransferToTrading
            mainWalletBalance={dashboardData.wallets.mainWallet.amount}
            benefitWalletBalance={dashboardData.wallets.benefitWallet.amount}
            tradingWalletBalance={dashboardData.wallets.tradingWallet?.amount || 0}
            onTransferSuccess={handleTransferSuccess}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'gold', label: 'Buy/Sell Gold', icon: Coins },
            { id: 'holdings', label: 'Holdings', icon: Wallet },
            { id: 'history', label: 'History', icon: BarChart3 },
            { id: 'profit-loss', label: 'Profit/Loss', icon: TrendingUp },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabType)}
              className={`flex items-center px-6 py-4 font-medium transition-colors ${
                activeTab === id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {label}
            </button>
          ))}
      </div>

        <div className="p-6">
          {/* Buy/Sell Gold Tab */}
          {activeTab === 'gold' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            <button
                    onClick={() => {
                      setTradeType('buy');
                      setError(null);
                      setSuccess(null);
                    }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                      tradeType === 'buy'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
                    Buy Gold
            </button>
            <button
                    onClick={() => {
                      setTradeType('sell');
                      setError(null);
                      setSuccess(null);
                    }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                      tradeType === 'sell'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
                    Sell Gold
            </button>
          </div>

                {success ? (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start mb-4">
                      <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">
                          {tradeType === 'buy' ? 'Gold Purchased Successfully!' : 'Gold Sold Successfully!'}
                        </h3>
                        <div className="space-y-2 text-sm text-green-700 mb-4">
                          <p><strong>Gold Amount:</strong> {success.trade.formattedGoldAmount}</p>
                          <p><strong>Price:</strong> {success.trade.formattedGoldPrice}</p>
                          <p><strong>Total:</strong> {success.trade.formattedTotalAmount}</p>
                          {success.trade.profitLoss && (
                            <p><strong>Profit/Loss:</strong> {success.trade.formattedProfitLoss} ({success.trade.formattedProfitLossPercentage})</p>
                          )}
                          <p><strong>Trading Wallet:</strong> {success.wallet.tradingWallet.formattedBalanceAfter}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSuccess(null);
                          setGoldAmount('');
                          setGoldPrice('');
                          setBuyPrice('');
                          setBuyTradeId('');
                        }}
                        className="p-1 hover:bg-green-100 rounded"
                      >
                        <X className="w-4 h-4 text-green-600" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
          <div className="space-y-4">
            <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gold Amount (grams)
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          min="0.0001"
                          value={goldAmount}
                          onChange={(e) => {
                            setGoldAmount(e.target.value);
                            setError(null);
                          }}
                          placeholder="0.0000"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
            </div>

            <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Gold Price per gram (USD)
                          </label>
                          {currentGoldPrice && (
                            <label className="flex items-center text-sm">
                              <input
                                type="checkbox"
                                checked={useLivePrice}
                                onChange={(e) => {
                                  setUseLivePrice(e.target.checked);
                                  if (e.target.checked) {
                                    setGoldPrice(currentGoldPrice.price.toFixed(2));
                                  }
                                }}
                                className="mr-2 rounded"
                              />
                              <span className="text-gray-600">Use live price</span>
                            </label>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={goldPrice}
                            onChange={(e) => {
                              setGoldPrice(e.target.value);
                              setUseLivePrice(false);
                              setError(null);
                            }}
                            placeholder={currentGoldPrice ? currentGoldPrice.price.toFixed(2) : "0.00"}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {currentGoldPrice && useLivePrice && (
                            <button
                              onClick={() => setGoldPrice(currentGoldPrice.price.toFixed(2))}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            >
                              Update
                            </button>
                          )}
                        </div>
                        {currentGoldPrice && (
                          <p className="text-xs text-gray-500 mt-1">
                            Current live price: ${currentGoldPrice.price.toFixed(2)} per gram
                          </p>
                        )}
                      </div>

                      {tradeType === 'sell' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Buy Price per gram (USD) - Optional
                            </label>
              <input
                type="number"
                              step="0.01"
                              min="0.01"
                              value={buyPrice}
                              onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="0.00"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
                            <p className="text-xs text-gray-500 mt-1">For profit/loss calculation</p>
            </div>

            <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Buy Trade ID - Optional
                            </label>
              <input
                type="text"
                              value={buyTradeId}
                              onChange={(e) => setBuyTradeId(e.target.value)}
                              placeholder="Trade ID from buy transaction"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
                        </>
                      )}

                      {goldAmount && goldPrice && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-1">Estimated Total:</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(parseFloat(goldAmount || '0') * parseFloat(goldPrice || '0'))}
                          </p>
                        </div>
                      )}

                      {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-red-800">{error}</p>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={tradeType === 'buy' ? handleBuyGold : handleSellGold}
                        disabled={tradingLoading || !goldAmount || !goldPrice}
                        className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                          tradeType === 'buy'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {tradingLoading
                          ? 'Processing...'
                          : tradeType === 'buy'
                          ? 'Buy Gold'
                          : 'Sell Gold'}
            </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Holdings Tab */}
          {activeTab === 'holdings' && (
            <div>
              {historyLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading holdings...</p>
                </div>
              ) : holdingsData ? (
                <div className="space-y-6">
                  {/* Holdings Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl p-6 text-white">
                      <h3 className="text-sm font-medium opacity-90 mb-2">Current Holdings</h3>
                      <p className="text-3xl font-bold">{holdingsData.holdings.formattedCurrentHoldings}</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                      <h3 className="text-sm font-medium opacity-90 mb-2">Current Value</h3>
                      <p className="text-3xl font-bold">{holdingsData.holdings.formattedCurrentValue}</p>
                    </div>
                    <div className={`rounded-xl p-6 text-white ${
                      holdingsData.holdings.unrealizedProfitLoss >= 0
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : 'bg-gradient-to-r from-red-500 to-pink-600'
                    }`}>
                      <h3 className="text-sm font-medium opacity-90 mb-2">Unrealized P/L</h3>
                      <p className="text-3xl font-bold">
                        {holdingsData.holdings.formattedUnrealizedProfitLoss}
                      </p>
                      <p className="text-sm opacity-90 mt-1">
                        {holdingsData.holdings.formattedUnrealizedProfitLossPercentage}
                      </p>
                    </div>
                  </div>

                  {/* Holdings Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Holdings Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Gold Bought:</span>
                          <span className="font-semibold">{holdingsData.holdings.formattedTotalGoldBought}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Gold Sold:</span>
                          <span className="font-semibold">{holdingsData.holdings.formattedTotalGoldSold}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average Buy Price:</span>
                          <span className="font-semibold">{holdingsData.holdings.formattedAverageBuyPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Gold Price:</span>
                          <span className="font-semibold">{holdingsData.holdings.formattedCurrentGoldPrice}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t">
                          <span className="text-gray-600">Total Invested:</span>
                          <span className="font-semibold text-gray-900">{holdingsData.holdings.formattedTotalInvested}</span>
                        </div>
          </div>
        </div>

                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Buys</h3>
                      {holdingsData.recentBuys.length > 0 ? (
          <div className="space-y-3">
                          {holdingsData.recentBuys.map((buy) => (
                            <div key={buy.id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold">{buy.formattedGoldAmount}</span>
                                <span className="text-sm text-gray-600">{buy.formattedGoldPrice}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">{buy.formattedTotalAmount}</span>
                                <span className="text-gray-500">{formatDate(buy.createdAt)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No recent buys</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center py-12 text-gray-500">No holdings data available</p>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              {/* Filters */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trade Type</label>
                    <select
                      value={historyFilters.tradeType}
                      onChange={(e) => {
                        setHistoryFilters({ ...historyFilters, tradeType: e.target.value as any });
                        setHistoryPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All</option>
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={historyFilters.startDate}
                      onChange={(e) => {
                        setHistoryFilters({ ...historyFilters, startDate: e.target.value });
                        setHistoryPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={historyFilters.endDate}
                      onChange={(e) => {
                        setHistoryFilters({ ...historyFilters, endDate: e.target.value });
                        setHistoryPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setHistoryFilters({ tradeType: '', startDate: '', endDate: '' });
                        setHistoryPage(1);
                      }}
                      className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* History Table */}
              {historyLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading history...</p>
                </div>
              ) : historyData && historyData.trades.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gold Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">P/L</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {historyData.trades.map((trade) => (
                          <tr key={trade.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {trade.formattedDate || formatDate(trade.createdAt)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                trade.tradeType === 'buy'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {trade.tradeType.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{trade.formattedGoldAmount}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{trade.formattedGoldPrice}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">{trade.formattedTotalAmount}</td>
                            <td className="px-4 py-3 text-sm">
                              {trade.formattedProfitLoss && (
                                <span className={trade.profitLoss && trade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {trade.formattedProfitLoss}
                                  {trade.formattedProfitLossPercentage && ` (${trade.formattedProfitLossPercentage})`}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                {trade.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {historyData.pagination.pages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing page {historyData.pagination.current} of {historyData.pagination.pages}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setHistoryPage(Math.max(1, historyPage - 1))}
                          disabled={historyPage === 1}
                          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setHistoryPage(Math.min(historyData.pagination.pages, historyPage + 1))}
                          disabled={historyPage === historyData.pagination.pages}
                          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center py-12 text-gray-500">No trading history found</p>
              )}
            </div>
          )}

          {/* Profit/Loss Tab */}
          {activeTab === 'profit-loss' && (
            <div>
              {historyLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading profit/loss data...</p>
                </div>
              ) : profitLossData ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className={`rounded-xl p-6 text-white ${
                      profitLossData.summary.totalProfitLoss >= 0
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : 'bg-gradient-to-r from-red-500 to-pink-600'
                    }`}>
                      <h3 className="text-sm font-medium opacity-90 mb-2">Total Profit/Loss</h3>
                      <p className="text-3xl font-bold">{profitLossData.summary.formattedTotalProfitLoss}</p>
                      <p className="text-sm opacity-90 mt-1">{profitLossData.summary.formattedOverallProfitLossPercentage}</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                      <h3 className="text-sm font-medium opacity-90 mb-2">Total Invested</h3>
                      <p className="text-3xl font-bold">{profitLossData.summary.formattedTotalInvested}</p>
                    </div>
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 text-white">
                      <h3 className="text-sm font-medium opacity-90 mb-2">Remaining Gold</h3>
                      <p className="text-3xl font-bold">{profitLossData.summary.formattedRemainingGold}</p>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Trades:</span>
                          <span className="font-semibold">{profitLossData.statistics.totalTrades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Buy Trades:</span>
                          <span className="font-semibold">{profitLossData.statistics.totalBuyTrades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sell Trades:</span>
                          <span className="font-semibold">{profitLossData.statistics.totalSellTrades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Win Rate:</span>
                          <span className="font-semibold">{profitLossData.statistics.formattedWinRate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Profitable Trades:</span>
                          <span className="font-semibold text-green-600">{profitLossData.statistics.profitableTrades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Losing Trades:</span>
                          <span className="font-semibold text-red-600">{profitLossData.statistics.losingTrades}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t">
                          <span className="text-gray-600">Avg P/L per Trade:</span>
                          <span className="font-semibold">{profitLossData.statistics.formattedAvgProfitLossPerTrade}</span>
                  </div>
                </div>
              </div>

                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Gold Bought:</span>
                          <span className="font-semibold">{profitLossData.summary.formattedTotalGoldBought}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Gold Sold:</span>
                          <span className="font-semibold">{profitLossData.summary.formattedTotalGoldSold}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Received:</span>
                          <span className="font-semibold">{profitLossData.summary.formattedTotalReceived}</span>
                        </div>
          </div>
        </div>
      </div>

                  {/* Top Trades */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Profitable Trades</h3>
                      {profitLossData.topTrades.mostProfitable.length > 0 ? (
                        <div className="space-y-3">
                          {profitLossData.topTrades.mostProfitable.map((trade) => (
                            <div key={trade.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-green-900">{trade.formattedGoldAmount}</span>
                                <span className="text-sm font-semibold text-green-600">{trade.formattedProfitLoss}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Buy: {formatCurrency(trade.buyPrice)} | Sell: {formatCurrency(trade.sellPrice)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{formatDate(trade.createdAt)}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No profitable trades yet</p>
                      )}
                    </div>

                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Losing Trades</h3>
                      {profitLossData.topTrades.mostLosing.length > 0 ? (
                        <div className="space-y-3">
                          {profitLossData.topTrades.mostLosing.map((trade) => (
                            <div key={trade.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-red-900">{trade.formattedGoldAmount}</span>
                                <span className="text-sm font-semibold text-red-600">{trade.formattedProfitLoss}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Buy: {formatCurrency(trade.buyPrice)} | Sell: {formatCurrency(trade.sellPrice)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{formatDate(trade.createdAt)}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No losing trades</p>
                      )}
                    </div>
                </div>
                </div>
              ) : (
                <p className="text-center py-12 text-gray-500">No profit/loss data available</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trade;
