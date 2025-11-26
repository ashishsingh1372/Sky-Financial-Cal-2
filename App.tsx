import React, { useState } from 'react';
import { CalculatorType } from './types';
import Calculator from './components/Calculator';
import RubyChat from './components/RubyChat';
import { LayoutGrid, Calculator as CalcIcon, TrendingUp, Landmark, PiggyBank, Scale } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<CalculatorType>(CalculatorType.SIP);

  const tabs = [
    { id: CalculatorType.SIP, label: 'SIP', icon: TrendingUp },
    { id: CalculatorType.LUMPSUM, label: 'Lumpsum', icon: PiggyBank },
    { id: CalculatorType.EMI, label: 'EMI', icon: Landmark },
    { id: CalculatorType.PPF, label: 'PPF', icon: CalcIcon },
    { id: CalculatorType.TAX, label: 'Tax Savings', icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-[Inter] selection:bg-indigo-100 selection:text-indigo-800">
      <style>{`
        @keyframes shine {
          to {
            background-position: 200% center;
          }
        }
        .animate-shine {
          animation: shine 2s linear infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-xl shadow-sm sticky top-0 z-40 border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between h-10 sm:h-20 items-center">
            <div className="flex items-center gap-1 sm:gap-3 group cursor-pointer">
              <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-1 sm:p-3 rounded-md sm:rounded-2xl text-white shadow-lg group-hover:shadow-indigo-300 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                 <LayoutGrid size={14} className="sm:w-[22px] sm:h-[22px]" />
              </div>
              <span className="font-bold text-sm sm:text-2xl tracking-tight text-slate-800 group-hover:text-indigo-700 transition-colors">Sky Financial</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
               <span className="text-xs font-bold text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full tracking-wide">v2.3</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container max-w-7xl mx-auto px-1.5 sm:px-6 lg:px-8 py-1.5 sm:py-6 lg:py-16 pb-20 sm:pb-24">
        <div className="grid lg:grid-cols-12 gap-1.5 sm:gap-6 lg:gap-8 items-start">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-8">
            <div className="bg-white rounded-lg sm:rounded-3xl shadow-sm border border-slate-100 overflow-hidden lg:sticky lg:top-28 transition-all duration-300">
               <div className="p-2 sm:p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                 <h2 className="font-bold text-slate-800 text-[10px] sm:text-xs uppercase tracking-widest">Financial Calculators</h2>
               </div>
               <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible p-1 sm:p-4 gap-1 sm:gap-2 scrollbar-hide snap-x">
                 {tabs.map((tab) => {
                   const Icon = tab.icon;
                   const isActive = activeTab === tab.id;
                   return (
                     <button
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id)}
                       className={`flex items-center gap-1 sm:gap-4 px-2 py-1.5 sm:px-5 sm:py-4 rounded sm:rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap group relative overflow-hidden outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex-shrink-0 snap-start
                         ${isActive 
                           ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 lg:translate-x-2' 
                           : 'text-slate-500 hover:bg-indigo-50/50 hover:text-indigo-600 bg-white border border-slate-50 lg:border-0'
                         }`}
                     >
                       <Icon size={12} className={`relative z-10 transition-transform duration-300 sm:w-5 sm:h-5 ${isActive ? 'text-indigo-100 lg:scale-110' : 'text-slate-400 group-hover:text-indigo-500 group-hover:scale-110'}`} />
                       <span className="relative z-10 tracking-wide text-[9px] sm:text-sm">{tab.label}</span>
                       {!isActive && <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
                     </button>
                   );
                 })}
               </div>
            </div>

            {/* Info Card */}
            <div className="hidden lg:block transform transition-all hover:scale-105 duration-300 hover:rotate-1">
               <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-300 relative overflow-hidden group">
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>
                  <h3 className="font-bold text-xl mb-3 relative z-10">Need advice?</h3>
                  <p className="text-indigo-100 text-sm mb-6 relative z-10 opacity-90 leading-relaxed">
                    Chat with <strong>Ruby</strong> to understand which investment is best for your goals.
                  </p>
                  <div className="text-xs bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 relative z-10 shadow-inner italic">
                    "Hey Ruby, analyze my SIP returns..."
                  </div>
               </div>
            </div>
          </div>

          {/* Calculator Area */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-xl sm:rounded-[2.5rem] shadow-xl lg:shadow-2xl lg:shadow-slate-200/60 border border-slate-100 overflow-hidden min-h-[auto] lg:min-h-[650px] transition-all duration-500">
               <Calculator type={activeTab} />
            </div>
            
            {/* Footer Note */}
            <div className="mt-2 sm:mt-10 text-center text-slate-400 text-[6px] sm:text-[10px] font-semibold tracking-wider uppercase flex items-center justify-center gap-1 sm:gap-3 opacity-60 hover:opacity-100 transition-opacity">
              <div className="w-0.5 sm:w-1.5 h-0.5 sm:h-1.5 bg-slate-300 rounded-full" />
              <p>© {new Date().getFullYear()} Sky Financial. AI-Assisted Financial Tools.</p>
              <div className="w-0.5 sm:w-1.5 h-0.5 sm:h-1.5 bg-slate-300 rounded-full" />
            </div>
          </div>

        </div>
      </main>

      {/* Chatbot */}
      <RubyChat />
    </div>
  );
}

export default App;