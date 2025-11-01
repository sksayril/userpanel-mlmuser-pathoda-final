import { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  SignupRequest, 
  SignupResponse, 
  ValidateReferralRequest, 
  ValidateReferralResponse,
  DepositRequest,
  DepositRequestResponse,
  DepositRequestHistoryResponse,
  DepositRequestHistoryParams,
  TokenData,
  User,
  CommissionStructureResponse,
  CommissionSummaryResponse,
  CommissionHistoryResponse,
  CommissionHistoryParams,
  DownlineReportResponse,
  NetworkTreeResponse,
  ReferralHierarchyResponse,
  DownlineUsersResponse,
  DownlineUsersParams,
  DashboardResponse,
  ReferralLinkResponse,
  AdminStatusResponse,
  MlmChainResponse,
  MlmChainParams,
  TransferToTradingRequest,
  TransferToTradingResponse,
  BuyGoldRequest,
  BuyGoldResponse,
  SellGoldRequest,
  SellGoldResponse,
  GoldTradingHistoryParams,
  GoldTradingHistoryResponse,
  ProfitLossSummaryResponse,
  GoldHoldingsResponse,
  CurrentGoldPriceResponse
} from '../types/api';

import { API_CONFIG } from '../config/api';

// API Configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

// Token Management
const TOKEN_KEY = 'mlm_user_token';
const USER_KEY = 'mlm_user_data';

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Token Management Methods
  private getToken(): string | null {
    try {
      const tokenData = localStorage.getItem(TOKEN_KEY);
      if (tokenData) {
        const parsed: TokenData = JSON.parse(tokenData);
        // Check if token is expired
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          this.clearToken();
          return null;
        }
        return parsed.token;
      }
      return null;
    } catch (error) {
      console.error('Error getting token:', error);
      this.clearToken();
      return null;
    }
  }

  private setToken(tokenData: TokenData): void {
    try {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
      localStorage.setItem(USER_KEY, JSON.stringify(tokenData.user));
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  private clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  public getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  public isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  public logout(): void {
    this.clearToken();
  }

  // HTTP Request Methods
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Authentication failed. Please login again.');
        }
        // Create error with response data attached
        const error: any = new Error(data.message || `HTTP error! status: ${response.status}`);
        error.response = {
          status: response.status,
          data: data,
          message: data.message,
        };
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication API Methods
  public async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      // Store token and user data
      const tokenData: TokenData = {
        token: response.data.token,
        user: response.data.user,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };
      this.setToken(tokenData);
    }

    return response.data!;
  }

  public async signup(userData: SignupRequest): Promise<SignupResponse> {
    const response = await this.request<SignupResponse>('/users/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      // Store token and user data
      const tokenData: TokenData = {
        token: response.data.token,
        user: response.data.user,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };
      this.setToken(tokenData);
    }

    return response.data!;
  }

  public async validateReferralCode(
    referralData: ValidateReferralRequest
  ): Promise<ValidateReferralResponse> {
    const response = await this.request<ValidateReferralResponse>(
      '/users/validate-referral',
      {
        method: 'POST',
        body: JSON.stringify(referralData),
      }
    );

    return response.data!;
  }

  public async submitDepositRequest(
    depositData: DepositRequest
  ): Promise<DepositRequestResponse> {
    const response = await this.request<DepositRequestResponse>(
      '/users/deposit/request',
      {
        method: 'POST',
        body: JSON.stringify(depositData),
      }
    );

    return response.data!;
  }

  public async getDepositRequests(
    params: DepositRequestHistoryParams = {}
  ): Promise<DepositRequestHistoryResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);

    const endpoint = `/users/deposit/requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await this.request<DepositRequestHistoryResponse>(
      endpoint,
      {
        method: 'GET',
      }
    );

    return response.data!;
  }

  // MLM Commission API Methods
  public async getCommissionStructure(): Promise<CommissionStructureResponse> {
    const response = await this.request<CommissionStructureResponse>(
      '/users/mlm/commission-structure',
      {
        method: 'GET',
      }
    );

    return response.data!;
  }

  public async getCommissionSummary(): Promise<CommissionSummaryResponse> {
    const response = await this.request<CommissionSummaryResponse>(
      '/users/mlm/commission-summary',
      {
        method: 'GET',
      }
    );

    return response.data!;
  }

  public async getCommissionHistory(
    params: CommissionHistoryParams = {}
  ): Promise<CommissionHistoryResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.level) queryParams.append('level', params.level.toString());
    if (params.status) queryParams.append('status', params.status);

    const endpoint = `/users/mlm/commissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await this.request<CommissionHistoryResponse>(
      endpoint,
      {
        method: 'GET',
      }
    );

    return response.data!;
  }

  public async getDownlineReport(
    maxLevel?: number
  ): Promise<DownlineReportResponse> {
    const queryParams = new URLSearchParams();
    
    if (maxLevel) queryParams.append('maxLevel', maxLevel.toString());

    const endpoint = `/users/mlm/downline-report${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await this.request<DownlineReportResponse>(
      endpoint,
      {
        method: 'GET',
      }
    );

    return response.data!;
  }

  public async getNetworkTree(
    maxDepth?: number
  ): Promise<NetworkTreeResponse> {
    const queryParams = new URLSearchParams();
    
    if (maxDepth) queryParams.append('maxDepth', maxDepth.toString());

    const endpoint = `/users/mlm/network-tree${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await this.request<NetworkTreeResponse>(
      endpoint,
      {
        method: 'GET',
      }
    );

    return response.data!;
  }

  public async getReferralHierarchy(): Promise<ReferralHierarchyResponse> {
    const response = await this.request<ReferralHierarchyResponse>(
      '/users/mlm/referral-hierarchy',
      {
        method: 'GET',
      }
    );

    return response.data!;
  }

  public async getDownlineUsers(
    params: DownlineUsersParams = {}
  ): Promise<DownlineUsersResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.maxLevel) queryParams.append('maxLevel', params.maxLevel.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/users/mlm/downline-users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await this.request<DownlineUsersResponse>(
      endpoint,
      {
        method: 'GET',
      }
    );

    return response.data!;
  }

  // Dashboard API Method
  public async getDashboard(): Promise<DashboardResponse> {
    const response = await this.request<DashboardResponse>(
      '/users/dashboard',
      {
        method: 'GET',
      }
    );

    return response.data!;
  }

  // Referral Link API Method
  public async getReferralLink(): Promise<ReferralLinkResponse> {
    const response = await this.request<ReferralLinkResponse>(
      '/users/referral-link',
      {
        method: 'GET',
      }
    );

    return response.data!;
  }

  // Admin Status API Method
  public async getAdminStatus(): Promise<AdminStatusResponse> {
    const response = await this.request<AdminStatusResponse>(
      '/users/admin-status',
      {
        method: 'GET',
      }
    );

    return response.data!;
  }

  // MLM Chain API Method
  public async getMlmChain(
    params: MlmChainParams = {}
  ): Promise<MlmChainResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.referralCode) queryParams.append('referralCode', params.referralCode);
    if (params.maxLevel) queryParams.append('maxLevel', params.maxLevel.toString());

    const endpoint = `/users/mlm/chain${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await this.request<MlmChainResponse>(
      endpoint,
      {
        method: 'GET',
      }
    );

    return response.data!;
  }

  // Wallet Transfer API Method
  public async transferToTradingWallet(
    transferData: TransferToTradingRequest
  ): Promise<TransferToTradingResponse> {
    const response = await this.request<TransferToTradingResponse>(
      '/users/wallet/transfer-to-trading',
      {
        method: 'POST',
        body: JSON.stringify(transferData),
      }
    );

    return response.data!;
  }

  // Gold Trading API Methods
  public async buyGold(buyData: BuyGoldRequest): Promise<BuyGoldResponse> {
    const response = await this.request<BuyGoldResponse>(
      '/users/trading/gold/buy',
      {
        method: 'POST',
        body: JSON.stringify(buyData),
      }
    );

    return response.data!;
  }

  public async sellGold(sellData: SellGoldRequest): Promise<SellGoldResponse> {
    const response = await this.request<SellGoldResponse>(
      '/users/trading/gold/sell',
      {
        method: 'POST',
        body: JSON.stringify(sellData),
      }
    );

    return response.data!;
  }

  public async getGoldTradingHistory(
    params: GoldTradingHistoryParams = {}
  ): Promise<GoldTradingHistoryResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.tradeType) queryParams.append('tradeType', params.tradeType);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const endpoint = `/users/trading/gold/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await this.request<GoldTradingHistoryResponse>(
      endpoint,
      {
        method: 'GET',
      }
    );

    return response.data!;
  }

  public async getGoldProfitLossSummary(
    startDate?: string,
    endDate?: string
  ): Promise<ProfitLossSummaryResponse> {
    const queryParams = new URLSearchParams();
    
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const endpoint = `/users/trading/gold/profit-loss${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await this.request<ProfitLossSummaryResponse>(
      endpoint,
      {
        method: 'GET',
      }
    );

    return response.data!;
  }

  public async getGoldHoldings(): Promise<GoldHoldingsResponse> {
    const response = await this.request<GoldHoldingsResponse>(
      '/users/trading/gold/holdings',
      {
        method: 'GET',
      }
    );

    return response.data!;
  }

  // Live Gold Price API Method (External API - no auth required)
  public async getCurrentGoldPrice(): Promise<CurrentGoldPriceResponse> {
    try {
      // This is an external API, so we'll use fetch directly without auth
      const response = await fetch('https://7bb3rgsz-4001.inc1.devtunnels.ms/api/v1/gold/current');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching current gold price:', error);
      throw error;
    }
  }

  // Generic API methods for future use
  public async get<T>(endpoint: string): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'GET',
    });
    return response.data!;
  }

  public async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.data!;
  }

  public async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.data!;
  }

  public async delete<T>(endpoint: string): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'DELETE',
    });
    return response.data!;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
