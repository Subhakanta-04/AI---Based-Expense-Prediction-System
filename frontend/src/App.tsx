import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Dataset } from './pages/Dataset';
import { EDA } from './pages/EDA';
import { TrainModel } from './pages/TrainModel';
import { ModelComparisonPage } from './pages/ModelComparison';
import { Predictions } from './pages/Predictions';
import { Forecast } from './pages/Forecast';
import { BudgetTargets } from './pages/BudgetTargets';
import { ScenarioSimulator } from './pages/ScenarioSimulator';
import { Anomalies } from './pages/Anomalies';
import { Insights } from './pages/Insights';
import { VivaAssistant } from './pages/VivaAssistant';
import { Reports } from './pages/Reports';
import { SettingsPage } from './pages/Settings';
import { AddExpenseModal } from './components/expenses/AddExpenseModal';
import { api } from './services/api';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
  const [totalRecords, setTotalRecords] = useState(114);
  const [bestModelName, setBestModelName] = useState('Random Forest');
  const [categories, setCategories] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);

  // Dark mode state persisted in localStorage
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('fyte_dark_mode') || localStorage.getItem('spendwise_dark_mode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('fyte_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  const loadInitialMeta = async () => {
    try {
      const [info, best] = await Promise.all([
        api.getDatasetInfo(),
        api.getBestModel().catch(() => null)
      ]);
      if (info) {
        setTotalRecords(info.num_records);
        setCategories(info.categories);
        setPaymentMethods(info.payment_methods);
      }
      if (best) setBestModelName(best.best_model_name);
    } catch (err) {
      console.error("Meta load failed", err);
    }
  };

  useEffect(() => {
    loadInitialMeta();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-white animate-spin" />
        <p className="text-xs font-mono-code text-zinc-400">Initializing Session Authentication...</p>
      </div>
    );
  }

  // If not logged in, render authentication page
  if (!isAuthenticated) {
    return <Login />;
  }

  const renderActivePage = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onNavigateTab={setCurrentTab} />;
      case 'dataset':
        return <Dataset />;
      case 'eda':
        return <EDA />;
      case 'train':
        return <TrainModel />;
      case 'comparison':
        return <ModelComparisonPage />;
      case 'predictions':
        return <Predictions />;
      case 'forecast':
        return <Forecast />;
      case 'budget':
        return <BudgetTargets />;
      case 'scenarios':
        return <ScenarioSimulator />;
      case 'anomalies':
        return <Anomalies />;
      case 'insights':
        return <Insights />;
      case 'viva':
        return <VivaAssistant />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} />;
      default:
        return <Dashboard onNavigateTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-black text-zinc-100 selection:bg-zinc-800 selection:text-white transition-colors">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpenMobile={sidebarOpenMobile}
        onCloseMobile={() => setSidebarOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onOpenSidebar={() => setSidebarOpenMobile(true)}
          totalRecords={totalRecords}
          bestModelName={bestModelName}
          onTrainClick={() => setCurrentTab('train')}
          onAddExpenseClick={() => setAddExpenseModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Add Expense Modal */}
      <AddExpenseModal
        isOpen={addExpenseModalOpen}
        onClose={() => setAddExpenseModalOpen(false)}
        categories={categories}
        paymentMethods={paymentMethods}
        onExpenseAdded={loadInitialMeta}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
