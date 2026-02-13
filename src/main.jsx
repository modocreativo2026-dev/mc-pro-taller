import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Calculator, Package, Calendar as CalendarIcon, ClipboardList, Palette, 
  Plus, Trash2, Clock, Layout, DollarSign, Star, Zap, Instagram, MessageCircle, 
  StickyNote, Sun, Moon, UserPlus, Menu, TrendingUp, CloudSun, Truck, CheckCircle2
} from 'lucide-react';

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

  // --- BASES DE DATOS ---
  const [inventory, setInventory] = usePersistedState('mc_insumos', []);
  const [tasks, setTasks] = usePersistedState('mc_tareas', []);
  const [clients, setClients] = usePersistedState('mc_clientes', []);
  const [ventas, setVentas] = usePersistedState('mc_ventas', []);
  const [gastos, setGastos] = usePersistedState('mc_gastos', []);
  const [envios, setEnvios] = usePersistedState('mc_envios', []);
  const [cotizacion, setCotizacion] = useState({ costo: '', cantidad: 1 });
  const [darkMode, setDarkMode] = usePersistedState('mc_dark_mode', false);

  // --- CALENDARIO 2026 (UY + PDF CM) ---
  const perpetualEvents = useMemo(() => [
    { d: 1, m: 0, t: 'Año Nuevo', type: 'UY', info: 'Feriado' }, { d: 6, m: 0, t: 'Reyes', type: 'UY', info: 'Laborable' },
    { d: 25, m: 0, t: 'Publicidad', type: 'CM', info: 'Promo' }, { d: 14, m: 1, t: 'San Valentín', type: 'CM', info: 'Amor' },
    { d: 20, m: 1, t: 'Día Gato', type: 'CM', info: 'Viral' }, { d: 28, m: 1, t: 'Carnaval', type: 'UY', info: 'Feriado' },
    { d: 8, m: 2, t: 'Día Mujer', type: 'CM', info: '8M' }, { d: 15, m: 2, t: 'Consumidor', type: 'CM', info: 'Ventas' },
    { d: 20, m: 2, t: 'Felicidad', type: 'CM', info: 'Post' }, { d: 27, m: 2, t: 'Teatro', type: 'CM', info: 'Arte' },
    { d: 15, m: 3, t: 'Día Arte', type: 'CM', info: 'Creativo' }, { d: 19, m: 3, t: '33 Orientales', type: 'UY', info: 'Laborable' },
    { d: 23, m: 3, t: 'Día Libro', type: 'CM', info: 'Cultura' }, { d: 27, m: 3, t: 'Diseño Gráfico', type: 'CM', info: 'Tu día' },
    { d: 1, m: 4, t: 'Trabajador', type: 'UY', info: 'Feriado' }, { d: 4, m: 4, t: 'Star Wars', type: 'CM', info: 'Geek' },
    { d: 18, m: 4, t: 'Batalla Piedras', type: 'UY', info: 'Patrio' }, { d: 25, m: 4, t: 'Orgullo Friki', type: 'CM', info: 'Pop' },
    { d: 19, m: 5, t: 'Natalicio Artigas', type: 'UY', info: 'Patrio' }, { d: 30, m: 5, t: 'Redes Sociales', type: 'CM', info: 'Digital' },
    { d: 17, m: 6, t: 'Emoji', type: 'CM', info: 'Fun' }, { d: 18, m: 6, t: 'Jura Constitución', type: 'UY', info: 'Feriado' },
    { d: 21, m: 6, t: 'Día Perro', type: 'CM', info: 'Viral' }, { d: 19, m: 7, t: 'Fotografía', type: 'CM', info: 'Visual' },
    { d: 25, m: 7, t: 'Independencia', type: 'UY', info: 'Feriado' }, { d: 29, m: 7, t: 'Gamer', type: 'CM', info: 'Juegos' },
    { d: 21, m: 8, t: 'Día Paz', type: 'CM', info: 'Social' }, { d: 27, m: 8, t: 'Turismo', type: 'CM', info: 'Viajes' },
    { d: 1, m: 9, t: 'Café', type: 'CM', info: 'Relax' }, { d: 12, m: 9, t: 'Día Raza', type: 'UY', info: 'Laborable' },
    { d: 31, m: 9, t: 'Halloween', type: 'CM', info: 'Terror' }, { d: 2, m: 10, t: 'Difuntos', type: 'UY', info: 'Laborable' },
    { d: 30, m: 10, t: 'Influencer', type: 'CM', info: 'Colabs' }, { d: 25, m: 11, t: 'Navidad', type: 'UY', info: 'Fiestas' }
  ], []);

  // --- LÓGICA ---
  const themeData = useMemo(() => {
    const m = currentTime.getMonth();
    const isSummer = [11, 0, 1].includes(m);
    return { season: isSummer ? 'Verano' : 'Invierno', colors: isSummer ? ['#FFD700', '#FF8C00', '#00BFFF', '#FFFFFF'] : ['#191970', '#4169E1', '#87CEEB', '#F0F8FF'] };
  }, [currentTime]);

  const balance = useMemo(() => {
    const v = ventas.reduce((a, b) => a + (Number(b.amount)||0), 0);
    const g = gastos.reduce((a, b) => a + (Number(b.amount)||0), 0);
    return { net: v - g, in: v, out: g };
  }, [ventas, gastos]);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    const c = setInterval(() => setTasks(p => p.map(x => x.isRunning ? { ...x, tiempo: (x.tiempo || 0) + 1 } : x)), 1000);
    return () => { clearInterval(t); clearInterval(c); };
  }, []);

  const save = (e, setter, type) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    setter(p => [...p, { id: Date.now(), date: new Date().toLocaleDateString(), ...data }]);
    e.target.reset(); setNotification(`${type} guardado`); setTimeout(() => setNotification(null), 3000);
  };

  const days = useMemo(() => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const o = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() || 7;
    return Array.from({ length: o - 1 + d }, (_, i) => i < o - 1 ? null : i - o + 2);
  }, [viewDate]);

  const Btn = ({ id, icon: I, txt }) => (
    <button onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }} className={`w-full flex gap-3 px-4 py-3 rounded-2xl font-bold text-xs uppercase ${activeTab === id ? 'bg-rose-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
      <I size={18} /> {txt}
    </button>
  );

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${darkMode ? 'bg-slate-900 text-white' : 'bg-[#f8f9fa] text-slate-800'}`}>
      <aside className={`fixed lg:static inset-y-0 w-72 ${darkMode ? 'bg-slate-950' : 'bg-white'} border-r z-50 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="p-8 text-center">
          <div className="p-3 bg-rose-600 text-white rounded-2xl inline-block mb-3 shadow-lg"><Star fill="white"/></div>
          <h1 className="font-black text-2xl italic tracking-tighter">MC Pro <span className="text-rose-600">V2</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Piriápolis</p>
        </div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <Btn id="escritorio" icon={Layout} txt="Escritorio" />
          <Btn id="ventas" icon={DollarSign} txt="Finanzas" />
          <Btn id="envios" icon={Truck} txt="Envíos DAC" />
          <Btn id="taller" icon={ClipboardList} txt="Taller" />
          <Btn id="insumos" icon={Package} txt="Stock" />
          <Btn id="calendario" icon={CalendarIcon} txt="Agenda 2026" />
          <Btn id="cotizador" icon={Calculator} txt="Cotizador" />
          <Btn id="clientes" icon={UserPlus} txt="Clientes" />
        </nav>
        <button onClick={() => setDarkMode(!darkMode)} className="m-6 p-3 border rounded-xl text-xs font-bold uppercase text-slate-400 flex justify-center gap-2">
          {darkMode ? <Sun size={14}/> : <Moon size={14}/>} {darkMode ? 'Luz' : 'Noche'}
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
        {notification && <div className="fixed top-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-xl z-50 animate-in slide-in-from-top">{notification}</div>}
        <header className="flex justify-between items-center mb-8">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2"><Menu/></button>
          <div className="ml-auto flex items-center gap-3 p-2 border rounded-2xl shadow-sm bg-white dark:bg-slate-800 dark:border-slate-700">
            <div className="bg-amber-100 p-2 rounded-xl text-amber-600"><Sun size={18}/></div>
            <p className="font-black text-sm pr-2">{currentTime.toLocaleTimeString('es-UY', {hour:'2-digit', minute:'2-digit'})}</p>
          </div>
        </header>

        {activeTab === 'escritorio' && (
          <div className="grid md:grid-cols-2 gap-6 animate-in fade-in">
            <div className="bg-rose-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <p className="text-[10px] font-black uppercase opacity-70 mb-2">Caja Neta</p>
              <h2 className="text-6xl font-black tracking-tighter">${balance.net}</h2>
              <div className="mt-6 flex gap-6 text-[10px] font-bold uppercase border-t border-white/20 pt-4">
                <span>Ingresos: ${balance.in}</span><span>Gastos: ${balance.out}</span>
              </div>
              <TrendingUp className="absolute bottom-6 right-8 w-16 h-16 opacity-20" />
            </div>
            <div className={`p-8 rounded-[2.5rem] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
               <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 flex items-center gap-2"><CloudSun size={16} className="text-amber-500"/> Paleta {themeData.season}</h3>
               <div className="flex h-12 rounded-2xl overflow-hidden shadow-inner">
                 {themeData.colors.map((c, i) => <div key={i} className="flex-1" style={{ backgroundColor: c }} />)}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'envios' && (
          <div className="max-w-4xl space-y-6 animate-in fade-in">
             <div className={`p-8 rounded-[2.5rem] shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
               <h3 className="text-lg font-black mb-6 uppercase italic flex items-center gap-2"><Truck className="text-rose-600"/> Nuevo Envío</h3>
               <form onSubmit={(e) => save(e, setEnvios, "Envío")} className="grid md:grid-cols-2 gap-4">
                  <input name="cliente" required placeholder="Cliente" className="p-3 rounded-xl font-bold text-sm bg-slate-50 dark:bg-slate-700 outline-none" />
                  <select name="agencia" className="p-3 rounded-xl font-bold text-sm bg-slate-50 dark:bg-slate-700 outline-none"><option>DAC</option><option>Mirtrans</option><option>Correo</option></select>
                  <input name="tracking" placeholder="Rastreo" className="p-3 rounded-xl font-bold text-sm bg-slate-50 dark:bg-slate-700 outline-none" />
                  <input name="costo" type="number" placeholder="$ Costo" className="p-3 rounded-xl font-bold text-sm bg-slate-50 dark:bg-slate-700 outline-none" />
                  <button className="bg-rose-600 text-white rounded-xl font-black uppercase py-3 shadow-lg md:col-span-2 text-xs">Guardar</button>
               </form>
             </div>
             <div className="space-y-3">
               {envios.map(e => (
                 <div key={e.id} className={`p-5 rounded-2xl border flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                   <div><p className="font-black uppercase text-xs">{e.cliente}</p><p className="text-[10px] text-slate-400">{e.agencia} • {e.tracking}</p></div>
                   <p className="font-black text-rose-600">${e.costo}</p>
                 </div>
               ))}
             </div>
          </div>
        )}

        {activeTab === 'ventas' && (
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl animate-in fade-in">
             <div className={`p-6 rounded-[2.5rem] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
               <h3 className="text-xs font-black uppercase text-emerald-500 mb-4">Ingresos</h3>
               <form onSubmit={(e) => save(e, setVentas, "Venta")} className="flex gap-2 mb-4"><input name="concepto" placeholder="Producto" className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 text-xs font-bold" /><input name="amount" type="number" placeholder="$" className="w-16 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 text-xs font-bold" /><button className="bg-emerald-500 text-white p-3 rounded-xl"><Plus size={16}/></button></form>
               <div className="space-y-2 max-h-60 overflow-y-auto">{ventas.map(c => <div key={c.id} className="flex justify-between text-xs p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"><span className="font-bold">{c.concepto}</span><span className="text-emerald-500">${c.amount}</span></div>)}</div>
             </div>
             <div className={`p-6 rounded-[2.5rem] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
               <h3 className="text-xs font-black uppercase text-rose-500 mb-4">Gastos</h3>
               <form onSubmit={(e) => save(e, setGastos, "Gasto")} className="flex gap-2 mb-4"><input name="concepto" placeholder="Gasto" className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 text-xs font-bold" /><input name="amount" type="number" placeholder="$" className="w-16 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 text-xs font-bold" /><button className="bg-rose-500 text-white p-3 rounded-xl"><Plus size={16}/></button></form>
               <div className="space-y-2 max-h-60 overflow-y-auto">{gastos.map(e => <div key={e.id} className="flex justify-between text-xs p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"><span className="font-bold">{e.concepto}</span><span className="text-rose-500">-${e.amount}</span></div>)}</div>
             </div>
          </div>
        )}

        {activeTab === 'calendario' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in">
            <div className={`xl:col-span-2 p-8 rounded-[2.5rem] shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter">{viewDate.toLocaleDateString('es-UY', { month: 'long', year: 'numeric' })}</h3>
                 <div className="flex gap-2"><button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1))} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg"><ChevronLeft/></button><button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1))} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg"><ChevronRight/></button></div>
               </div>
               <div className="grid grid-cols-7 gap-2">
                 {['L','M','M','J','V','S','D'].map(d => <span key={d} className="text-center text-[10px] font-bold text-slate-400">{d}</span>)}
                 {days.map((d, i) => {
                   const ev = d ? perpetualEvents.find(e => e.d === d && e.m === viewDate.getMonth()) : null;
                   return (
                     <div key={i} onClick={() => d && setSelectedDay(d)} className={`h-16 p-2 rounded-xl border cursor-pointer relative ${d === selectedDay ? 'bg-slate-900 text-white' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                       {d && <span className="font-bold text-sm">{d}</span>}
                       {ev && <div className={`w-1.5 h-1.5 rounded-full absolute bottom-2 right-2 ${ev.type === 'UY' ? 'bg-amber-400' : 'bg-rose-500'}`} />}
                     </div>
                   )
                 })}
               </div>
            </div>
            <div className={`p-8 rounded-[2.5rem] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
               <h4 className="text-3xl font-black uppercase italic tracking-tighter mb-4">{selectedDay} {viewDate.toLocaleDateString('es-UY', { month: 'short' })}</h4>
               <div className="space-y-3 max-h-80 overflow-y-auto">
                 {perpetualEvents.filter(e => e.d === selectedDay && e.m === viewDate.getMonth()).map((ev, i) => (
                   <div key={i} className={`p-4 rounded-2xl border ${ev.type === 'UY' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                     <p className="font-black uppercase text-xs">{ev.t}</p><p className="text-[10px] font-bold mt-1 opacity-70">{ev.info}</p>
                   </div>
                 ))}
                 {!perpetualEvents.find(e => e.d === selectedDay && e.m === viewDate.getMonth()) && <p className="text-slate-400 text-xs font-bold">Sin eventos.</p>}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'taller' && (
          <div className="max-w-3xl space-y-6 animate-in fade-in">
            <form onSubmit={(e) => save(e, setTasks, "Tarea")} className={`p-4 rounded-2xl border flex gap-3 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
              <input name="title" placeholder="Nueva tarea..." required className="flex-1 bg-transparent font-bold outline-none text-sm px-2" />
              <button className="bg-slate-900 text-white px-6 rounded-xl font-bold text-xs uppercase">Crear</button>
            </form>
            <div className="space-y-3">
              {tasks.map(t => (
                <div key={t.id} className={`p-5 rounded-2xl border flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                  <div><h4 className="font-bold text-xs uppercase">{t.title}</h4><p className={`text-2xl font-mono font-black ${t.isRunning ? 'text-rose-500' : 'text-slate-400'}`}>{formatTime(t.tiempo)}</p></div>
                  <div className="flex gap-2"><button onClick={() => setTasks(p => p.map(x => x.id === t.id ? {...x, isRunning: !x.isRunning} : x))} className={`p-3 rounded-xl ${t.isRunning ? 'bg-amber-400 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>{t.isRunning ? <Clock size={18}/> : <Play size={18}/>}</button><button onClick={() => setTasks(p => p.filter(x => x.id !== t.id))} className="p-3 bg-rose-50 text-rose-500 rounded-xl"><Trash2 size={18}/></button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'insumos' && (
          <div className="max-w-4xl space-y-6 animate-in fade-in">
            <form onSubmit={(e) => save(e, setInventory, "Insumo")} className={`p-6 rounded-[2.5rem] border flex gap-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
              <input name="name" placeholder="Material" required className="flex-1 bg-transparent font-bold outline-none text-sm" />
              <input name="cant" type="number" placeholder="#" required className="w-20 bg-transparent font-bold outline-none text-sm" />
              <button className="bg-slate-900 text-white px-6 rounded-xl font-black uppercase text-[10px]">Agregar</button>
            </form>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {inventory.map(i => (
                <div key={i.id} className={`p-4 rounded-2xl border flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                  <span className="font-bold text-xs uppercase truncate">{i.name}</span>
                  <div className="flex items-center gap-2"><span className={`font-black ${i.cant <= 2 ? 'text-rose-500' : 'text-emerald-500'}`}>{i.cant}</span><button onClick={() => setInventory(p => p.filter(x => x.id !== i.id))} className="text-slate-300 hover:text-rose-500"><Trash2 size={14}/></button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cotizador' && (
          <div className={`max-w-lg p-10 rounded-[3rem] border shadow-xl mx-auto mt-10 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
            <h2 className="text-xl font-black italic uppercase mb-6 text-center">Cotizador</h2>
            <div className="space-y-4">
              <div><label className="text-[10px] font-bold uppercase opacity-50">Costo Base</label><input type="number" value={cotizacion.costo} onChange={(e) => setCotizacion({...cotizacion, costo: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 font-black text-3xl outline-none" placeholder="0" /></div>
              <div className="pt-6 border-t border-dashed border-slate-200 flex justify-between items-center"><span className="font-bold text-xs uppercase opacity-50">Sugerido (x2)</span><span className="text-5xl font-black text-rose-600 tracking-tighter">${(Number(cotizacion.costo) * 2).toFixed(0)}</span></div>
            </div>
          </div>
        )}

        {activeTab === 'clientes' && (
          <div className="max-w-4xl space-y-6 animate-in fade-in">
            <form onSubmit={(e) => save(e, setClients, "Cliente")} className={`p-6 rounded-[2.5rem] border flex gap-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
              <input name="nombre" placeholder="Cliente" required className="flex-1 bg-transparent font-bold outline-none text-sm" />
              <input name="telefono" placeholder="Teléfono" className="w-32 bg-transparent font-bold outline-none text-sm" />
              <button className="bg-indigo-600 text-white px-6 rounded-xl font-black uppercase text-[10px]">Guardar</button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {clients.map(c => (
                <div key={c.id} className={`p-5 rounded-2xl border flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
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
