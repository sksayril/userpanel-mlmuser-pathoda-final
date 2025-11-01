import React, { useState } from 'react';
import { ArrowRight, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { apiService } from '../services/api';
import { TransferToTradingResponse, TransferToTradingError } from '../types/api';

interface TransferToTradingProps {
  mainWalletBalance: number;
  benefitWalletBalance: number;
  tradingWalletBalance?: number;
  onTransferSuccess?: (response: TransferToTradingResponse) => void;
  onClose?: () => void;
}

const TransferToTrading: React.FC<TransferToTradingProps> = ({
  mainWalletBalance,
  benefitWalletBalance,
  tradingWalletBalance = 0,
  onTransferSuccess,
  onClose,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<TransferToTradingError | null>(null);
  const [success, setSuccess] = useState<TransferToTradingResponse | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError(null);
      setErrorDetails(null);
      setSuccess(null);
    }
  };

  const calculateRequiredBenefit = (transferAmount: number) => {
    return transferAmount * 2;
  };

  const handleQuickFill = (percentage: number) => {
    const maxAmount = mainWalletBalance * (percentage / 100);
    setAmount(maxAmount.toFixed(2));
    setError(null);
    setErrorDetails(null);
    setSuccess(null);
  };

  const validateAmount = (transferAmount: number): string | null => {
    if (transferAmount <= 0) {
      return 'Amount must be greater than 0';
    }
    if (transferAmount > mainWalletBalance) {
      return 'Insufficient balance in main wallet';
    }
    const requiredBenefit = calculateRequiredBenefit(transferAmount);
    if (requiredBenefit > benefitWalletBalance) {
      return 'Insufficient balance in benefit wallet';
    }
    return null;
  };

  const handleTransfer = async () => {
    const transferAmount = parseFloat(amount);
    
    // Validation
    const validationError = validateAmount(transferAmount);
    if (validationError) {
      setError(validationError);
      const requiredBenefit = calculateRequiredBenefit(transferAmount);
      if (requiredBenefit > benefitWalletBalance) {
        setErrorDetails({
          required: requiredBenefit,
          available: benefitWalletBalance,
          shortfall: requiredBenefit - benefitWalletBalance,
        });
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setErrorDetails(null);
      setSuccess(null);

      const response = await apiService.transferToTradingWallet({
        amount: transferAmount,
      });

      setSuccess(response);
      setAmount('');
      
      if (onTransferSuccess) {
        onTransferSuccess(response);
      }
    } catch (err: any) {
      console.error('Transfer error:', err);
      
      // Extract error message from API response
      let errorMessage = 'Failed to transfer funds';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.message) {
        errorMessage = err.response.message;
      }
      
      // Extract error details if available
      if (err.response?.data?.data) {
        setErrorDetails(err.response.data.data);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const transferAmount = parseFloat(amount) || 0;
  const requiredBenefit = calculateRequiredBenefit(transferAmount);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Transfer to Trading Wallet</h2>
          <p className="text-sm text-gray-600 mt-1">
            Transfer funds from main wallet to trading wallet
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Info Alert */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Transfer Rules:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Amount will be deducted from <strong>Main Wallet</strong></li>
              <li>Same amount will be added to <strong>Trading Wallet</strong></li>
              <li><strong>2x the amount</strong> will be deducted from <strong>Benefit Wallet</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Wallet Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Main Wallet</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(mainWalletBalance)}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Benefit Wallet</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(benefitWalletBalance)}
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600 mb-1">Trading Wallet</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(tradingWalletBalance)}
          </p>
        </div>
      </div>

      {/* Transfer Form */}
      {!success ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transfer Amount (USD)
            </label>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            {transferAmount > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  Main Wallet: {formatCurrency(mainWalletBalance - transferAmount)} 
                  <span className="text-red-600 ml-2">(-{formatCurrency(transferAmount)})</span>
                </p>
                <p>
                  Benefit Wallet: {formatCurrency(benefitWalletBalance - requiredBenefit)}
                  <span className="text-red-600 ml-2">(-{formatCurrency(requiredBenefit)})</span>
                </p>
                <p>
                  Trading Wallet: {formatCurrency(tradingWalletBalance + transferAmount)}
                  <span className="text-green-600 ml-2">(+{formatCurrency(transferAmount)})</span>
                </p>
              </div>
            )}
          </div>

          {/* Quick Fill Buttons */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Quick Fill:</p>
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((percentage) => (
                <button
                  key={percentage}
                  onClick={() => handleQuickFill(percentage)}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {percentage}%
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                  {errorDetails && errorDetails.required && (
                    <div className="mt-2 text-sm text-red-700">
                      <p>Required: {formatCurrency(errorDetails.required)}</p>
                      <p>Available: {formatCurrency(errorDetails.available || 0)}</p>
                      {errorDetails.shortfall && (
                        <p>Shortfall: {formatCurrency(errorDetails.shortfall)}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Transfer Button */}
          <button
            onClick={handleTransfer}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                Transfer to Trading Wallet
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </>
      ) : (
        /* Success Message */
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Transfer Successful!
              </h3>
              <p className="text-sm text-green-700 mb-4">
                Transfer to trading wallet completed successfully. 2x amount deducted from benefit wallet.
              </p>
            </div>
          </div>

          {/* Updated Balances */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-sm text-gray-600">Main Wallet</span>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{success.wallets.mainWallet.formatted}</p>
                {success.wallets.mainWallet.formattedChange && (
                  <p className="text-sm text-red-600">{success.wallets.mainWallet.formattedChange}</p>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-sm text-gray-600">Trading Wallet</span>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{success.wallets.tradingWallet.formatted}</p>
                {success.wallets.tradingWallet.formattedChange && (
                  <p className="text-sm text-green-600">{success.wallets.tradingWallet.formattedChange}</p>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-sm text-gray-600">Benefit Wallet</span>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{success.wallets.benefitWallet.formatted}</p>
                {success.wallets.benefitWallet.formattedChange && (
                  <p className="text-sm text-red-600">{success.wallets.benefitWallet.formattedChange}</p>
                )}
              </div>
            </div>
          </div>

          {/* Transfer Details */}
          <div className="p-4 bg-white rounded-lg mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Transfer Details:</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Transferred Amount:</span>
                <span className="font-semibold text-gray-900">
                  {success.transferDetails.formattedTransferredAmount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Benefit Deduction ({success.transferDetails.deductionMultiplier}x):</span>
                <span className="font-semibold text-red-600">
                  {success.transferDetails.formattedBenefitDeduction}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setSuccess(null);
              setAmount('');
              if (onClose) onClose();
            }}
            className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default TransferToTrading;

