import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Calculator, Package, Calendar as CalendarIcon, ClipboardList, Palette, 
  Plus, Trash2, Clock, Layout, DollarSign, Star, Sun, Moon, UserPlus, 
  Menu, TrendingUp, CloudSun, Globe, Truck, Zap, MessageCircle, Gift, StickyNote
} from 'lucide-react';

// --- PERSISTENCIA ---
const usePersistedState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : defaultValue; } 
    catch (e) { return defaultValue; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);
  return [state, setState];
};

const App = () => {
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  // --- DATOS ---
  const [inventory, setInventory] = usePersistedState('mc_inventory', []);
  const [tasks, setTasks] = usePersistedState('mc_tasks', []);
  const [clients, setClients] = usePersistedState('mc_clients', []); // Ventas & Cobros
  const [personalEvents, setPersonalEvents] = usePersistedState('mc_personal_events', {});
  const [calc, setCalc] = useState({ costo: '', cantidad: 1 });
  const [darkMode, setDarkMode] = usePersistedState('mc_dark_mode', false);

  // --- AGENDA COMPLETA (UY + CM 2026) ---
  const perpetualEvents = useMemo(() => [
    { d: 1, m: 0, t: 'Año Nuevo', type: 'UY', info: 'Feriado' }, { d: 6, m: 0, t: 'Reyes', type: 'UY', info: 'Laborable' },
    { d: 25, m: 0, t: 'Publicidad', type: 'CM', info: 'Creatividad' }, { d: 14, m: 1, t: 'San Valentín', type: 'INT', info: 'Amor' },
    { d: 20, m: 1, t: 'Gato', type: 'INT', info: 'Mascotas' }, { d: 28, m: 1, t: 'Carnaval', type: 'UY', info: 'Feriado' },
    { d: 8, m: 2, t: 'Mujer', type: 'INT', info: '8M' }, { d: 15, m: 2, t: 'Consumidor', type: 'CM', info: 'Derechos' },
    { d: 20, m: 2, t: 'Felicidad', type: 'INT', info: 'Positivo' }, { d: 21, m: 2, t: 'Creatividad', type: 'CM', info: 'Ideas' },
    { d: 15, m: 3, t: 'Arte', type: 'INT', info: 'Inspiración' }, { d: 19, m: 3, t: '33 Orientales', type: 'UY', info: 'Patrio' },
    { d: 23, m: 3, t: 'Libro', type: 'INT', info: 'Lectura' }, { d: 27, m: 3, t: 'Diseño Gráfico', type: 'CM', info: 'Tu día' },
    { d: 1, m: 4, t: 'Trabajador', type: 'UY', info: 'Feriado' }, { d: 4, m: 4, t: 'Star Wars', type: 'CM', info: 'May the 4th' },
    { d: 17, m: 4, t: 'Internet', type: 'CM', info: 'Redes' }, { d: 18, m: 4, t: 'Batalla Piedras', type: 'UY', info: 'Patrio' },
    { d: 19, m: 5, t: 'Natalicio Artigas', type: 'UY', info: 'Patrio' }, { d: 25, m: 5, t: 'Orgullo Friki', type: 'CM', info: 'Geek' },
    { d: 30, m: 5, t: 'Redes Sociales', type: 'CM', info: 'Social Media' }, { d: 17, m: 6, t: 'Emoji', type: 'CM', info: 'Visual' },
    { d: 18, m: 6, t: 'Jura Constitución', type: 'UY', info: 'Feriado' }, { d: 21, m: 6, t: 'Perro', type: 'INT', info: 'Mascotas' },
    { d: 19, m: 7, t: 'Fotografía', type: 'CM', info: 'Fotos' }, { d: 25, m: 7, t: 'Independencia', type: 'UY', info: 'Feriado' },
    { d: 19, m: 8, t: 'Fotografía', type: 'CM', info: 'Captura' }, { d: 25, m: 8, t: 'Independencia', type: 'UY', info: 'Patrio' },
    { d: 29, m: 8, t: 'Gamer', type: 'CM', info: 'Videojuegos' }, { d: 21, m: 8, t: 'Primavera', type: 'UY', info: 'Estudiante' },
    { d: 27, m: 8, t: 'Turismo', type: 'CM', info: 'Viajes' }, { d: 1, m: 9, t: 'Café', type: 'CM', info: 'Coffee' },
    { d: 12, m: 9, t: 'Raza', type: 'UY', info: 'Cultural' }, { d: 31, m: 9, t: 'Halloween', type: 'CM', info: 'Terror' },
    { d: 2, m: 10, t: 'Difuntos', type: 'UY', info: 'Memoria' }, { d: 19, m: 10, t: 'Mujer Emprendedora', type: 'CM', info: 'Negocios' },
    { d: 30, m: 10, t: 'Influencer', type: 'CM', info: 'Redes' }, { d: 25, m: 11, t: 'Navidad', type: 'UY', info: 'Familia' }
  ], []);

  // --- LÓGICA DE TEMA (Tu código original) ---
  const themeData = useMemo(() => {
    const month = currentTime.getMonth();
    const seasons = { Verano: [11, 0, 1], Otoño: [2, 3, 4], Invierno: [5, 6, 7], Primavera: [8, 9, 10] };
    const season = Object.keys(seasons).find(key => seasons[key].includes(month)) || 'Verano';
    const seasonalPalettes = {
      'Verano': ['#FFD700', '#FF8C00', '#00BFFF', '#FFFFFF'], 'Otoño': ['#8B4513', '#D35400', '#CD853F', '#FAF3E0'],
      'Invierno': ['#191970', '#4169E1', '#87CEEB', '#F0F8FF'], 'Primavera': ['#FF69B4', '#32CD32', '#BA68C8', '#FFF0F5']
    };
    const campaignPalettes = {
      'Vuelta a Clases': ['#E11D48', '#FFD700', '#2563EB', '#10B981'], 'San Valentín': ['#E11D48', '#FB7185', '#F43F5E', '#881337'],
      'Mes de la Mujer': ['#7C3AED', '#A78BFA', '#C084FC', '#4C1D95'], 'Campaña Creativa': ['#F472B6', '#60A5FA', '#34D399', '#FBBF24']
    };
    const campaign = month === 0 ? 'Vuelta a Clases' : month === 1 ? 'San Valentín' : month === 2 ? 'Mes de la Mujer' : 'Campaña Creativa';
    return { seasonName: season, campaignName: campaign, seasonalPalette: seasonalPalettes[season], campaignPalette: campaignPalettes[campaign], primaryColor: campaignPalettes[campaign][0] };
  }, [currentTime]);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 2500); };

  const saveEntity = (e, setter, name) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    if (d.amount) d.amount = Number(d.amount);
    setter(p => [...p, { id: Date.now(), ...d }]);
    e.target.reset(); notify(`${name} guardado`);
  };

  const deleteItem = (id, setter, name) => { setter(p => p.filter(i => i.id !== id)); notify(`${name} eliminado`); };

  const calendarDays = useMemo(() => {
    const y = viewDate.getFullYear(), m = viewDate.getMonth();
    const dInM = new Date(y, m + 1, 0).getDate();
    const offset = new Date(y, m, 1).getDay() || 7;
    return Array.from({ length: offset - 1 + dInM }, (_, i) => i < offset - 1 ? null : i - offset + 2);
  }, [viewDate]);

  const getDayKey = (d) => `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  const NavItem = ({ id, label, icon: Icon }) => (
    <button onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-[13px] uppercase tracking-tight ${activeTab === id ? 'bg-[#E11D48] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
      <Icon className="w-5 h-5" /> {label}
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#fcfcfc] text-slate-800 font-sans">
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-slate-100 flex flex-col shrink-0 shadow-2xl z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 text-center relative">
          <div className="p-3 rounded-2xl bg-[#E11D48] text-white shadow-xl rotate-3 mb-3 inline-block"><Star className="w-6 h-6 fill-current" /></div>
          <h1 className="font-black text-2xl tracking-tighter uppercase italic text-slate-800">MC Pro</h1>
          <p className="text-[10px] font-bold text-[#E11D48] uppercase tracking-[0.4em] mt-1">Modo Creativo</p>
        </div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <NavItem id="dashboard" label="Escritorio" icon={Layout} />
          <NavItem id="clients" label="Ventas & Cobros" icon={DollarSign} />
          <NavItem id="planner" label="Calendario" icon={CalendarIcon} />
          <NavItem id="inventory" label="Inventario" icon={Package} />
          <NavItem id="checklist" label="Taller" icon={ClipboardList} />
          <NavItem id="calculator" label="Cotizador" icon={Calculator} />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
        {notification && <div className="fixed top-10 right-10 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-[12px] uppercase shadow-2xl z-[100] animate-in slide-in-from-top-4">{notification}</div>}
        <header className="flex justify-between items-center mb-12">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white shadow-sm border border-slate-100 rounded-xl text-[#E11D48]"><Menu className="w-6 h-6" /></button>
          <div className="hidden md:flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl border border-slate-100 shadow-sm ml-auto">
            <div className="bg-amber-50 p-3 rounded-xl text-amber-500"><Sun className="w-5 h-5" /></div>
            <p className="text-lg font-black text-slate-800">{currentTime.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><CloudSun className="w-4 h-4 text-amber-500"/> Tendencia UY ({themeData.seasonName})</h3>
                <div className="flex h-16 rounded-3xl overflow-hidden border border-slate-50 shadow-inner">
                  {themeData.seasonalPalette.map((c, i) => <div key={i} className="flex-1 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />)}
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Palette className="w-4 h-4 text-[#E11D48]"/> Campaña ({themeData.campaignName})</h3>
                <div className="flex h-16 rounded-3xl overflow-hidden border border-slate-50 shadow-inner">
                  {themeData.campaignPalette.map((c, i) => <div key={i} className="flex-1 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-between shadow-xl col-span-1 lg:col-span-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Clock className="w-24 h-24" /></div>
                <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Clock className="w-4 h-4"/> Próximo Evento</h3>
                <div>
                  {(() => {
                    const next = perpetualEvents.find(e => (e.m === currentTime.getMonth() && e.d >= currentTime.getDate()) || e.m > currentTime.getMonth()) || perpetualEvents[0];
                    return ( <div className="space-y-1"><p className="text-3xl font-black uppercase italic tracking-tighter leading-tight">{next.t}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{next.d} / {next.m + 1} • {next.type}</p></div> );
                  })()}
                </div>
                <button onClick={() => setActiveTab('planner')} className="mt-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all">Ver Calendario</button>
              </div>
              <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 flex flex-col justify-between relative lg:col-span-2">
                <h3 className="text-[11px] font-black text-[#E11D48] uppercase tracking-widest mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4"/> Ventas Mes</h3>
                <div><p className="text-6xl font-black text-slate-800 tracking-tighter leading-none">${clients.reduce((acc, c) => acc + (c.amount || 0), 0)}</p><p className="text-[11px] font-bold text-slate-500 uppercase mt-2 tracking-widest italic">Total Facturado</p></div>
                <div className="absolute bottom-6 right-8 text-rose-200"><TrendingUp className="w-12 h-12" /></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'planner' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 animate-in fade-in">
            <div className="xl:col-span-2 bg-white p-8 rounded-[3.5rem] shadow-2xl border border-slate-100">
               <div className="flex justify-between items-center mb-8">
                 <h3 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">{viewDate.toLocaleDateString('es-UY', { month: 'long', year: 'numeric' })}</h3>
                 <div className="flex gap-4"><button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-4 bg-slate-50 rounded-2xl"><ChevronLeft/></button><button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-4 bg-slate-50 rounded-2xl"><ChevronRight/></button></div>
               </div>
               <div className="grid grid-cols-7 gap-4">
                 {['L','M','M','J','V','S','D'].map(d => <span key={d} className="text-center text-[10px] font-black text-slate-300 uppercase">{d}</span>)}
                 {calendarDays.map((d, i) => {
                   const ev = d ? perpetualEvents.filter(e => e.d === d && e.m === viewDate.getMonth()) : [];
                   return (
                     <div key={i} onClick={() => d && setSelectedDay(d)} className={`min-h-[100px] p-4 rounded-[2rem] border transition-all cursor-pointer relative ${d === selectedDay ? 'bg-slate-900 text-white scale-105 shadow-xl' : 'bg-white border-slate-50 hover:bg-slate-50'}`}>
                       {d && <span className="text-xl font-black">{d}</span>}
                       <div className="flex gap-1 mt-2 flex-wrap">{ev.map((e, idx) => <div key={idx} className={`w-2 h-2 rounded-full ${e.type === 'UY' ? 'bg-amber-400' : 'bg-[#E11D48]'}`} />)}</div>
                     </div>
                   );
                 })}
               </div>
            </div>
            <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 flex flex-col gap-6">
               <h4 className="text-4xl font-black text-slate-800 uppercase italic tracking-tighter">{selectedDay} {viewDate.toLocaleDateString('es-UY', { month: 'short' })}</h4>
               <div className="space-y-4 flex-1 overflow-y-auto">
                 {perpetualEvents.filter(e => e.d === selectedDay && e.m === viewDate.getMonth()).map((ev, i) => (
                   <div key={i} className={`p-6 rounded-[2rem] border ${ev.type === 'UY' ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100'}`}>
                     <p className="font-black uppercase text-slate-800 text-sm">{ev.t}</p><p className="text-xs text-slate-500 font-bold mt-1">{ev.info}</p>
                   </div>
                 ))}
                 {personalEvents[getDayKey(selectedDay)] && <div className="p-6 bg-indigo-50 rounded-[2rem] flex justify-between"><span className="text-sm font-bold text-indigo-700">{personalEvents[getDayKey(selectedDay)]}</span><button onClick={() => {const n={...personalEvents}; delete n[getDayKey(selectedDay)]; setPersonalEvents(n);}}><Trash2 size={16}/></button></div>}
                 <form onSubmit={(e) => {e.preventDefault(); const val=e.target.note.value; if(val) setPersonalEvents({...personalEvents, [getDayKey(selectedDay)]: val}); e.target.reset();}} className="flex gap-2"><input name="note" placeholder="Nota..." className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none" /><button className="p-4 bg-slate-900 text-white rounded-2xl"><Plus/></button></form>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-5">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
               <h3 className="text-xl font-black mb-8 uppercase italic flex items-center gap-3"><Plus className="text-[#E11D48]"/> Nueva Venta</h3>
               <form onSubmit={(e) => saveEntity(e, setClients, "Venta")} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <input name="name" required placeholder="Cliente" className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <input name="amount" type="number" required placeholder="Monto $" className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <button type="submit" className="bg-[#E11D48] text-white rounded-2xl font-black uppercase py-4 shadow-lg">Guardar</button>
               </form>
            </div>
            <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
              <table className="w-full text-left"><thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase"><tr><th className="px-10 py-6">Cliente</th><th className="px-10 py-6">Monto</th><th className="px-10 py-6"></th></tr></thead>
              <tbody className="divide-y divide-slate-50">{clients.map(c => (<tr key={c.id}><td className="px-10 py-6 font-black uppercase">{c.name}</td><td className="px-10 py-6 font-black text-[#E11D48]">${c.amount}</td><td className="px-10 py-6 text-center"><button onClick={() => deleteItem(c.id, setClients, "Venta")}><Trash2 className="text-slate-300 hover:text-red-500"/></button></td></tr>))}</tbody></table>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
               <h3 className="text-xl font-black mb-8 uppercase italic flex items-center gap-3"><Package className="text-[#E11D48]"/> Inventario</h3>
               <form onSubmit={(e) => saveEntity(e, setInventory, "Item")} className="flex gap-4">
                  <input name="item" required placeholder="Material" className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <input name="qty" type="number" required placeholder="#" className="w-32 p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <button className="bg-slate-900 text-white px-8 rounded-2xl font-black uppercase">Add</button>
               </form>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{inventory.map(i => <div key={i.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center"><span className="font-bold uppercase">{i.item}</span><div className="flex items-center gap-3"><span className="font-black text-[#E11D48]">{i.qty}</span><button onClick={()=>deleteItem(i.id, setInventory, "Item")}><Trash2 size={16} className="text-slate-300"/></button></div></div>)}</div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="max-w-xl space-y-8 animate-in zoom-in-95 mx-auto mt-10">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl text-center">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Cotizador</h2>
              <input type="number" value={calc.costo} onChange={(e) => setCalc({...calc, costo: e.target.value})} className="w-full bg-slate-50 p-6 rounded-3xl text-4xl font-black outline-none text-center mb-6" placeholder="Costo Base" />
              <div className="pt-8 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400">Precio Sugerido (x2)</p>
                <p className="text-6xl font-black text-[#E11D48] tracking-tighter">${(Number(calc.costo) * 2).toFixed(0)}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
