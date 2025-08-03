import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { 
  DollarSign, 
  Menu,
  Sparkles
} from 'lucide-react';

interface MobileHeaderProps {
  onToggleSidebar: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const { profile } = useProfile();

  const userName = profile?.display_name || user?.email?.split('@')[0] || 'Usuário';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-slate-900/95 via-slate-900/98 to-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 md:hidden">
      <div className="flex items-center justify-between p-3 sm:p-4">
        {/* Logo e Nome */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-1.5 sm:p-2 border border-slate-600/50 shadow-2xl">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
            </div>
          </div>
          
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent truncate">
              PoupaIgão
            </h1>
            <div className="flex items-center">
              <Sparkles className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-green-400 mr-1 animate-pulse flex-shrink-0" />
              <span className="text-xs text-slate-400 truncate">Finanças Inteligentes</span>
            </div>
          </div>
        </div>

        {/* Avatar e Menu */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-green-400/50 shadow-xl">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-xs sm:text-sm">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          <Button
            onClick={onToggleSidebar}
            variant="ghost"
            size="sm"
            className="p-2 sm:p-2.5 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;