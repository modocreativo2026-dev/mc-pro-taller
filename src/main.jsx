import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Calculator, Package, Calendar as CalendarIcon, ClipboardList, Palette, 
  Plus, Trash2, Clock, Layout, DollarSign, 
  CheckCircle2, Star, Zap, Instagram, MessageCircle, 
  StickyNote, Sun, Moon, UserPlus, Menu, TrendingUp, CloudSun, Globe, Truck, Send
} from 'lucide-react';

// --- SISTEMA DE GUARDADO (PERSISTENCIA) ---
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
  // --- ESTADOS GLOBALES ---
  const [activeTab, setActiveTab] = useState('escritorio');
  const [notification, setNotification] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  // --- BASES DE DATOS ---
  const [inventory, setInventory] = usePersistedState('mc_insumos', []);
  const [tasks, setTasks] = usePersistedState('mc_tareas', []);
  const [clients, setClients] = usePersistedState('mc_clientes', []); // Base de clientes
  const [ventas, setVentas] = usePersistedState('mc_ventas', []); // Registro de ventas
  const [gastos, setGastos] = usePersistedState('mc_gastos', []);
  const [envios, setEnvios] = usePersistedState('mc_envios', []); // NUEVO: Envíos DAC/Mirtrans
  const [cotizacion, setCotizacion] = useState({ costo: '', cantidad: 1 });

  // --- CALENDARIO MAESTRO (URUGUAY + PDF COMMUNITY MANAGER) ---
  const perpetualEvents = useMemo(() => [
    // Enero
    { d: 1, m: 0, t: 'Año Nuevo', type: 'UY', info: 'Feriado Nacional' },
    { d: 6, m: 0, t: 'Día de Reyes', type: 'UY', info: 'Laborable' },
    { d: 25, m: 0, t: 'Día de la Publicidad', type: 'CM', info: 'Ideal para promociones' }, 
    // Febrero
    { d: 13, m: 1, t: 'Día Mundial de la Radio', type: 'CM', info: 'Contenido de audio' },
    { d: 14, m: 1, t: 'San Valentín', type: 'CM', info: 'Campaña de enamorados' },
    { d: 20, m: 1, t: 'Día del Gato', type: 'CM', info: 'Contenido viral de mascotas' },
    { d: 28, m: 1, t: 'Carnaval', type: 'UY', info: 'Feriado Laborable (Aprox)' },
    // Marzo
    { d: 8, m: 2, t: 'Día de la Mujer', type: 'CM', info: 'Campaña de concientización' },
    { d: 15, m: 2, t: 'Día del Consumidor', type: 'CM', info: 'Promos especiales' },
    { d: 20, m: 2, t: 'Día de la Felicidad', type: 'CM', info: 'Posts positivos' },
    { d: 27, m: 2, t: 'Día del Teatro', type: 'CM', info: 'Arte y cultura' },
    // Abril
    { d: 15, m: 3, t: 'Día Mundial del Arte', type: 'CM', info: 'Muestra tu proceso' },
    { d: 19, m: 3, t: 'Desembarco de los 33', type: 'UY', info: 'Feriado Laborable' },
    { d: 23, m: 3, t: 'Día del Libro', type: 'CM', info: 'Recomendaciones' },
    { d: 27, m: 3, t: 'Día del Diseño Gráfico', type: 'CM', info: '¡Tu día especial!' },
    // Mayo
    { d: 1, m: 4, t: 'Día del Trabajador', type: 'UY', info: 'Feriado No Laborable' },
    { d: 4, m: 4, t: 'Star Wars Day', type: 'CM', info: 'May the 4th be with you' },
    { d: 17, m: 4, t: 'Día de Internet', type: 'CM', info: 'Ofertas online' },
    { d: 18, m: 4, t: 'Batalla de las Piedras', type: 'UY', info: 'Feriado Laborable' },
    { d: 25, m: 4, t: 'Día de África', type: 'CM', info: 'Según calendario CM' },
    // Junio
    { d: 19, m: 5, t: 'Natalicio de Artigas', type: 'UY', info: 'Feriado Laborable' },
    { d: 30, m: 5, t: 'Día Redes Sociales', type: 'CM', info: 'Estrategia digital' },
    // Julio
    { d: 17, m: 6, t: 'Día del Emoji', type: 'CM', info: 'Dinámicas interactivas' },
    { d: 18, m: 6, t: 'Jura de la Constitución', type: 'UY', info: 'Feriado No Laborable' },
    { d: 21, m: 6, t: 'Día del Perro', type: 'CM', info: 'Contenido de mascotas' },
    // Agosto
    { d: 19, m: 7, t: 'Día de la Fotografía', type: 'CM', info: 'Muestra tus fotos pro' },
    { d: 25, m: 7, t: 'Independencia', type: 'UY', info: 'Feriado No Laborable' },
    { d: 29, m: 7, t: 'Día del Gamer', type: 'CM', info: 'Temática videojuegos' },
    // Septiembre
    { d: 21, m: 8, t: 'Día de la Paz', type: 'CM', info: 'Mensajes positivos' },
    { d: 27, m: 8, t: 'Día del Turismo', type: 'CM', info: 'Promociona Piriápolis' },
    // Octubre
    { d: 1, m: 9, t: 'Día del Café', type: 'CM', info: 'Lifestyle' },
    { d: 12, m: 9, t: 'Día de la Raza', type: 'UY', info: 'Feriado Laborable' },
    { d: 31, m: 9, t: 'Halloween', type: 'CM', info: 'Stickers de terror' },
    // Noviembre
    { d: 2, m: 10, t: 'Día de los Difuntos', type: 'UY', info: 'Laborable' },
    { d: 30, m: 10, t: 'Día del Influencer', type: 'CM', info: 'Colaboraciones' },
    // Diciembre
    { d: 25, m: 11, t: 'Navidad', type: 'UY', info: 'Feriado No Laborable' }
  ], []);

  const [darkMode, setDarkMode] = usePersistedState('mc_dark_mode', false);

  // --- LÓGICA ---
  const themeData = useMemo(() => {
    const m = currentTime.getMonth();
    const isSummer = [11, 0, 1].includes(m);
    const season = isSummer ? 'Verano' : 'Invierno'; // Simplificado para UY
    return { seasonName: season, palette: isSummer ? ['#FFD700', '#FF8C00', '#00BFFF', '#FFFFFF'] : ['#191970', '#4169E1', '#87CEEB', '#F0F8FF'] };
  }, [currentTime]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const chrono = setInterval(() => {
      setTareas(prev => prev.map(t => t.isRunning ? { ...t, tiempo: (t.tiempo || 0) + 1 } : t));
    }, 1000);
    return () => { clearInterval(timer); clearInterval(chrono); };
  }, []);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const saveEntity = (e, setter, name) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = Object.fromEntries(f.entries());
    // Convertir números si existen
    if (data.amount) data.amount = Number(data.amount);
    if (data.cant) data.cant = Number(data.cant);
    if (data.costo) data.costo = Number(data.costo);
    
    setter(prev => [...prev, { id: Date.now(), date: new Date().toLocaleDateString(), ...data }]);
    e.target.reset(); notify(`${name} guardado`);
  };

  const calendarDays = useMemo(() => {
    const y = viewDate.getFullYear(), m = viewDate.getMonth();
    const dInM = new Date(y, m + 1, 0).getDate();
    const firstDay = new Date(y, m, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const days = Array(offset).fill(null);
    for (let i = 1; i <= dInM; i++) days.push(i);
    return days;
  }, [viewDate]);

  const NavItem = ({ id, label, icon: Icon }) => (
    <button onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-[13px] uppercase tracking-tight ${activeTab === id ? 'bg-[#E11D48] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-300'}`}>
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${darkMode ? 'bg-slate-900 text-white' : 'bg-[#fcfcfc] text-slate-800'}`}>
      
      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'} border-r flex flex-col shrink-0 shadow-2xl z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 text-center relative">
          <div className="p-3 rounded-2xl text-white shadow-xl rotate-3 mb-3 inline-block bg-[#E11D48]"><Star className="w-6 h-6 fill-current" /></div>
          <h1 className="font-black text-2xl tracking-tighter uppercase italic">MC Pro <span className="text-[#E11D48]">V2</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">Piriápolis</p>
        </div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <NavItem id="escritorio" label="Escritorio" icon={Layout} />
          <NavItem id="ventas" label="Ventas & Gastos" icon={DollarSign} />
          <NavItem id="envios" label="Envíos (DAC/Mirtrans)" icon={Truck} />
          <NavItem id="taller" label="Taller & Tiempos" icon={ClipboardList} />
          <NavItem id="insumos" label="Inventario" icon={Package} />
          <NavItem id="calendario" label="Calendario 2026" icon={CalendarIcon} />
          <NavItem id="cotizador" label="Cotizador" icon={Calculator} />
          <NavItem id="clientes" label="Base de Clientes" icon={UserPlus} />
        </nav>
        <button onClick={() => setDarkMode(!darkMode)} className="m-6 flex items-center justify-center gap-3 px-4 py-3 text-slate-400 font-bold text-[10px] uppercase border border-slate-200 dark:border-slate-700 rounded-xl">
          {darkMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />} {darkMode ? 'Modo Luz' : 'Modo Noche'}
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
        {notification && <div className="fixed top-10 right-10 bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-[12px] uppercase shadow-2xl z-[100] animate-in slide-in-from-top-4">{notification}</div>}
        
        <header className="flex justify-between items-center mb-8">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white shadow-sm border border-slate-100 rounded-xl text-[#E11D48]"><Menu className="w-6 h-6" /></button>
          <div className={`hidden md:flex items-center gap-4 p-2 pr-6 rounded-2xl border shadow-sm ml-auto ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="bg-amber-50 p-3 rounded-xl text-amber-500"><Sun className="w-5 h-5" /></div>
            <p className="text-lg font-black">{currentTime.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </header>

        {/* ESCRITORIO */}
        {activeTab === 'escritorio' && (
          <div className="space-y-10 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={`p-8 rounded-[2.5rem] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><CloudSun className="w-4 h-4 text-amber-500"/> Paleta {themeData.seasonName}</h3>
                <div className="flex h-16 rounded-3xl overflow-hidden border border-slate-50 shadow-inner">
                  {themeData.palette.map((c, i) => <div key={i} className="flex-1" style={{ backgroundColor: c }} />)}
                </div>
              </div>
              <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 flex flex-col justify-between relative overflow-hidden">
                <h3 className="text-[11px] font-black text-[#E11D48] uppercase tracking-widest mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4"/> Caja Neta</h3>
                <p className="text-6xl font-black text-slate-800 tracking-tighter">
                  ${ventas.reduce((acc, c) => acc + (c.amount || 0), 0) - gastos.reduce((acc, e)
