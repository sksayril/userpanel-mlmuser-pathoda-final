import React, { useState, useEffect } from 'react';
import { 
  Link, 
  Copy, 
  Share2, 
  QrCode, 
  Check, 
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Download,
  User
} from 'lucide-react';
import { apiService } from '../services/api';
import { ReferralLinkResponse, AdminStatusResponse } from '../types/api';

interface ReferralLinkCardProps {
  className?: string;
}

const ReferralLinkCard: React.FC<ReferralLinkCardProps> = ({ className = '' }) => {
  const [referralData, setReferralData] = useState<ReferralLinkResponse | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const loadReferralLink = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [referralData, adminStatusData] = await Promise.allSettled([
        apiService.getReferralLink(),
        apiService.getAdminStatus()
      ]);
      
      // Handle referral data
      if (referralData.status === 'fulfilled') {
        setReferralData(referralData.value);
      } else {
        console.error('Failed to load referral link:', referralData.reason);
      }
      
      // Handle admin status data
      if (adminStatusData.status === 'fulfilled') {
        setAdminStatus(adminStatusData.value);
      } else {
        console.error('Failed to load admin status:', adminStatusData.reason);
        // Don't set error for admin status failure, just log it
      }
      
      // Only set error if both requests failed
      if (referralData.status === 'rejected' && adminStatusData.status === 'rejected') {
        setError('Failed to load referral data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferralLink();
  }, []);

  const handleCopyLink = async () => {
    if (!referralData?.referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleCopyShareableText = async () => {
    if (!referralData?.shareableText) return;
    
    try {
      await navigator.clipboard.writeText(referralData.shareableText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleShare = async () => {
    if (!referralData?.referralLink) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on this amazing platform!',
          text: referralData.shareableText,
          url: referralData.referralLink,
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    } else {
      // Fallback to copying the link
      handleCopyLink();
    }
  };

  const handleDownloadQR = () => {
    if (!referralData?.qrCodeData) return;
    
    const link = document.createElement('a');
    link.href = referralData.qrCodeData;
    link.download = 'referral-qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading referral link...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Referral Link</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadReferralLink}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!referralData) {
    return null;
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Link className="w-5 h-5 text-blue-600" />
            Your Referral Link
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Share this link to earn commissions from referrals
          </p>
        </div>
        <button
          onClick={loadReferralLink}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Admin Status and Referral Codes */}
      {adminStatus && adminStatus.user ? (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200 mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Your Referral Codes
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User Referral Code */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">Your Referral Code</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  adminStatus.isAssignedToAdmin ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {adminStatus.isAssignedToAdmin ? 'Active' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                  {adminStatus.user.referralCode}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(adminStatus.user.referralCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy user referral code"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Admin Referral Code */}
            {adminStatus.adminDetails && (
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Admin Referral Code</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {adminStatus.adminDetails.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                    {adminStatus.adminDetails.referralCode}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(adminStatus.adminDetails.referralCode);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy admin referral code"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Admin Assignment Status */}
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700">Admin Assignment:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  adminStatus.isAssignedToAdmin 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {adminStatus.isAssignedToAdmin ? 'Assigned' : 'Not Assigned'}
                </span>
              </div>
              {adminStatus.needsFix && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                  Needs Fix
                </span>
              )}
            </div>
            {adminStatus.adminDetails && (
              <p className="text-xs text-gray-600 mt-1">
                Assigned to: {adminStatus.adminDetails.name} ({adminStatus.adminDetails.email})
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-6">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Admin Status Unavailable</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Unable to load admin assignment information. Your referral link will still work, but admin details are not available.
          </p>
        </div>
      )}

      {/* Referral Link */}
      <div className="space-y-4">
        {/* Link Display */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Referral Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={referralData.referralLink}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono"
            />
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                copied
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <a
              href={referralData.referralLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Shareable Text */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shareable Text
          </label>
          <div className="flex items-start gap-2">
            <textarea
              value={referralData.shareableText}
              readOnly
              rows={3}
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm resize-none"
            />
            <button
              onClick={handleCopyShareableText}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                copied
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
          >
            <Share2 className="w-4 h-4" />
            Share Link
          </button>
          
          <button
            onClick={() => setShowQR(!showQR)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <QrCode className="w-4 h-4" />
            {showQR ? 'Hide' : 'Show'} QR Code
          </button>
        </div>

        {/* QR Code Display */}
        {showQR && referralData.qrCodeData && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
            <h4 className="text-sm font-medium text-gray-700 mb-3">QR Code</h4>
            <div className="inline-block p-4 bg-white rounded-lg border border-gray-200">
              <img
                src={referralData.qrCodeData}
                alt="Referral QR Code"
                className="w-32 h-32 mx-auto"
              />
            </div>
            <div className="mt-3">
              <button
                onClick={handleDownloadQR}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium mx-auto"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Sharing Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Share your link on social media platforms</li>
            <li>• Send it to friends and family via messaging apps</li>
            <li>• Include it in your email signature</li>
            <li>• Use the QR code for offline sharing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReferralLinkCard;
