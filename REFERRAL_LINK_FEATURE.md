# Referral Link Feature Documentation

## Overview
The Referral Link feature allows users to generate and share their personal referral links to earn commissions from new user signups. This feature is integrated into the My Levels section of the MLM platform.

## Features

### 1. Referral Link Generation
- **API Endpoint**: `GET /users/referral-link`
- **Authentication**: Required (Bearer token)
- **Response**: Returns referral link, shareable text, and QR code data

### 2. Admin Status Information
- **API Endpoint**: `GET /users/admin-status`
- **Authentication**: Required (Bearer token)
- **Response**: Returns user details, admin assignment status, and referral codes

### 3. Referral Link Card Component
- **Location**: `src/components/ReferralLinkCard.tsx`
- **Features**:
  - Displays referral link with copy functionality
  - Shows shareable text for social media
  - QR code generation and display
  - Download QR code functionality
  - Native sharing support (if available)
  - Admin status and referral codes display
  - User and admin referral code management
  - Error handling and loading states

### 4. Integration in My Levels
- **Location**: `src/pages/MyLevels.tsx`
- **New Tab**: "Referral Link" tab added to the My Levels section
- **Content**:
  - Referral link card with admin status
  - User and admin referral codes display
  - How referral commissions work explanation
  - Commission levels breakdown
  - Admin assignment information
  - Tips for referral success

## API Integration

### Types Added
```typescript
interface ReferralLinkResponse {
  referralLink: string;
  shareableText: string;
  qrCodeData: string;
}

interface ReferralLinkApiResponse {
  success: boolean;
  data: ReferralLinkResponse;
}

interface AdminStatusResponse {
  user: AdminStatusUser;
  adminId: string;
  adminDetails: AdminStatusAdminDetails;
  adminRecord: AdminStatusAdminRecord;
  isAssignedToAdmin: boolean;
  needsFix: boolean;
}
```

### Service Methods
```typescript
public async getReferralLink(): Promise<ReferralLinkResponse> {
  const response = await this.request<ReferralLinkResponse>(
    '/users/referral-link',
    { method: 'GET' }
  );
  return response.data!;
}

public async getAdminStatus(): Promise<AdminStatusResponse> {
  const response = await this.request<AdminStatusResponse>(
    '/users/admin-status',
    { method: 'GET' }
  );
  return response.data!;
}
```

## User Experience

### 1. Accessing Referral Links
1. Navigate to "My Levels" section
2. Click on "Referral Link" tab
3. View and interact with referral link card

### 2. Sharing Options
- **Copy Link**: One-click copy to clipboard
- **Copy Shareable Text**: Copy formatted text for social media
- **Native Share**: Use device's native sharing (mobile)
- **QR Code**: Generate and download QR code for offline sharing
- **External Link**: Open link in new tab

### 3. Educational Content
- Step-by-step guide on how referrals work
- Commission structure explanation
- Tips for successful referral marketing
- Visual commission level breakdown

## Technical Implementation

### Component Structure
```
ReferralLinkCard
├── Header with refresh button
├── Referral Link Display
│   ├── Input field (read-only)
│   ├── Copy button
│   └── External link button
├── Shareable Text Display
│   ├── Textarea (read-only)
│   └── Copy button
├── Action Buttons
│   ├── Share Link button
│   └── Show/Hide QR Code button
├── QR Code Display (conditional)
│   ├── QR Code image
│   └── Download button
└── Sharing Tips section
```

### State Management
- `referralData`: Stores API response data
- `loading`: Loading state for API calls
- `error`: Error state for failed requests
- `copied`: UI feedback for copy actions
- `showQR`: Toggle QR code visibility

### Error Handling
- API request failures
- Clipboard API failures
- Network connectivity issues
- Graceful fallbacks for unsupported features

## Styling
- Consistent with existing design system
- Responsive design for mobile and desktop
- Loading states and animations
- Error states with retry options
- Success feedback for user actions

## Browser Compatibility
- Modern browsers with ES6+ support
- Clipboard API support for copy functionality
- Web Share API support for native sharing (optional)
- QR code image display support

## Future Enhancements
- Referral link analytics
- Custom referral link generation
- Social media integration
- Referral campaign management
- A/B testing for shareable text
