
import React from 'react';
import { LucideIcon, Upload, X, QrCode, Globe, Instagram, Facebook, MessageCircle } from 'lucide-react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline' }> = ({ className, variant = 'primary', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-brand-500"
  };
  
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className || ''}`} {...props} />
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className, title }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className || ''}`}>
    {title && (
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input 
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${className || ''}`} 
      {...props} 
    />
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'blue' | 'yellow' | 'gray' | 'red' }> = ({ children, color = 'gray' }) => {
  const colors = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800',
    red: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const ImageUpload: React.FC<{ 
  className?: string; 
  currentImage?: string; 
  placeholder?: string;
  onImageUpload: (base64: string) => void 
}> = ({ className, currentImage, placeholder, onImageUpload }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onImageUpload(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className={`relative border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-brand-500 transition-colors cursor-pointer overflow-hidden flex flex-col items-center justify-center ${className || ''}`}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />
      {currentImage ? (
        <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center p-4 text-gray-400">
          <Upload className="w-8 h-8 mb-2" />
          <span className="text-xs text-center">{placeholder || 'Upload'}</span>
        </div>
      )}
    </div>
  );
};

// --- App Native Components ---

export const AppShell: React.FC<{
  children: React.ReactNode;
  header?: React.ReactNode;
  bottomNav?: React.ReactNode;
  className?: string;
}> = ({ children, header, bottomNav, className }) => {
  return (
    <div className={`flex flex-col h-[100dvh] w-full bg-gray-50 ${className || ''}`}>
      {/* Fixed Header */}
      {header && (
        <div className="flex-none bg-white border-b border-gray-100 z-30">
          {header}
        </div>
      )}
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-24">
        {children}
      </div>

      {/* Fixed Bottom Nav */}
      {bottomNav && (
        <div className="flex-none fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe-area shadow-2xl">
          {bottomNav}
        </div>
      )}
    </div>
  );
};

export const MobileNav: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex justify-around items-center h-16 px-2">
    {children}
  </div>
);

export const MobileNavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${active ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
  >
    <div className={`${active ? 'transform scale-110' : ''} transition-transform`}>
      {React.cloneElement(icon as React.ReactElement, { size: 20, strokeWidth: active ? 2.5 : 2 })}
    </div>
    <span className="text-[10px] font-medium leading-none">{label}</span>
  </button>
);
export { QrCode, Globe, Instagram, Facebook, MessageCircle };
