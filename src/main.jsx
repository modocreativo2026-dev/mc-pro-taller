import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Calculator, Package, Calendar as CalendarIcon, ClipboardList, Palette, 
  Plus, Trash2, Clock, MapPin, BarChart3, BookOpen, Users, DollarSign, 
  CheckCircle2, AlertCircle, Edit2, X, Star, Zap, Instagram, MessageCircle, 
  StickyNote, UserPlus, Phone, Layout, Gift, Sparkles, Sun, ChevronLeft, 
  ChevronRight, Save, Moon, Truck, PackageCheck, Printer, Database, Play, RotateCcw
} from 'lucide-react';

// Persistencia de datos en el navegador
const usePersistedState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) { return defaultValue; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);
  return [state, setState];
};

const formatTime = (seconds = 0) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = usePersistedState('mc_dark_mode', false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Ajustes de Modocreativouy
  const [settings] = usePersistedState('mc_settings', {
    userName: 'Modo Creativo',
    city: 'Piriápolis',
    currency: '$',
    hemisphere: 'Sur'
  });

  const [tasks, setTasks] = usePersistedState('mc_tasks', []);
  const [clients] = usePersistedState('mc_clients', []);
  const [expenses] = usePersistedState('mc_expenses', []);

  // Cronómetros en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const chrono = setInterval(() => {
      setTasks(prev => prev.map(t => t.isRunning ? { ...t, timeSpent: (t.timeSpent || 0) + 1 } : t));
    }, 1000);
    return () => { clearInterval(timer); clearInterval(chrono); };
  }, []);

  // Lógica del Laboratorio de Color (Verano 2026)
  const monthTheme = useMemo(() => {
    const m = currentTime.getMonth();
    const isSummer = settings.hemisphere === 'Sur' ? [11,0,1].includes(m) : [5,6,7].includes(m);
    return {
      season: isSummer ? 'Verano' : 'Invierno',
      sPal: isSummer ? ['#FFD700', '#FF8C00', '#00BFFF', '#FFFFFF'] : ['#191970', '#4169E1', '#87CEEB', '#F0F8FF'],
      eName: 'San Valentín',
      ePal: ['#E11D48', '#FB7185', '#FFF1F2', '#9F1239']
    };
  }, [currentTime, settings]);

  const stats = useMemo(() => {
    const totalVentas = clients.reduce((a, b) => a + (Number(b.amount) || 0), 0);
    const totalGastos = expenses.reduce((a, b) => a + (Number(b.amount) || 0), 0);
    return { neta: totalVentas - totalGastos };
  }, [clients, expenses]);

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
      {/* NAVEGACIÓN */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t p-4 flex justify-around md:relative md:border-b md:mb-8">
        <button onClick={() => setActiveTab('dashboard')} className={`p-2 rounded-xl ${activeTab === 'dashboard' ? 'bg-rose-500 text-white' : ''}`}><Layout /></button>
        <button onClick={() => setActiveTab('taller')} className={`p-2 rounded-xl ${activeTab === 'taller' ? 'bg-rose-500 text-white' : ''}`}><ClipboardList /></button>
        <button onClick={() => setDarkMode(!darkMode)} className="p-2"><Sun className={darkMode ? 'text-amber-400' : 'text-slate-400'} /></button>
      </nav>

      {/* CONTENIDO DEL ESCRITORIO */}
      <main className="p-6 pb-24 md:max-w-6xl md:mx-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter">MC Pro <span className="text-rose-500">v2</span></h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{settings.city}, Uruguay</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                <p className="text-[9px] font-bold text-rose-500 uppercase">En Vivo</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CAJA DE DINERO */}
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
                <p className="text-[10px] font-black uppercase text-rose-400 mb-2">Ganancia Neta Mes</p>
                <p className="text-5xl font-black italic tracking-tighter">{settings.currency}{stats.neta}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-4">Total de caja limpia</p>
              </div>

              {/* LABORATORIO DE COLOR */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border shadow-sm col-span-2">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Palette size={14} className="text-rose-500"/> Laboratorio • {monthTheme.season}</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[9px] font-black uppercase mb-2">Paleta Estacional</p>
                    <div className="flex h-12 rounded-xl overflow-hidden">
                      {monthTheme.sPal.map(c => <div key={c} style={{backgroundColor: c}} className="flex-1" />)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase mb-2">Campaña: {monthTheme.eName}</p>
                    <div className="flex h-12 rounded-xl overflow-hidden">
                      {monthTheme.ePal.map(c => <div key={c} style={{backgroundColor: c}} className="flex-1" />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MÓDULO DEL TALLER */}
        {activeTab === 'taller' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase italic">Taller de Producción</h2>
            {tasks.length === 0 ? (
              <div className="p-12 border-2 border-dashed rounded-[2.5rem] text-center text-slate-400">
                <p className="font-bold uppercase text-[11px]">No hay trabajos activos</p>
              </div>
            ) : (
              tasks.map(t => (
                <div key={t.id} className="bg-white p-6 rounded-3xl shadow-sm border flex justify-between items-center">
                  <div>
                    <p className="font-black uppercase">{t.title}</p>
                    <p className="text-2xl font-mono text-rose-500">{formatTime(t.timeSpent)}</p>
                  </div>
                  <button className="p-4 bg-slate-100 rounded-2xl"><Play size={20}/></button>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
