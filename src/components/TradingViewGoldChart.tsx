import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface TradingViewGoldChartProps {
  className?: string;
  height?: string | number;
}

const TradingViewGoldChart: React.FC<TradingViewGoldChartProps> = ({ 
  className = '', 
  height 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartHeight, setChartHeight] = useState(() => {
    // Responsive height based on screen size
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 400 : (height || 600);
    }
    return height || 600;
  });

  const initializeWidget = React.useCallback(() => {
    if (!containerRef.current || !window.TradingView) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Clear previous content
      containerRef.current.innerHTML = '';
      
      // Create unique container ID
      const containerId = `tradingview-gold-chart-${Date.now()}`;
      containerRef.current.id = containerId;
      
      // Initialize TradingView widget with responsive settings
      widgetRef.current = new window.TradingView.widget({
        autosize: true,
        symbol: 'OANDA:XAUUSD',
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'light',
        style: '1',
        locale: 'in',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: containerId,
        height: chartHeight,
        width: '100%',
        hide_side_toolbar: window.innerWidth < 768, // Hide on mobile for better space
        save_image: false,
        studies: window.innerWidth >= 768 ? [
          'RSI@tv-basicstudies',
          'MACD@tv-basicstudies'
        ] : [], // Remove studies on mobile for better performance
        show_popup_button: true,
        popup_width: Math.min(1000, window.innerWidth - 40),
        popup_height: Math.min(650, window.innerHeight - 40),
        no_referral_id: true,
        referrer_id: '',
        disabled_features: window.innerWidth < 768 ? [
          'use_localstorage_for_settings',
          'volume_force_overlay',
          'create_volume_indicator_by_default'
        ] : [],
        overrides: {
          'paneProperties.background': '#ffffff',
          'paneProperties.vertGridProperties.color': '#e0e0e0',
          'paneProperties.horzGridProperties.color': '#e0e0e0',
        },
      });
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing TradingView widget:', err);
      setError('Failed to initialize chart. Please try again.');
      setIsLoading(false);
    }
  }, [chartHeight]);

  // Update height on window resize
  useEffect(() => {
    const handleResize = () => {
      const newHeight = window.innerWidth < 768 ? 400 : (height || 600);
      if (newHeight !== chartHeight) {
        setChartHeight(newHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [height, chartHeight]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
    
    if (existingScript && window.TradingView) {
      // Script already loaded, just initialize widget
      initializeWidget();
      return;
    }

    if (!existingScript) {
      // Create script element for TradingView widget
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.id = 'tradingview-widget-script';
      
      script.onload = () => {
        if (containerRef.current && window.TradingView) {
          initializeWidget();
        }
      };

      script.onerror = () => {
        console.error('Failed to load TradingView script');
        setError('Failed to load TradingView chart. Please refresh the page.');
        setIsLoading(false);
      };

      document.body.appendChild(script);
    }

    return () => {
      // Cleanup widget on unmount
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (err) {
          console.error('Error removing widget:', err);
        }
        widgetRef.current = null;
      }
    };
  }, [chartHeight]);

  return (
    <div className={`tradingview-widget-container ${className} w-full`}>
      {isLoading && (
        <div className="flex items-center justify-center" style={{ height: `${chartHeight}px` }}>
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading chart...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center justify-center p-4" style={{ minHeight: `${chartHeight}px` }}>
          <div className="text-center max-w-md">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <a 
              href="https://in.tradingview.com/chart/?symbol=OANDA%3AXAUUSD" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Open Chart on TradingView
            </a>
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        id="tradingview-gold-chart"
        className={`w-full ${isLoading || error ? 'hidden' : ''}`}
        style={{ 
          height: `${chartHeight}px`,
          width: '100%',
          minWidth: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
      />
      
      {!error && (
        <div className="tradingview-widget-copyright mt-2 text-center">
          <a 
            href="https://in.tradingview.com/chart/?symbol=OANDA%3AXAUUSD" 
            rel="noopener noreferrer" 
            target="_blank"
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            <span className="text-blue-600">Gold Chart</span> by TradingView
          </a>
        </div>
      )}
    </div>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    TradingView?: any;
  }
}

export default TradingViewGoldChart;