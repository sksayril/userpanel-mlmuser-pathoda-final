import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface WalletCardProps {
  title: string;
  amount: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: LucideIcon;
  gradient: string;
}

const WalletCard: React.FC<WalletCardProps> = ({ 
  title, 
  amount, 
  change, 
  changeType, 
  icon: Icon, 
  gradient 
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white ${gradient} shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-2">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-bold mb-3">{amount}</h3>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              changeType === 'positive' 
                ? 'bg-white/20 text-white' 
                : 'bg-white/20 text-white'
            }`}>
              {changeType === 'positive' ? '+' : ''}{change}
            </span>
            <span className="text-white/70 text-xs">vs last month</span>
          </div>
        </div>
        <div className="bg-white/20 rounded-xl p-3">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
    </div>
  );
};

export default WalletCard;