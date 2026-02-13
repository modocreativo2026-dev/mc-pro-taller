import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, Package, Calendar as CalendarIcon, ClipboardList, Palette, 
  Plus, Trash2, Clock, MapPin, BarChart3, BookOpen, Users, DollarSign, 
  CheckCircle2, AlertCircle, Edit2, X, Star, Zap, Instagram, Facebook, MessageCircle, 
  StickyNote, Thermometer, Lightbulb, UserCheck, 
  Contact, UserPlus, Phone, Mail as MailIcon, Layout, ExternalLink, Gift, 
  Sparkles, Sun, ChevronLeft, ChevronRight, Music2, Save, Info, Heart, Menu,
  Moon, Truck, PackageCheck, Printer, Database, Play, RotateCcw
} from 'lucide-react';

// --- UTILIDADES ---
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

// --- COMPONENTE PRINCIPAL ---
const App = () => {
  // 1. ESTADOS DE UI Y CONFIGURACIÓN
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [darkMode, setDarkMode] = usePersistedState('mc_dark_mode', false);
  const [tourSeen, setTourSeen] = usePersistedState('mc_tour_seen', false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  
  // 2. CONFIGURACIÓN DEL TALLER
  const [settings, setSettings] = usePersistedState('mc_settings', {
    userName: 'Modo Creativo',
    city: 'Piriápolis',
    region: 'Maldonado',
    country: 'Uruguay',
    currency: '$',
    taxName: 'IVA',
    hemisphere: 'Sur'
  });

  // 3. PERSISTENCIA DE DATOS
  const [inventory, setInventory] = usePersistedState('mc_inventory', []);
  const [tasks, setTasks] = usePersistedState('mc_tasks', []);
  const [clients, setClients] = usePersistedState('mc_clients', []);
  const [contacts, setContacts] = usePersistedState('mc_contacts', []);
  const [expenses, setExpenses] = usePersistedState('mc_expenses', []);
  const [shipments, setShipments] = usePersistedState('mc_shipments', []);
  const [personalEvents, setPersonalEvents] = usePersistedState('mc_personal_events', {});
  const [calc, setCalc] = usePersistedState('mc_calc', { costPerPack: 0, unitsInPack: 1, qtyNeeded: 1, margin: 50 });

  // 4. ESTADOS DE EDICIÓN Y MODALES
  const [editingClient, setEditingClient] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editingInv, setEditingInv] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [editingShipment, setEditingShipment] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [printingLabel, setPrintingLabel] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  // --- EFECTOS ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => prevTasks.map(t => t.isRunning ? { ...t, timeSpent: (t.timeSpent || 0) + 1 } : t));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (darkMode) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, [darkMode]);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const deleteItem = (id, entitySet, entityName) => {
    if (window.confirm(`¿Seguro que quieres eliminar esta ${entityName}?`)) {
      entitySet(prev => prev.filter(item => item.id !== id));
      notify(`${entityName} eliminada`);
    }
  };

  const saveEntity = (e, entitySet, currentEntity, setter, entityName) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = Object.fromEntries(f.entries());
    ['amount', 'qty', 'price', 'costPerPack', 'unitsInPack'].forEach(key => {
      if (data[key]) data[key] = Number(data[key]);
    });
    const newItem = { 
      id: currentEntity?.id || Date.now(), 
      ...data, 
      date: currentEntity?.date || new Date().toISOString().split('T')[0],
      completed: currentEntity?.completed || false,
      timeSpent: currentEntity?.timeSpent || 0,
      isRunning: false
    };
    entitySet(prev => currentEntity ? prev.map(c => c.id === currentEntity.id ? newItem : c) : [...prev, newItem]);
    setter(null); e.target.reset(); notify(`${entityName} guardada`);
  };

  // --- LÓGICA DE CALENDARIO Y CAMPAÑAS ---
  const perpetualEvents = useMemo(() => [
    { d: 1, m: 0, t: 'Año Nuevo', type: 'UY', info: 'Inicio de ciclo.', idea: 'Planners anuales y calendarios de escritorio.' },
    { d: 6, m: 0, t: 'Día de Reyes', type: 'UY', info: 'Magia e ilusión.', idea: 'Cartas para los Reyes y etiquetas de regalo personalizadas.' },
    { d: 14, m: 1, t: 'San Valentín', type: 'INT', info: 'Día del amor.', idea: 'Box con visor de corazón y tarjetas con foil.' },
    { d: 8, m: 2, t: 'Día de la Mujer', type: 'INT', info: 'Fuerza emprendedora.', idea: 'Libretas mini y planners para mujeres.' },
    { d: 21, m: 2, t: 'Día de la Creatividad', type: 'CM', info: 'Nuestra gran fecha.', idea: 'Sketchbooks artesanales y láminas motivacionales.' },
    { d: 27, m: 3, t: 'Diseño Gráfico', type: 'CM', info: 'Orgullo visual.', idea: 'Muestrarios de papeles y acabados.' },
    { d: 19, m: 5, t: 'Natalicio de Artigas', type: 'UY', info: 'Prócer nacional.', idea: 'Escaramapelas creativas y material didáctico.' },
    { d: 24, m: 7, t: 'Noche de la Nostalgia', type: 'UY', info: 'Gran fiesta UY.', idea: 'Invitaciones retro y decoración de fiestas.' },
    { d: 25, m: 7, t: 'Independencia UY', type: 'UY', info: 'Orgullo oriental.', idea: 'Kits de decoración institucional.' },
    { d: 31, m: 9, t: 'Halloween', type: 'CM', info: 'Terror creativo.', idea: 'Bolsas para dulces y guirnaldas.' }
  ], []);

  const monthTheme = useMemo(() => {
    const month = viewDate.getMonth();
    const h = settings.hemisphere;
    
    const getSeason = (m, hem) => {
      if (hem === 'Sur') {
        if ([11, 0, 1].includes(m)) return { name: 'Verano', colors: ['#FFD700', '#FF8C00', '#00BFFF', '#FFFFFF'] };
        if ([2, 3, 4].includes(m)) return { name: 'Otoño', colors: ['#8B4513', '#D35400', '#CD853F', '#FAF3E0'] };
        if ([5, 6, 7].includes(m)) return { name: 'Invierno', colors: ['#191970', '#4169E1', '#87CEEB', '#F0F8FF'] };
        return { name: 'Primavera', colors: ['#FF69B4', '#32CD32', '#BA68C8', '#FFF0F5'] };
      }
      return { name: 'Invierno', colors: ['#191970', '#4169E1', '#87CEEB', '#F0F8FF'] };
    };

    const season = getSeason(month, h);
    const event = perpetualEvents.find(e => e.m === month) || { t: 'Campaña General', idea: 'Kits de papelería' };
    
    return {
      seasonName: season.name,
      seasonPalette: season.colors,
      eventTheme: event.t,
      eventIdea: event.idea,
      eventPalette: ['#E11D48', '#FB7185', '#FFF1F2', '#9F1239']
    };
  }, [viewDate, settings.hemisphere, perpetualEvents]);

  // --- MÉTRICAS ---
  const monthlyMetrics = useMemo(() => {
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();
    const monthSales = clients.filter(c => {
      const d = new Date(c.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalFacturado = monthSales.reduce((acc, curr) => acc + curr.amount, 0);
    const totalCobrado = monthSales.filter(c => c.status === 'Cobrado').reduce((acc, curr) => acc + curr.amount, 0);
    const totalGastos = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    
    const totalSegundos = tasks.reduce((acc, t) => acc + (t.timeSpent || 0), 0);
    const totalHoras = (totalSegundos / 3600).toFixed(1);

    const materialCounts = {};
    tasks.forEach(t => { if (t.material) materialCounts[t.material] = (materialCounts[t.material] || 0) + 1; });
    const topMat = Object.entries(materialCounts).reduce((a, b) => (a[1] > b[1] ? a : b), ["Ninguno", 0]);

    return { totalFacturado, totalCobrado, totalGastos, gananciaNeta: totalCobrado - totalGastos, totalHoras, topMat: topMat[0] };
  }, [clients, tasks, expenses, viewDate]);

  const lowStockItems = useMemo(() => inventory.filter(item => item.qty <= 5), [inventory]);

  // --- BACKUP ---
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ inventory, tasks, clients, contacts, expenses, shipments, settings }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mc_pro_respaldo_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    notify("Respaldo descargado");
  };

  // --- RENDERIZADO DE COMPONENTES ---
  const NavItem = ({ id, label, icon: Icon }) => (
    <button onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-black text-[11px] uppercase tracking-tighter ${activeTab === id ? 'bg-[#E11D48] text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:bg-slate-50'}`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-[#fcfcfc] text-slate-800'}`}>
      
      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 text-center border-b border-slate-50 dark:border-slate-700">
          <div className="p-3 rounded-2xl bg-[#E11D48] text-white shadow-xl rotate-3 mb-4 inline-block"><Star className="w-6 h-6 fill-current" /></div>
          <h1 className="font-black text-2xl tracking-tighter uppercase italic">MC Pro <span className="text-[#E11D48]">v2</span></h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Modo Creativo • Piriápolis</p>
        </div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {[{id:'dashboard', label:'Escritorio', icon:Layout}, {id:'clients', label:'Ventas', icon:DollarSign}, {id:'checklist', label:'Taller', icon:ClipboardList}, {id:'inventory', label:'Insumos', icon:Package}, {id:'logistics', label:'Envíos', icon:Truck}, {id:'planner', label:'Calendario', icon:CalendarIcon}, {id:'agenda', label:'Agenda Pro', icon:UserPlus}, {id:'calculator', label:'Costos', icon:Calculator}, {id:'settings', label:'Ajustes', icon:Palette}].map(item => <NavItem key={item.id} {...item} />)}
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth">
        {notification && <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-[#E11D48] text-white px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-widest shadow-2xl z-[100] animate-bounce">{notification}</div>}

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-[#E11D48]"><Menu /></button>
            <div>
              <div className="flex items-center gap-2 text-slate-400 mb-2"><MapPin className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">{settings.city}, {settings.country}</span></div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{activeTab.replace('dashboard', 'Escritorio')}</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setDarkMode(!darkMode)} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">{darkMode ? <Sun className="text-amber-400"/> : <Moon />}</button>
             <div className="bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
               <p className="text-[9px] text-slate-400 font-black uppercase">Hora Local</p>
               <p className="font-black text-xl">{currentTime.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}</p>
             </div>
          </div>
        </header>

        {/* CONTENIDO DINÁMICO (EJEMPLO DASHBOARD) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            {lowStockItems.length > 0 && (
              <div className="bg-rose-500 text-white p-8 rounded-[3rem] shadow-xl flex items-center justify-between border-4 border-white">
                <div className="flex items-center gap-6">
                  <AlertCircle className="w-10 h-10" />
                  <div><h4 className="text-xl font-black uppercase italic tracking-tighter">¡Reponer Insumos!</h4><p className="text-[10px] font-bold uppercase opacity-80">Hay {lowStockItems.length} materiales bajo las 5 unidades.</p></div>
                </div>
                <button onClick={() => setActiveTab('inventory')} className="bg-white text-rose-500 px-6 py-3 rounded-2xl font-black text-[10px] uppercase">Ver Stock</button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] shadow-sm border border-slate-100 dark:border-slate-700 col-span-1 md:col-span-2">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2"><Palette className="w-4 h-4 text-[#E11D48]"/> Laboratorio de Color - {monthTheme.seasonName}</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-3">Paleta Estacional</p>
                    <div className="flex h-16 rounded-2xl overflow-hidden border border-slate-50 dark:border-slate-600">
                      {monthTheme.seasonPalette.map(c => <button key={c} onClick={() => {navigator.clipboard.writeText(c); notify(`Copiado: ${c}`)}} className="flex-1 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-3">Paleta {monthTheme.eventTheme}</p>
                    <div className="flex h-16 rounded-2xl overflow-hidden border border-slate-50 dark:border-slate-600">
                      {monthTheme.eventPalette.map(c => <button key={c} onClick={() => {navigator.clipboard.writeText(c); notify(`Copiado: ${c}`)}} className="flex-1 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E11D48]/20 blur-3xl" />
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Balance Mensual</p>
                <div><p className="text-5xl font-black italic tracking-tighter leading-none">{settings.currency}{monthlyMetrics.gananciaNeta}</p><p className="text-[10px] font-bold text-slate-400 uppercase mt-4 italic">Ganancia neta estimada</p></div>
                <button onClick={() => setShowSummaryModal(true)} className="mt-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-[10px] uppercase transition-all">Reporte Detallado</button>
              </div>
            </div>
          </div>
        )}

        {/* Aquí irían el resto de los componentes que diseñamos (checklist, logistics, etc.) siguiendo el mismo estilo */}
        {/* Debido a la longitud, los bloques de UI son intercambiables según el activeTab */}

      </main>
    </div>
  );
};

export default App;
