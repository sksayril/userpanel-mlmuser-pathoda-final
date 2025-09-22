import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, ArrowUpDown } from 'lucide-react';

const Trade: React.FC = () => {
  const [activeTab, setActiveTab] = useState('buy');

  const cryptoData = [
    { name: 'Bitcoin', symbol: 'BTC', price: '$43,250.00', change: '+5.2%', changeType: 'positive' },
    { name: 'Ethereum', symbol: 'ETH', price: '$2,680.50', change: '+3.8%', changeType: 'positive' },
    { name: 'Cardano', symbol: 'ADA', price: '$0.45', change: '-2.1%', changeType: 'negative' },
    { name: 'Solana', symbol: 'SOL', price: '$98.30', change: '+7.5%', changeType: 'positive' },
    { name: 'Polygon', symbol: 'MATIC', price: '$0.82', change: '-1.3%', changeType: 'negative' },
  ];

  const portfolioData = [
    { name: 'Bitcoin', symbol: 'BTC', amount: '0.5 BTC', value: '$21,625.00', allocation: '65%' },
    { name: 'Ethereum', symbol: 'ETH', amount: '5.2 ETH', value: '$13,938.60', allocation: '35%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Trade</h1>
        <p className="text-gray-600">Buy, sell, and manage your crypto portfolio.</p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Portfolio Value</h3>
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold mb-2">$35,563.60</p>
          <p className="text-green-100">+$2,431.50 (7.3%)</p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">24h Change</h3>
            <BarChart3 className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold mb-2">+4.8%</p>
          <p className="text-blue-100">Above average</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Assets</h3>
            <ArrowUpDown className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold mb-2">7</p>
          <p className="text-orange-100">Different currencies</p>
        </div>
      </div>

      {/* Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Buy/Sell Form */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'buy'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'sell'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sell
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Crypto</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Bitcoin (BTC)</option>
                <option>Ethereum (ETH)</option>
                <option>Cardano (ADA)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USD)</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Crypto</label>
              <input
                type="text"
                placeholder="0.00 BTC"
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>

            <button className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
              activeTab === 'buy'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}>
              {activeTab === 'buy' ? 'Buy Crypto' : 'Sell Crypto'}
            </button>
          </div>
        </div>

        {/* Market Prices */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Market Prices</h2>
          <div className="space-y-3">
            {cryptoData.map((crypto, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {crypto.symbol.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{crypto.name}</h3>
                    <p className="text-gray-500 text-sm">{crypto.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{crypto.price}</p>
                  <div className="flex items-center space-x-1">
                    {crypto.changeType === 'positive' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      crypto.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {crypto.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Holdings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Portfolio</h2>
        <div className="space-y-4">
          {portfolioData.map((asset, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {asset.symbol.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                  <p className="text-gray-600 text-sm">{asset.amount}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{asset.value}</p>
                <p className="text-gray-500 text-sm">{asset.allocation} of portfolio</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trade;