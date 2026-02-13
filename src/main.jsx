import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, Package, Calendar as CalendarIcon, ClipboardList, Palette, 
  Plus, Trash2, Clock, MapPin, BarChart3, BookOpen, Users, DollarSign, 
  CheckCircle2, AlertCircle, Edit2, X, Star, Zap, Instagram, MessageCircle, 
  StickyNote, UserPlus, Phone, Layout, Gift, Sparkles, Sun, ChevronLeft, 
  ChevronRight, Save, Moon, Truck, PackageCheck, Printer, Database, Play, RotateCcw
} from 'lucide-react';

// --- 1. UTILIDADES Y PERSISTENCIA ---
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
  // --- 2. ESTADOS DE CONFIGURACIÓN Y UI ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [darkMode, setDarkMode] = usePersistedState('mc_dark_mode', false);
  const [tourSeen, setTourSeen] = usePersistedState('mc_tour_seen', false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  
  const [settings, setSettings] = usePersistedState('mc_settings', {
    userName: 'Modo Creativo',
    city: 'Piriápolis',
    region: 'Maldonado',
    country: 'Uruguay',
    currency: '$',
    taxName: 'IVA',
    hemisphere: 'Sur'
  });

  // --- 3. ESTADOS DE DATOS ---
  const [inventory, setInventory] = usePersistedState('mc_inventory', []);
  const [tasks, setTasks] = usePersistedState('mc_tasks', []);
  const [clients, setClients] = usePersistedState('mc_clients', []);
  const [contacts, setContacts] = usePersistedState('mc_contacts', []);
  const [expenses, setExpenses] = usePersistedState('mc_expenses', []);
  const [shipments, setShipments] = usePersistedState('mc_shipments', []);
  const [personalEvents, setPersonalEvents] = usePersistedState('mc_personal_events', {});
  const [calc, setCalc] = usePersistedState('mc_calc', { costPerPack: 0, unitsInPack: 1, qtyNeeded: 1, margin: 50 });

  // --- 4. MODALES Y EDICIÓN ---
  const [editingClient, setEditingClient] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [printingLabel, setPrintingLabel] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  // --- 5. EFECTOS (TIEMPO Y MODO OSCURO) ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const chrono = setInterval(() => {
      setTasks(prev => prev.map(t => t.isRunning ? { ...t, timeSpent: (t.timeSpent || 0) + 1 } : t));
    }, 1000);
    return () => { clearInterval(timer); clearInterval(chrono); };
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // --- 6. FUNCIONES LÓGICAS ---
  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 2500); };

  const deleteItem = (id, entitySet, name) => {
    if (window.confirm(`¿Eliminar ${name}?`)) {
      entitySet(prev => prev.filter(item => item.id !== id));
      notify(`${name} eliminado`);
    }
  };

  const saveEntity = (e, entitySet, current, setter, name) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const newItem = { 
      id: current?.id || Date.now(), 
      ...data, 
      amount: Number(data.amount || 0),
      qty: Number(data.qty || 0),
      date: current?.date || new Date().toISOString().split('T')[0],
      completed: current?.completed || false,
      timeSpent: current?.timeSpent || 0,
      isRunning: false
    };
    entitySet(prev => current ? prev.map(c => c.id === current.id ? newItem : c) : [...prev, newItem]);
    setter(null); e.target.reset(); notify(`${name} guardado`);
  };

  const exportData = () => {
    const data = { inventory, tasks, clients, contacts, expenses, shipments, settings, personalEvents };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `mc_pro_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  // --- 7. CALENDARIO Y CAMPAÑAS 2026 ---
  const perpetualEvents = useMemo(() => [
    { d: 1, m: 0, t: 'Año Nuevo', type: 'UY', idea: 'Planners anuales y calendarios.' },
    { d: 6, m: 0, t: 'Reyes Magos', type: 'UY', idea: 'Cartas y etiquetas de regalo.' },
    { d: 14, m: 1, t: 'San Valentín', type: 'INT', idea: 'Box con visor y tarjetas foil.' },
    { d: 8, m: 2, t: 'Día de la Mujer', type: 'INT', idea: 'Libretas mini y planners.' },
    { d: 21, m: 2, t: 'Día Creatividad', type: 'CM', idea: 'Sketchbooks artesanales.' },
    { d: 19, m: 3, t: '33 Orientales', type: 'UY', idea: 'Banderines y láminas patrias.' },
    { d: 1, m: 4, t: 'Día del Trabajador', type: 'UY', idea: 'Agendas de oficina.' },
    { d: 19, m: 5, t: 'Natalicio Artigas', type: 'UY', idea: 'Material didáctico escolar.' },
    { d: 24, m: 7, t: 'Noche Nostalgia', type: 'UY', idea: 'Invitaciones retro y props.' },
    { d: 25, m: 7, t: 'Independencia', type: 'UY', idea: 'Kits de decoración UY.' },
    { d: 31, m: 9, t: 'Halloween', type: 'CM', idea: 'Bolsas dulces y guirnaldas.' }
  ], []);

  const monthTheme = useMemo(() => {
    const m = viewDate.getMonth();
    const h = settings.hemisphere;
    const isSummer = h === 'Sur' ? [11,0,1].includes(m) : [5,6,7].includes(m);
    const event = perpetualEvents.find(e => e.m === m) || { t: 'Campaña Mensual', idea: 'Stickers y papelería' };
    return {
      season: isSummer ? 'Verano' : 'Invierno',
      sPal: isSummer ? ['#FFD700', '#FF8C00', '#00BFFF', '#FFFFFF'] : ['#191970', '#4169E1', '#87CEEB', '#F0F8FF'],
      eName: event.t,
      eIdea: event.idea,
      ePal: ['#E11D48', '#FB7185', '#FFF1F2', '#9F1239']
    };
  }, [viewDate, settings, perpetualEvents]);

  const monthlyMetrics = useMemo(() => {
    const m = viewDate.getMonth();
    const currentSales = clients.filter(c => new Date(c.date).getMonth() === m);
    const totalC = currentSales.filter(c => c.status === 'Cobrado').reduce((a, b) => a + b.amount, 0);
    const totalG = expenses.reduce((a, b) => a + b.amount, 0);
    const hrs = (tasks.reduce((a, b) => a + (b.timeSpent || 0), 0) / 3600).toFixed(1);
    return { cobrado: totalC, gastos: totalG, neta: totalC - totalG, horas: hrs };
  }, [clients, expenses, tasks, viewDate]);

  const lowStock = useMemo(() => inventory.filter(i => i.qty <= 5), [inventory]);

  // --- 8. COMPONENTES DE INTERFAZ ---
  const NavItem = ({ id, label, icon: Icon }) => (
    <button onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-black text-[11px] uppercase tracking-tighter ${activeTab === id ? 'bg-[#E11D48] text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-300 ${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-[#fcfcfc] text-slate-800'}`}>
      
      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col z-50 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 text-center border-b dark:border-slate-700">
          <div className="p-3 rounded-2xl bg-[#E11D48] text-white shadow-xl rotate-3 mb-4 inline-block"><Star className="w-6 h-6 fill-current" /></div>
          <h1 className="font-black text-2xl tracking-tighter uppercase italic">MC Pro <span className="text-[#E11D48]">v2</span></h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">{settings.userName} • {settings.city}</p>
        </div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {[{id:'dashboard', label:'Escritorio', icon:Layout}, {id:'clients', label:'Ventas', icon:DollarSign}, {id:'checklist', label:'Taller', icon:ClipboardList}, {id:'inventory', label:'Insumos', icon:Package}, {id:'logistics', label:'Envíos', icon:Truck}, {id:'planner', label:'Calendario', icon:CalendarIcon}, {id:'agenda', label:'Clientes Pro', icon:UserPlus}, {id:'calculator', label:'Cotizador', icon:Calculator}, {id:'settings', label:'Ajustes', icon:Palette}].map(item => <NavItem key={item.id} {...item} />)}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        {notification && <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-[#E11D48] text-white px-8 py-4 rounded-full font-black text-[11px] uppercase shadow-2xl z-[100] animate-bounce">{notification}</div>}

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 text-slate-400 mb-2"><MapPin className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">{settings.city}, {settings.country}</span></div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{activeTab.toUpperCase()}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700">{darkMode ? <Sun className="text-amber-400"/> : <Moon />}</button>
            <div className="bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl shadow-sm border dark:border-slate-700">
              <p className="text-[9px] text-slate-400 font-black uppercase">Hora Actual</p>
              <p className="font-black text-xl">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </div>
        </header>

        {/* --- DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            {lowStock.length > 0 && (
              <div className="bg-rose-500 text-white p-8 rounded-[3rem] shadow-xl flex items-center justify-between border-4 border-white">
                <div className="flex items-center gap-6"><AlertCircle className="w-10 h-10" /><div><h4 className="text-xl font-black uppercase italic">¡Reponer Insumos!</h4><p className="text-[10px] font-bold uppercase opacity-80">Hay {lowStock.length} materiales por agotarse.</p></div></div>
                <button onClick={() => setActiveTab('inventory')} className="bg-white text-rose-500 px-6 py-3 rounded-2xl font-black text-[10px] uppercase">Ver Insumos</button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] shadow-sm border dark:border-slate-700 col-span-2">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2"><Palette className="w-4 h-4 text-[#E11D48]"/> Laboratorio de Color • {monthTheme.season}</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-3">Estacional</p>
                    <div className="flex h-16 rounded-2xl overflow-hidden shadow-inner">
                      {monthTheme.sPal.map(c => <button key={c} onClick={() => {navigator.clipboard.writeText(c); notify(`Copiado ${c}`)}} className="flex-1 hover:scale-110 transition-transform" style={{backgroundColor: c}} />)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-[#E11D48] mb-3">Evento: {monthTheme.eName}</p>
                    <div className="flex h-16 rounded-2xl overflow-hidden shadow-inner">
                      {monthTheme.ePal.map(c => <button key={c} onClick={() => {navigator.clipboard.writeText(c); notify(`Copiado ${c}`)}} className="flex-1 hover:scale-110 transition-transform" style={{backgroundColor: c}} />)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E11D48]/20 blur-3xl" />
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Ganancia Neta Mes</p>
                <div><p className="text-6xl font-black italic tracking-tighter leading-none">{settings.currency}{monthlyMetrics.neta}</p><p className="text-[10px] font-bold text-slate-400 uppercase mt-4 italic">Total de caja limpia</p></div>
                <button onClick={() => setShowSummaryModal(true)} className="mt-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-[10px] uppercase transition-all">Ver Reporte</button>
              </div>
            </div>
          </div>
        )}

        {/* --- TALLER (CHECKLIST + TIMER) --- */}
        {activeTab === 'checklist' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-5">
            <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-sm border dark:border-slate-700">
              <h3 className="text-xl font-black mb-8 uppercase italic flex items-center gap-3 tracking-tighter"><ClipboardList className="w-7 h-7 text-[#E11D48]"/> Nueva Ficha Técnica</h3>
              <form onSubmit={(e) => saveEntity(e, setTasks, editingTask, setEditingTask, "Tarea")} className="space-y-6">
                <input name="title" required placeholder="Nombre del Trabajo..." defaultValue={editingTask?.title} className="w-full p-5 bg-slate-50 dark:bg-slate-700 rounded-3xl outline-none font-black text-[16px] uppercase shadow-inner" />
                <div className="grid grid-cols-2 gap-4">
                   <input name="material" placeholder="Material (Ej: Vinilo Mate)" defaultValue={editingTask?.material} className="w-full p-5 bg-slate-50 dark:bg-slate-700 rounded-3xl outline-none font-bold" />
                   <button type="submit" className="bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all">Registrar Proyecto</button>
                </div>
              </form>
            </div>
            <div className="space-y-4">
              {tasks.map(t => (
                <div key={t.id} className={`bg-white dark:bg-slate-800 p-8 rounded-[3rem] border dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${t.completed ? 'opacity-40 grayscale' : 'shadow-sm'}`}>
                  <div className="flex items-center gap-6 flex-1">
                    <button onClick={() => setTasks(tasks.map(x => x.id === t.id ? {...x, completed: !x.completed, isRunning: false} : x))} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${t.completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-300'}`}><CheckCircle2 className="w-7 h-7" /></button>
                    <div><h4 className="font-black text-slate-800 dark:text-white uppercase text-[18px] tracking-tighter leading-none">{t.title}</h4><p className="text-[10px] text-slate-400 font-black uppercase mt-2">{t.material || 'General'}</p></div>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-[2.5rem] border dark:border-slate-700">
                    <div className="text-center px-4"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Cronómetro</p><p className={`font-mono text-xl font-black ${t.isRunning ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`}>{formatTime(t.timeSpent)}</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => setTasks(tasks.map(x => x.id === t.id ? {...x, isRunning: !x.isRunning} : x))} className={`p-4 rounded-2xl ${t.isRunning ? 'bg-amber-400 text-white' : 'bg-slate-900 text-white'}`}>{t.isRunning ? <Clock size={20}/> : <Play size={20}/>}</button>
                      <button onClick={() => setTasks(tasks.map(x => x.id === t.id ? {...x, timeSpent: 0, isRunning: false} : x))} className="p-4 bg-white dark:bg-slate-800 text-slate-300 rounded-2xl border dark:border-slate-700 hover:text-red-500"><RotateCcw size={20}/></button>
                    </div>
                  </div>
                  <button onClick={() => deleteItem(t.id, setTasks, "Tarea")} className="text-slate-200 hover:text-red-500 transition-colors"><Trash2 /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- LOGÍSTICA (DAC / MIRTRANS) --- */}
        {activeTab === 'logistics' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-5">
            <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-sm border dark:border-slate-700">
              <h3 className="text-xl font-black mb-8 uppercase italic flex items-center gap-3 tracking-tighter"><Truck className="w-7 h-7 text-[#E11D48]"/> Despacho de Pedidos</h3>
              <form onSubmit={(e) => saveEntity(e, setShipments, editingShipment, setEditingShipment, "Envío")} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Cliente</label><input name="customer" required className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-[14px]" /></div>
                <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Agencia</label>
                  <select name="agency" className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl font-bold text-[14px] outline-none">
                    <option value="DAC">DAC</option><option value="Mirtrans">Mirtrans</option><option value="UES">UES</option><option value="Correo">Correo UY</option>
                  </select>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Rastreo</label><input name="tracking" className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-[14px]" /></div>
                <button type="submit" className="p-4.5 bg-[#E11D48] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg">Registrar</button>
              </form>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shipments.map(s => (
                <div key={s.id} className="bg-white dark:bg-slate-800 p-8 rounded-[3.5rem] border dark:border-slate-700 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                       <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">{s.agency}</span>
                       <PackageCheck className="text-emerald-500 w-6 h-6" />
                    </div>
                    <h4 className="text-2xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter leading-none mb-4">{s.customer}</h4>
                    <p className="text-[11px] font-mono font-bold text-slate-400 mb-6">REM: {s.tracking || 'PIRIA-PEND'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setPrintingLabel(s)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2"><Printer size={14}/> Etiqueta</button>
                    <button onClick={() => {
                      const msg = `¡Hola ${s.customer}! Tu pedido ya salió por ${s.agency}. Seguimiento: ${s.tracking}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
                    }} className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2"><MessageCircle size={14}/> WA</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- AJUSTES (LOCALIZACIÓN + BACKUP) --- */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
            <div className="bg-white dark:bg-slate-800 p-12 rounded-[3.5rem] shadow-sm border dark:border-slate-700">
              <h3 className="text-2xl font-black mb-10 uppercase italic flex items-center gap-4 tracking-tighter text-slate-800 dark:text-white">Configuración del Taller</h3>
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="space-y-4">
                  <div><label className="text-[10px] font-black text-slate-400 uppercase">Nombre de Marca</label><input value={settings.userName} onChange={e => setSettings({...settings, userName: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl font-bold" /></div>
                  <div><label className="text-[10px] font-black text-slate-400 uppercase">Ciudad</label><input value={settings.city} onChange={e => setSettings({...settings, city: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl font-bold" /></div>
                </div>
                <div className="space-y-4">
                  <div><label className="text-[10px] font-black text-slate-400 uppercase">Símbolo Moneda</label><input value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl font-bold text-center" /></div>
                  <div><label className="text-[10px] font-black text-slate-400 uppercase">Hemisferio</label>
                    <select value={settings.hemisphere} onChange={e => setSettings({...settings, hemisphere: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl font-bold">
                      <option value="Sur">Sur (UY/AR/CL)</option><option value="Norte">Norte (ES/MX/US)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-10 bg-slate-50 dark:bg-slate-900 rounded-[3rem] border border-dashed dark:border-slate-700 flex justify-between items-center">
                <div><h4 className="font-black uppercase italic tracking-tighter">Copia de Seguridad</h4><p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Exporta tus datos en formato JSON</p></div>
                <button onClick={exportData} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase flex items-center gap-3"><Save size={16}/> Descargar Backup</button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* --- MODAL IMPRESIÓN ETIQUETA --- */}
      {printingLabel && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4 no-print">
          <div className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl">
            <div id="label-area" className="p-12 text-black">
              <div className="border-4 border-black p-6 space-y-6">
                <div className="border-b-2 border-slate-100 pb-4">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Remitente</p>
                  <p className="font-black text-lg uppercase leading-none">{settings.userName}</p>
                  <p className="text-[11px] font-bold uppercase">{settings.city}, {settings.country}</p>
                </div>
                <div className="py-6">
                  <p className="text-[8px] font-black uppercase tracking-widest text-rose-500">Destinatario</p>
                  <p className="font-black text-3xl uppercase tracking-tighter leading-none mb-2">{printingLabel.customer}</p>
                  <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase">{printingLabel.agency}</span>
                </div>
                <div className="pt-4 border-t-2 border-slate-100 flex justify-between items-end">
                   <p className="text-[9px] font-black italic uppercase">MC PRO LOGISTICS</p>
                   <Star size={20} fill="black" />
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50 flex gap-4">
              <button onClick={() => { window.print(); notify("Imprimiendo..."); }} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl">Imprimir Ahora</button>
              <button onClick={() => setPrintingLabel(null)} className="px-8 py-5 bg-white text-slate-400 rounded-2xl font-black text-[11px] uppercase border border-slate-200">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* CSS PARA IMPRESIÓN */}
      <style>{`
        @media print {
          .no-print, aside, header, main, nav, button { display: none !important; }
          #label-area { position: absolute; top: 0; left: 0; width: 100%; padding: 0 !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
};

export default App;

import ReactDOM from 'react-dom/client';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
