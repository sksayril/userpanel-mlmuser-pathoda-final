// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  referralCode: string;
  role: 'user' | 'admin';
  wallets: {
    mainWallet: number;
    benefitWallet: number;
    withdrawalWallet: number;
    tradingWallet?: number;
  };
  totalReferrals?: number;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
  adminReferralCode?: string;
}

export interface SignupResponse {
  user: User;
  token: string;
}

export interface ValidateReferralRequest {
  referralCode: string;
  type: 'user' | 'admin';
}

export interface ValidateReferralResponse {
  referrer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    referralCode: string;
    role: string;
  };
}

// Error Types
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Token Management
export interface TokenData {
  token: string;
  user: User;
  expiresAt?: number;
}

// Deposit Request Types
export interface DepositRequest {
  amount: number;
  transactionId: string;
  paymentScreenshot: string;
  paymentMethod?: 'bank_transfer' | 'mobile_payment' | 'crypto' | 'other';
  notes?: string;
}

export interface DepositRequestResponse {
  depositRequest: {
    id: string;
    amount: number;
    formattedAmount: string;
    transactionId: string;
    paymentMethod: string;
    status: 'pending' | 'approved' | 'rejected';
    walletUpdates: {
      mainWalletAmount: number;
      benefitWalletAmount: number;
      totalAmount: number;
      formatted: {
        mainWallet: string;
        benefitWallet: string;
        total: string;
      };
    };
    createdAt: string;
    formattedDate: string;
  };
}

// Deposit Request History Types
export interface DepositRequestHistoryItem {
  id: string;
  amount: number;
  formattedAmount: string;
  transactionId: string;
  paymentMethod: string;
  paymentScreenshot: string;
  status: 'pending' | 'approved' | 'rejected';
  admin?: {
    name: string;
    email: string;
  };
  approvedBy?: {
    name: string;
    email: string;
  };
  approvedAt?: string;
  rejectionReason?: string | null;
  walletUpdates: {
    mainWalletAmount: number;
    benefitWalletAmount: number;
    totalAmount: number;
    formatted: {
      mainWallet: string;
      benefitWallet: string;
      total: string;
    };
  };
  notes?: string;
  createdAt: string;
  formattedDate: string;
}

export interface DepositRequestHistoryResponse {
  depositRequests: DepositRequestHistoryItem[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface DepositRequestHistoryParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected';
}

// MLM Commission Types
export interface CommissionStructure {
  level: number;
  percentage: number;
  formattedPercentage: string;
}

export interface CommissionStructureResponse {
  commissionStructure: CommissionStructure[];
  totalLevels: number;
  description: string;
}

export interface CommissionByLevel {
  level: number;
  count: number;
  totalAmount: number;
}

export interface RecentCommission {
  id: string;
  level: number;
  commissionAmount: number;
  fromUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  deposit: {
    amount: number;
    transactionId: string;
  };
  createdAt: string;
}

export interface NetworkStats {
  totalDownline: number;
  activeDownline: number;
  totalDeposits: number;
  lastActivity: string;
}

export interface CommissionSummaryResponse {
  totalCommissionsEarned: number;
  totalCommissionsCount: number;
  commissionsByLevel: CommissionByLevel[];
  recentCommissions: RecentCommission[];
  networkStats: NetworkStats;
  monthlyEarnings: number;
}

export interface CommissionHistoryItem {
  id: string;
  level: number;
  commissionAmount: number;
  formattedCommissionAmount: string;
  commissionPercentage: number;
  depositAmount: number;
  formattedDepositAmount: string;
  status: 'pending' | 'paid' | 'cancelled';
  paidAt?: string;
  description: string;
  fromUser: {
    id: string;
    name: string;
    email: string;
    referralCode: string;
  };
  deposit: {
    id: string;
    amount: number;
    transactionId: string;
  };
  createdAt: string;
  formattedDate: string;
}

export interface CommissionHistoryResponse {
  commissions: CommissionHistoryItem[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface CommissionHistoryParams {
  page?: number;
  limit?: number;
  level?: number;
  status?: 'pending' | 'paid' | 'cancelled';
}

export interface DownlineUser {
  level: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  referralCode: string;
  totalReferrals: number;
  totalCommissionsEarned: number;
  joinedAt: string;
}

export interface DownlineLevel {
  level: number;
  userCount: number;
  totalCommissions: number;
  totalReferrals: number;
  users: DownlineUser[];
}

export interface DownlineReportResponse {
  summary: {
    totalUsers: number;
    totalCommissions: number;
    totalReferrals: number;
    maxLevel: number;
  };
  byLevel: DownlineLevel[];
  allUsers: DownlineUser[];
}

export interface NetworkTreeNode {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  referralCode: string;
  totalReferrals: number;
  totalCommissionsEarned: number;
  level: number;
  joinedAt: string;
  children: NetworkTreeNode[];
}

export interface NetworkTreeResponse {
  networkTree: NetworkTreeNode;
  maxDepth: number;
}

export interface ReferralHierarchyItem {
  level: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  referralCode: string;
  totalReferrals: number;
  totalCommissionsEarned: number;
}

export interface ReferralHierarchyResponse {
  hierarchy: ReferralHierarchyItem[];
  currentUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    referralCode: string;
    referralLevel: number;
  };
}

export interface DownlineUsersResponse {
  downlineUsers: DownlineUser[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  summary: {
    totalUsers: number;
    totalCommissions: number;
    totalReferrals: number;
  };
}

export interface DownlineUsersParams {
  maxLevel?: number;
  page?: number;
  limit?: number;
}

// Dashboard Types
export interface DashboardUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  referralCode: string;
  role: 'user' | 'admin';
  isActive: boolean;
  isVerified: boolean;
  joinDate: string;
  formattedJoinDate: string;
}

export interface WalletBalance {
  amount: number;
  formatted: string;
}

export interface DashboardWallets {
  mainWallet: WalletBalance;
  benefitWallet: WalletBalance;
  withdrawalWallet: WalletBalance;
  tradingWallet?: WalletBalance;
  totalBalance: WalletBalance;
}

export interface NetworkStats {
  totalDownline: number;
  activeDownline: number;
  totalDeposits: number;
  lastActivity: string;
}

export interface DashboardStatistics {
  totalEarnings: number;
  totalWithdrawals: number;
  totalReferrals: number;
  totalCommissions: number;
  monthlyEarnings: number;
  networkStats: NetworkStats;
}

export interface ChartDataPoint {
  month?: string;
  monthNumber?: number;
  year?: number;
  date?: string;
  fullDate?: string;
  earnings: number;
  formattedEarnings: string;
  commissionCount?: number;
  transactionCount?: number;
  count?: number;
}

export interface WalletDistribution {
  mainWallet: number;
  benefitWallet: number;
  withdrawalWallet: number;
}

export interface EarningsByType {
  referral_bonus: number;
  admin_referral_bonus: number;
  deposit_approval: number;
  deposit_bonus: number;
  credit: number;
}

export interface DashboardCharts {
  monthlyEarnings: ChartDataPoint[];
  dailyEarnings: ChartDataPoint[];
  walletDistribution: WalletDistribution;
  earningsByType: EarningsByType;
  transactionTrends: ChartDataPoint[];
}

export interface TransactionUser {
  name: string;
}

export interface DashboardTransaction {
  id: string;
  walletType: 'mainWallet' | 'benefitWallet' | 'withdrawalWallet';
  transactionType: string;
  amount: number;
  formattedAmount: string;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  fromUser: TransactionUser | null;
  toUser: TransactionUser | null;
  createdAt: string;
  formattedDate: string;
}

export interface DashboardCommission {
  id: string;
  level: number;
  commissionAmount: number;
  fromUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  deposit: {
    amount: number;
    transactionId: string;
  };
  createdAt: string;
}

export interface DashboardReferral {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  referralCode: string;
  totalReferrals: number;
  totalCommissionsEarned: number;
  createdAt: string;
}

export interface RecentActivity {
  transactions: DashboardTransaction[];
  commissions: DashboardCommission[];
  referrals: DashboardReferral[];
}

export interface ReferralStats {
  totalDirectReferrals: number;
  activeReferrals: number;
  totalEarningsFromReferrals: number;
  recentReferrals: Array<{
    name: string;
    email: string;
    joinDate: string;
    earnings: number;
    referrals: number;
  }>;
}

export interface DepositStats {
  totalDeposits: number;
  totalAmount: number;
  approvedDeposits: number;
  pendingDeposits: number;
  rejectedDeposits: number;
  averageDepositAmount: number;
  recentDeposits: Array<{
    id: string;
    amount: number;
    formattedAmount: string;
    status: 'approved' | 'pending' | 'rejected';
    createdAt: string;
    formattedDate: string;
  }>;
}

export interface DownlineStats {
  totalUsers: number;
  totalCommissions: number;
  totalReferrals: number;
  byLevel: Array<{
    level: number;
    userCount: number;
    totalCommissions: number;
    totalReferrals: number;
    users: Array<{
      level: number;
      userId: string;
      firstName: string;
      lastName: string;
      email: string;
      referralCode: string;
      totalReferrals: number;
      totalCommissionsEarned: number;
      joinedAt: string;
    }>;
  }>;
}

export interface Performance {
  referralStats: ReferralStats;
  depositStats: DepositStats;
  downlineStats: DownlineStats;
}

export interface DashboardResponse {
  user: DashboardUser;
  wallets: DashboardWallets;
  statistics: DashboardStatistics;
  charts: DashboardCharts;
  recentActivity: RecentActivity;
  performance: Performance;
}

// Referral Link API Types
export interface ReferralLinkResponse {
  referralLink: string;
  shareableText: string;
  qrCodeData: string;
}

export interface ReferralLinkApiResponse {
  success: boolean;
  data: ReferralLinkResponse;
}

// Admin Status API Types
export interface AdminStatusUser {
  id: string;
  name: string;
  email: string;
  referralCode: string;
}

export interface AdminStatusAdminDetails {
  id: string;
  name: string;
  email: string;
  referralCode: string;
}

export interface AdminStatusCreatedBy {
  id: string;
  name: string;
  email: string;
  referralCode: string;
}

export interface AdminStatusAdminRecord {
  id: string;
  createdBy: AdminStatusCreatedBy;
}

export interface AdminStatusResponse {
  user: AdminStatusUser;
  adminId: string;
  adminDetails: AdminStatusAdminDetails;
  adminRecord: AdminStatusAdminRecord;
  isAssignedToAdmin: boolean;
  needsFix: boolean;
}

export interface AdminStatusApiResponse {
  success: boolean;
  message: string;
  data: AdminStatusResponse;
}

// MLM Chain Types
export interface ChainUser {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  referralCode: string;
  referralLevel?: number;
  level?: number;
  position?: string;
  totalReferrals: number;
  totalCommissionsEarned: number;
  directReferralsCount?: number;
  wallets?: {
    mainWallet: number;
    benefitWallet: number;
    withdrawalWallet: number;
  };
  joinedAt: string;
  referredBy?: string;
  children?: ChainUser[];
  childrenCount?: number;
}

export interface ChainDownlineUser extends ChainUser {
  level: number;
}

export interface UsersByLevel {
  [key: string]: {
    level: number;
    count: number;
    totalCommissions: number;
    totalReferrals: number;
  };
}

export interface DownlineStatistics {
  totalDownlineUsers: number;
  directReferrals: number;
  totalDownlineCommissions: number;
  totalDownlineReferrals: number;
  usersByLevel: UsersByLevel;
}

export interface DownlineTree {
  tree: ChainUser[];
  flatList: ChainDownlineUser[];
  statistics: DownlineStatistics;
}

export interface UplineUser {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  referralCode: string;
  level: number;
  position: string;
  totalReferrals: number;
  totalCommissionsEarned: number;
}

export interface ChainInfo {
  maxLevel: number;
  totalLevels: number;
  hasUpline: boolean;
  hasDownline: boolean;
}

export interface MlmChainResponse {
  currentUser: ChainUser;
  upline: UplineUser[];
  downline: DownlineTree;
  chainInfo: ChainInfo;
}

export interface MlmChainParams {
  referralCode?: string;
  maxLevel?: number;
}

// Wallet Transfer Types
export interface WalletBalanceWithChange extends WalletBalance {
  change?: number;
  formattedChange?: string;
}

export interface TransferToTradingRequest {
  amount: number;
}

export interface TransferToTradingWallets {
  mainWallet: WalletBalanceWithChange;
  tradingWallet: WalletBalanceWithChange;
  benefitWallet: WalletBalanceWithChange;
  withdrawalWallet: WalletBalance;
}

export interface TransferDetails {
  transferredAmount: number;
  formattedTransferredAmount: string;
  benefitDeduction: number;
  formattedBenefitDeduction: string;
  deductionMultiplier: number;
}

export interface TransferToTradingResponse {
  wallets: TransferToTradingWallets;
  transferDetails: TransferDetails;
}

export interface TransferToTradingError {
  required?: number;
  available?: number;
  shortfall?: number;
}

// Gold Trading Types
export interface BuyGoldRequest {
  goldAmount: number;
  goldPrice: number;
}

export interface SellGoldRequest {
  goldAmount: number;
  goldPrice: number;
  buyPrice?: number;
  buyTradeId?: string;
}

export interface GoldTrade {
  id: string;
  tradeType: 'buy' | 'sell';
  goldAmount: number;
  formattedGoldAmount: string;
  goldPrice: number;
  formattedGoldPrice: string;
  totalAmount: number;
  formattedTotalAmount: string;
  buyPrice?: number;
  formattedBuyPrice?: string;
  profitLoss?: number;
  formattedProfitLoss?: string;
  profitLossPercentage?: number;
  formattedProfitLossPercentage?: string;
  tradingWalletBalanceBefore?: number;
  tradingWalletBalanceAfter?: number;
  formattedTradingWalletBalance?: string;
  status: string;
  description?: string;
  createdAt: string;
  formattedDate?: string;
}

export interface WalletChange {
  balanceBefore: number;
  formattedBalanceBefore: string;
  balanceAfter: number;
  formattedBalanceAfter: string;
  change: number;
  formattedChange: string;
}

export interface BuyGoldResponse {
  trade: GoldTrade;
  wallet: {
    tradingWallet: WalletChange;
  };
}

export interface SellGoldResponse {
  trade: GoldTrade;
  wallet: {
    tradingWallet: WalletChange;
  };
}

export interface GoldTradingHistoryParams {
  page?: number;
  limit?: number;
  tradeType?: 'buy' | 'sell';
  startDate?: string;
  endDate?: string;
}

export interface GoldTradingHistoryItem extends GoldTrade {
  tradingWalletBalanceBefore: number;
  tradingWalletBalanceAfter: number;
}

export interface GoldTradingHistoryResponse {
  trades: GoldTradingHistoryItem[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface TopTrade {
  id: string;
  goldAmount: number;
  formattedGoldAmount: string;
  buyPrice: number;
  sellPrice: number;
  profitLoss: number;
  formattedProfitLoss: string;
  profitLossPercentage: number;
  formattedProfitLossPercentage: string;
  createdAt: string;
}

export interface MonthlyProfitLoss {
  month: string;
  monthName: string;
  totalProfitLoss: number;
  formattedTotalProfitLoss: string;
  tradeCount: number;
  totalGoldSold: number;
  formattedTotalGoldSold: string;
}

export interface ProfitLossSummary {
  totalProfitLoss: number;
  formattedTotalProfitLoss: string;
  overallProfitLossPercentage: number;
  formattedOverallProfitLossPercentage: string;
  totalGoldBought: number;
  formattedTotalGoldBought: string;
  totalGoldSold: number;
  formattedTotalGoldSold: string;
  totalInvested: number;
  formattedTotalInvested: string;
  totalReceived: number;
  formattedTotalReceived: string;
  remainingGold: number;
  formattedRemainingGold: string;
}

export interface ProfitLossStatistics {
  totalTrades: number;
  totalBuyTrades: number;
  totalSellTrades: number;
  profitableTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  winRate: number;
  formattedWinRate: string;
  avgProfitLossPerTrade: number;
  formattedAvgProfitLossPerTrade: string;
}

export interface ProfitLossSummaryResponse {
  summary: ProfitLossSummary;
  statistics: ProfitLossStatistics;
  topTrades: {
    mostProfitable: TopTrade[];
    mostLosing: TopTrade[];
  };
  monthlyBreakdown: MonthlyProfitLoss[];
}

export interface GoldHoldings {
  totalGoldBought: number;
  formattedTotalGoldBought: string;
  totalGoldSold: number;
  formattedTotalGoldSold: string;
  currentHoldings: number;
  formattedCurrentHoldings: string;
  averageBuyPrice: number;
  formattedAverageBuyPrice: string;
  currentGoldPrice: number;
  formattedCurrentGoldPrice: string;
  totalInvested: number;
  formattedTotalInvested: string;
  currentValue: number;
  formattedCurrentValue: string;
  unrealizedProfitLoss: number;
  formattedUnrealizedProfitLoss: string;
  unrealizedProfitLossPercentage: number;
  formattedUnrealizedProfitLossPercentage: string;
}

export interface RecentBuy {
  id: string;
  goldAmount: number;
  formattedGoldAmount: string;
  goldPrice: number;
  formattedGoldPrice: string;
  totalAmount: number;
  formattedTotalAmount: string;
  createdAt: string;
}

export interface GoldHoldingsResponse {
  holdings: GoldHoldings;
  recentBuys: RecentBuy[];
}

export interface GoldTradingError {
  required?: number;
  formattedRequired?: string;
  available?: number;
  formattedAvailable?: string;
  shortfall?: number;
  formattedShortfall?: string;
}

// Live Gold Price Types
export interface CurrentGoldPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  lastUpdate: string;
  source: string;
}

export interface CurrentGoldPriceResponse {
  success: boolean;
  data: CurrentGoldPrice;
  cached: boolean;
}