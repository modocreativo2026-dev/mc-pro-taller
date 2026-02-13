import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Calculator, Package, Calendar as CalendarIcon, ClipboardList, Palette, Plus, Trash2, Clock, Layout, DollarSign, CheckCircle2, Star, Zap, Instagram, MessageCircle, StickyNote, Sun, Moon, UserPlus, Menu, TrendingUp, CloudSun, Globe, Truck, Send } from 'lucide-react';

// --- UTILIDADES ---
const usePersistedState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : defaultValue; } 
    catch (e) { return defaultValue; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);
  return [state, setState];
};

const formatTime = (seconds = 0) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const App = () => {
  const [activeTab, setActiveTab] = useState('escritorio');
  const [notification, setNotification] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  // --- DATOS ---
  const [inventory, setInventory] = usePersistedState('mc_insumos', []);
  const [tasks, setTasks] = usePersistedState('mc_tareas', []);
  const [clients, setClients] = usePersistedState('mc_clientes', []);
  const [ventas, setVentas] = usePersistedState('mc_ventas', []);
  const [gastos, setGastos] = usePersistedState('mc_gastos', []);
  const [envios, setEnvios] = usePersistedState('mc_envios', []);
  const [cotizacion, setCotizacion] = useState({ costo: '', cantidad: 1 });
  const [darkMode, setDarkMode] = usePersistedState('mc_dark_mode', false);

  // --- CALENDARIO (Compacto) ---
  const perpetualEvents = useMemo(() => [
    { d: 1, m: 0, t: 'Año Nuevo', type: 'UY' }, { d: 6, m: 0, t: 'Reyes', type: 'UY' },
    { d: 25, m: 0, t: 'Publicidad', type: 'CM' }, { d: 14, m: 1, t: 'San Valentín', type: 'CM' },
    { d: 20, m: 1, t: 'Día Gato', type: 'CM' }, { d: 28, m: 1, t: 'Carnaval', type: 'UY' },
    { d: 8, m: 2, t: 'Día Mujer', type: 'CM' }, { d: 15, m: 2, t: 'Consumidor', type: 'CM' },
    { d: 19, m: 3, t: '33 Orientales', type: 'UY' }, { d: 27, m: 3, t: 'Diseño Gráfico', type: 'CM' },
    { d: 1, m: 4, t: 'Trabajador', type: 'UY' }, { d: 4, m: 4, t: 'Star Wars', type: 'CM' },
    { d: 18, m: 4, t: 'Batalla Piedras', type: 'UY' }, { d: 19, m: 5, t: 'Natalicio Artigas', type: 'UY' },
    { d: 30, m: 5, t: 'Redes Sociales', type: 'CM' }, { d: 17, m: 6, t: 'Emoji', type: 'CM' },
    { d: 18, m: 6, t: 'Jura Constitución', type: 'UY' }, { d: 19, m: 7, t: 'Fotografía', type: 'CM' },
    { d: 25, m: 7, t: 'Independencia', type: 'UY' }, { d: 29, m: 7, t: 'Gamer', type: 'CM' },
    { d: 27, m: 8, t: 'Turismo', type: 'CM' }, { d: 1, m: 9, t: 'Café', type: 'CM' },
    { d: 12, m: 9, t: 'Día Raza', type: 'UY' }, { d: 31, m: 9, t: 'Halloween', type: 'CM' },
    { d: 2, m: 10, t: 'Difuntos', type: 'UY' }, { d: 30, m: 10, t: 'Influencer', type: 'CM' },
    { d: 25, m: 11, t: 'Navidad', type: 'UY' }
  ], []);

  // --- LÓGICA ---
  const themeData = useMemo(() => {
    const m = currentTime.getMonth();
    const isSummer = [11, 0, 1].includes(m);
    return { seasonName: isSummer ? 'Verano' : 'Invierno', palette: isSummer ? ['#FFD700', '#FF8C00', '#00BFFF', '#FFFFFF'] : ['#191970', '#4169E1', '#87CEEB', '#F0F8FF'] };
  }, [currentTime]);

  const balance = useMemo(() => {
    const v = ventas.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const g = gastos.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    return { total: v - g, in: v, out: g };
  }, [ventas, gastos]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const chrono = setInterval(() => setTasks(p => p.map(t => t.isRunning ? { ...t, tiempo: (t.tiempo || 0) + 1 } : t)), 1000);
    return () => { clearInterval(timer); clearInterval(chrono); };
  }, []);

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 2500); };

  const saveEntity = (e, setter, name) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = Object.fromEntries(f.entries());
    setter(prev => [...prev, { id: Date.now(), date: new Date().toLocaleDateString(), ...data }]);
    e.target.reset(); notify(`${name} guardado`);
  };

  const calendarDays = useMemo(() => {
    const y = viewDate.getFullYear(), m = viewDate.getMonth();
    const dInM = new Date(y, m + 1, 0).getDate();
    const offset = new Date(y, m, 1).getDay() || 7; 
    return Array.from({ length: offset - 1 + dInM }, (_, i) => i < offset - 1 ? null : i - offset + 2);
  }, [viewDate]);

  const NavItem = ({ id, label, icon: Icon }) => (
    <button onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-wider transition-all ${activeTab === id ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'}`}>
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${darkMode ? 'bg-slate-900 text-white' : 'bg-[#f8f9fa] text-slate-800'}`}>
      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'} border-r flex flex-col shrink-0 z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 text-center">
          <div className="p-3 rounded-2xl bg-rose-600 text-white inline-block mb-3 shadow-xl"><Star fill="white" /></div>
          <h1 className="font-black text-2xl italic tracking-tighter">MC Pro <span className="text-rose-600">V2</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Piriápolis</p>
        </div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <NavItem id="escritorio" label="Escritorio" icon={Layout} />
          <NavItem id="ventas" label="Finanzas" icon={DollarSign} />
          <NavItem id="envios" label="Envíos DAC" icon={Truck} />
          <NavItem id="taller" label="Taller" icon={ClipboardList} />
          <NavItem id="insumos" label="Stock" icon={Package} />
          <NavItem id="calendario" label="Agenda 2026" icon={CalendarIcon} />
          <NavItem id="cotizador" label="Cotizador" icon={Calculator} />
          <NavItem id="clientes" label="Clientes" icon={UserPlus} />
        </nav>
        <button onClick={() => setDarkMode(!darkMode)} className="m-6 flex justify-center gap-2 p-3 text-slate-400 font-bold text-[10px] uppercase border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
          {darkMode ? <Sun size={14} /> : <Moon size={14} />} {darkMode ? 'Modo Luz' : 'Modo Noche'}
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
        {notification && <div className="fixed top-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-xl z-50 animate-in fade-in slide-in-from-top-4">{notification}</div>}
        
        <header className="flex justify-between items-center mb-8">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white shadow-sm rounded-xl text-rose-600"><Menu/></button>
          <div className={`hidden md:flex items-center gap-3 p-2 pr-5 rounded-2xl border shadow-sm ml-auto ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="bg-amber-100 p-2 rounded-xl text-amber-600"><Sun size={18} /></div>
            <p className="text-sm font-black">{currentTime.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </header>

        {/* ESCRITORIO */}
        {activeTab === 'escritorio' && (
          <div className="grid md:grid-cols-2 gap-6 animate-in fade-in">
            <div className="bg-rose-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <p className="text-[10px] font-black uppercase opacity-70 mb-2">Caja Neta</p>
              <h2 className="text-6xl font-black italic tracking-tighter">${balance.total}</h2>
              <div className="mt-6 flex gap-6 text-[10px] font-bold uppercase border-t border-white/20 pt-4">
                <span>Ingresos: ${balance.in}</span>
                <span>Gastos: ${balance.out}</span>
              </div>
              <TrendingUp className="absolute bottom-6 right-8 w-16 h-16 opacity-20" />
            </div>
            <div className={`p-8 rounded-[2.5rem] border shadow-sm flex flex-col justify-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Pedidos Activos</h3>
              <p className="text-5xl font-black text-slate-800 dark:text-white">{envios.length}</p>
              <p className="text-[10px] font-bold text-rose-500 mt-2 uppercase">Envíos registrados</p>
            </div>
            <div className={`p-8 rounded-[2.5rem] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><CloudSun className="w-4 h-4 text-amber-500"/> Paleta {themeData.seasonName}</h3>
               <div className="flex h-12 rounded-2xl overflow-hidden shadow-inner">
                 {themeData.palette.map((c, i) => <div key={i} className="flex-1" style={{ backgroundColor: c }} />)}
               </div>
            </div>
          </div>
        )}

        {/* ENVIOS */}
        {activeTab === 'envios' && (
          <div className="max-w-4xl space-y-6 animate-in fade-in">
             <div className={`p-8 rounded-[2.5rem] shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
               <h3 className="text-lg font-black mb-6 uppercase italic flex items-center gap-2"><Truck className="text-rose-600"/> Nuevo Envío</h3>
               <form onSubmit={(e) => saveEntity(e, setEnvios, "Envío")} className="grid md:grid-cols-2 gap-4">
                  <input name="cliente" required placeholder="Cliente" className={`p-3 rounded-xl font-bold outline-none text-sm ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`} />
                  <select name="agencia" className={`p-3 rounded-xl font-bold outline-none text-sm ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}><option>DAC</option><option>Mirtrans</option><option>Correo</option></select>
                  <input name="tracking" placeholder="Rastreo" className={`p-3 rounded-xl font-bold outline-none text-sm ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`} />
                  <input name="costo" type="number" placeholder="$ Costo" className={`p-3 rounded-xl font-bold outline-none text-sm ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`} />
                  <button className="bg-rose-600 text-white rounded-xl font-black uppercase py-3 shadow-lg md:col-span-2 text-xs tracking-widest">Guardar Envío</button>
               </form>
             </div>
             <div className="space-y-3">
               {envios.map(e => (
                 <div key={e.id} className={`p-5 rounded-2xl border flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                   <div><p className="font-black uppercase text-xs">{e.cliente}</p><p className="text-[10px] font-bold text-slate-400">{e.agencia} • {e.tracking}</p></div>
                   <p className="font-black text-rose-600">${e.costo}</p>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* VENTAS */}
        {activeTab === 'ventas' && (
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl animate-in fade-in">
             <div className={`p-6 rounded-[2.5rem] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
               <h3 className="text-xs font-black uppercase text-emerald-500 mb-4">Ingresos</h3>
               <form onSubmit={(e) => saveEntity(e, setVentas, "Venta")} className="flex gap-2 mb-4"><input name="concepto" required placeholder="Producto" className="flex-1 p-3 rounded-xl bg-slate-50 text-xs font-bold" /><input name="amount" type="number" placeholder="$" className="w-16 p-3 rounded-xl bg-slate-50 text-xs font-bold" /><button className="bg-emerald-500 text-white p-3 rounded-xl"><Plus size={16}/></button></form>
               <div className="space-y-2 max-h-60 overflow-y-auto">{ventas.map(c => <div key={c.id} className="flex justify-between text-xs p-3 bg-slate-50 rounded-lg dark:bg-slate-700 dark:text-white"><span className="font-bold">{c.concepto}</span><span className="text-emerald-500">${c.amount}</span></div>)}</div>
             </div>
             <div className={`p-6 rounded-[2.5rem] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
               <h3 className="text-xs font-black uppercase text-rose-500 mb-4">Gastos</h3>
               <form onSubmit={(e) => saveEntity(e, setGastos, "Gasto")} className="flex gap-2 mb-4"><input name="concepto" required placeholder="Gasto" className="flex-1 p-3 rounded-xl bg-slate-50 text-xs font-bold" /><input name="amount" type="number" placeholder="$" className="w-16 p-3 rounded-xl bg-slate-50 text-xs font-bold" /><button className="bg-rose-500 text-white p-3 rounded-xl"><Plus size={16}/></button></form>
               <div className="space-y-2 max-h-60 overflow-y-auto">{gastos.map(e => <div key={e.id} className="flex justify-between text-xs p-3 bg-slate-50 rounded-lg dark:bg-slate-700 dark:text-white"><span className="font-bold">{e.concepto}</span><span className="text-rose-500">-${e.amount}</span></div>)}</div>
             </div>
          </div>
        )}

        {/* CALENDARIO */}
        {activeTab === 'calendario' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in">
            <div className={`xl:col-span-2 p-8 rounded-[2.5rem] shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter">{viewDate.toLocaleDateString('es-UY', { month: 'long', year: 'numeric' })}</h3>
                 <div className="flex gap-2"><button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1))} className="p-2 bg-slate-100 rounded-lg dark:bg-slate-700"><ChevronLeft size={20}/></button><button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1))} className="p-2 bg-slate-100 rounded-lg dark:bg-slate-700"><ChevronRight size={20}/></button></div>
               </div>
               <div className="grid grid-cols-7 gap-2">
                 {['L','M','M','J','V','S','D'].map(d => <span key={d} className="text-center text-[10px] font-bold text-slate-400">{d}</span>)}
                 {calendarDays.map((d, i) => {
                   const ev = d ? perpetualEvents.find(e => e.d === d && e.m === viewDate.getMonth()) : null;
                   return (
                     <div key={i} onClick={() => d && setSelectedDay(d)} className={`h-20 p-2 rounded-xl border transition-all cursor-pointer relative ${d === selectedDay ? 'bg-slate-900 text-white' : 'bg-transparent border-slate-100 hover:bg-slate-50 dark:border-slate-700'}`}>
                       {d && <span className="font-bold text-sm">{d}</span>}
                       {ev && <div className={`w-1.5 h-1.5 rounded-full absolute bottom-2 right-2 ${ev.type === 'UY' ? 'bg-amber-400' : 'bg-rose-500'}`} />}
                     </div>
                   )
                 })}
               </div>
            </div>
            <div className={`p-8 rounded-[2.5rem] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
               <h4 className="text-3xl font-black uppercase italic tracking-tighter mb-4">{selectedDay} {viewDate.toLocaleDateString('es-UY', { month: 'short' })}</h4>
               <div className="space-y-3 max-h-80 overflow-y-auto">
                 {perpetualEvents.filter(e => e.d === selectedDay && e.m === viewDate.getMonth()).map((ev, i) => (
                   <div key={i} className={`p-4 rounded-2xl border ${ev.type === 'UY' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                     <p className="font-black uppercase text-xs">{ev.t}</p>
                     <p className="text-[10px] font-bold mt-1 opacity-70">{ev.type === 'UY' ? 'Feriado Uruguay' : 'Community Manager'}</p>
                   </div>
                 ))}
                 {perpetualEvents.filter(e => e.d === selectedDay && e.m === viewDate.getMonth()).length === 0 && <p className="text-slate-400 text-xs font-bold">Sin eventos.</p>}
               </div>
            </div>
          </div>
        )}

        {/* TALLER */}
        {activeTab === 'taller' && (
          <div className="max-w-3xl space-y-6 animate-in fade-in">
            <form onSubmit={(e) => saveEntity(e, setTasks, "Tarea")} className={`p-4 rounded-2xl border flex gap-3 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
              <input name="title" placeholder="Nueva tarea..." required className="flex-1 bg-transparent font-bold outline-none text-sm px-2" />
              <button className="bg-slate-900 text-white px-6 rounded-xl font-bold text-xs uppercase">Crear</button>
            </form>
            <div className="space-y-3">
              {tasks.map(t => (
                <div key={t.id} className={`p-5 rounded-2xl border flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div><h4 className="font-bold text-xs uppercase">{t.title}</h4><p className={`text-2xl font-mono font-black ${t.isRunning ? 'text-rose-500' : 'text-slate-400'}`}>{formatTime(t.tiempo)}</p></div>
                  <div className="flex gap-2"><button onClick={() => setTasks(p => p.map(x => x.id === t.id ? {...x, isRunning: !x.isRunning} : x))} className={`p-3 rounded-xl ${t.isRunning ? 'bg-amber-400 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>{t.isRunning ? <Clock size={18}/> : <Play size={18}/>}</button><button onClick={() => setTasks(p => p.filter(x => x.id !== t.id))} className="p-3 bg-rose-50 text-rose-500 rounded-xl"><Trash2 size={18}/></button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INSUMOS */}
        {activeTab === 'insumos' && (
          <div className="max-w-4xl space-y-6 animate-in fade-in">
            <form onSubmit={(e) => saveEntity(e, setInventory, "Insumo")} className={`p-6 rounded-[2.5rem] border flex gap-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
              <input name="name" placeholder="Material" required className="flex-1 bg-transparent font-bold outline-none text-sm" />
              <input name="cant" type="number" placeholder="Cant." required className="w-20 bg-transparent font-bold outline-none text-sm" />
              <button className="bg-slate-900 text-white px-6 rounded-xl font-black uppercase text-[10px]">Agregar</button>
            </form>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {inventory.map(i => (
                <div key={i.id} className={`p-4 rounded-2xl border flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <span className="font-bold text-xs uppercase truncate">{i.name}</span>
                  <div className="flex items-center gap-2"><span className={`font-black ${i.cant <= 2 ? 'text-rose-500' : 'text-emerald-500'}`}>{i.cant}</span><button onClick={() => setInventory(p => p.filter(x => x.id !== i.id))} className="text-slate-300 hover:text-rose-500"><Trash2 size={14}/></button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OTROS MÓDULOS (Cotizador / Clientes) */}
        {activeTab === 'cotizador' && (
          <div className={`max-w-lg p-10 rounded-[3rem] border shadow-xl mx-auto mt-10 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <h2 className="text-xl font-black italic uppercase mb-6 text-center">Cotizador</h2>
            <div className="space-y-4">
              <div><label className="text-[10px] font-bold uppercase opacity-50">Costo Base</label><input type="number" value={cotizacion.costo} onChange={(e) => setCotizacion({...cotizacion, costo: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 font-black text-3xl outline-none dark:bg-slate-900" placeholder="0" /></div>
              <div className="pt-6 border-t border-dashed border-slate-200 flex justify-between items-center"><span className="font-bold text-xs uppercase opacity-50">Sugerido (x2)</span><span className="text-5xl font-black text-rose-600 tracking-tighter">${(Number(cotizacion.costo) * 2).toFixed(0)}</span></div>
            </div>
          </div>
        )}

        {activeTab === 'clientes' && (
          <div className="max-w-4xl space-y-6 animate-in fade-in">
            <form onSubmit={(e) => saveEntity(e, setClients, "Cliente")} className={`p-6 rounded-[2.5rem] border flex gap-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
              <input name="nombre" placeholder="Cliente" required className="flex-1 bg-transparent font-bold outline-none text-sm" />
              <input name="telefono" placeholder="Teléfono" className="w-32 bg-transparent font-bold outline-none text-sm" />
              <button className="bg-indigo-600 text-white px-6 rounded-xl font-black uppercase text-[10px]">Guardar</button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {clients.map(c => (
                <div key={c.id} className={`p-5 rounded-2xl border flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div><span className="font-bold text-xs uppercase block">{c.nombre}</span><span className="text-[10px] text-slate-400">{c.telefono}</span></div>
                  <button onClick={() => setClients(p => p.filter(x => x.id !== c.id))} className="text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
