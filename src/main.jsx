import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Calculator, Package, Calendar as CalendarIcon, ClipboardList, Palette, 
  Plus, Trash2, Clock, MapPin, BarChart3, BookOpen, Users, DollarSign, 
  CheckCircle2, AlertCircle, Edit2, X, Star, Zap, Instagram, MessageCircle, 
  StickyNote, UserPlus, Phone, Layout, Gift, Sparkles, Sun, ChevronLeft, 
  ChevronRight, Save, Moon, Truck, PackageCheck, Printer, Database, Play, RotateCcw
} from 'lucide-react';

// --- PERSISTENCIA Y UTILIDADES ---
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
  // --- ESTADOS PRINCIPALES ---
  const [activeTab, setActiveTab] = useState('escritorio');
  const [darkMode, setDarkMode] = usePersistedState('mc_dark_mode', false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [ventas, setVentas] = usePersistedState('mc_ventas', []);
  const [gastos, setGastos] = usePersistedState('mc_gastos', []);
  const [insumos, setInsumos] = usePersistedState('mc_insumos', []);
  const [tareas, setTareas] = usePersistedState('mc_tareas', []);
  const [envios, setEnvios] = usePersistedState('mc_envios', []);
  const [clientes, setClientes] = usePersistedState('mc_clientes', []);
  
  const [cotizacion, setCotizacion] = useState({ costoBase: '', cantidad: 1, margen: 50 });

  // --- RELOJ Y CRONÓMETRO ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const chrono = setInterval(() => {
      setTareas(prev => prev.map(t => t.isRunning ? { ...t, tiempo: (t.tiempo || 0) + 1 } : t));
    }, 1000);
    return () => { clearInterval(timer); clearInterval(chrono); };
  }, []);

  // --- LÓGICA DE NEGOCIO ---
  const finanzas = useMemo(() => {
    const totalV = ventas.reduce((a, b) => a + (Number(b.monto) || 0), 0);
    const totalG = gastos.reduce((a, b) => a + (Number(b.monto) || 0), 0);
    return { neta: totalV - totalG, totalV, totalG };
  }, [ventas, gastos]);

  const labColor = useMemo(() => {
    const m = currentTime.getMonth();
    const esVerano = [11,0,1].includes(m);
    return {
      temporada: esVerano ? 'Verano' : 'Invierno',
      paletaEstacional: esVerano ? ['#FFD700', '#FF8C00', '#00BFFF', '#FFFFFF'] : ['#191970', '#4169E1', '#87CEEB', '#F0F8FF'],
      paletaCampaña: ['#E11D48', '#FB7185', '#FFF1F2', '#9F1239'] // San Valentín
    };
  }, [currentTime]);

  // --- COMPONENTES ---
  const NavButton = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-[10px] uppercase transition-all ${activeTab === id ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
    >
      <Icon size={16} /> <span className="hidden md:inline">{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* BARRA LATERAL */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-800 border-r dark:border-slate-700 p-6 flex flex-col gap-2 z-50">
        <div className="mb-10 text-center">
          <div className="bg-rose-500 text-white p-3 rounded-2xl inline-block mb-3 rotate-3 shadow-xl"><Star fill="white" /></div>
          <h1 className="font-black text-xl italic uppercase tracking-tighter">MC Pro <span className="text-rose-500">V2</span></h1>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Piriápolis, Uruguay</p>
        </div>
        <NavButton id="escritorio" label="Escritorio" icon={Layout} />
        <NavButton id="ventas" label="Ventas" icon={DollarSign} />
        <NavButton id="taller" label="Taller" icon={ClipboardList} />
        <NavButton id="cotizador" label="Cotizador" icon={Calculator} />
        <NavButton id="envios" label="Envíos" icon={Truck} />
        
        <button onClick={() => setDarkMode(!darkMode)} className="mt-auto flex items-center gap-3 px-4 py-3 text-slate-400 font-bold text-[10px] uppercase">
          {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />} 
          {darkMode ? 'Modo Luz' : 'Modo Noche'}
        </button>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-6 md:p-12 pb-24 md:pb-12 overflow-y-auto">
        
        {/* ESCENARIO: ESCRITORIO */}
        {activeTab === 'escritorio' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <p className="text-[10px] font-black uppercase text-rose-400 mb-2 tracking-widest">Caja Neta</p>
                <h2 className="text-5xl font-black italic tracking-tighter">${finanzas.neta}</h2>
                <div className="mt-4 text-[9px] font-bold text-slate-500 uppercase">Balance actual del taller</div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border dark:border-slate-700 shadow-sm col-span-2">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Palette size={14} className="text-rose-500"/> Laboratorio • {labColor.temporada}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-[9px] font-black uppercase mb-3">Estacional</p>
                    <div className="flex h-12 rounded-2xl overflow-hidden shadow-inner">
                      {labColor.paletaEstacional.map(c => <div key={c} style={{backgroundColor: c}} className="flex-1" />)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase mb-3 text-rose-500">San Valentín</p>
                    <div className="flex h-12 rounded-2xl overflow-hidden shadow-inner">
                      {labColor.paletaCampaña.map(c => <div key={c} style={{backgroundColor: c}} className="flex-1" />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ESCENARIO: VENTAS */}
        {activeTab === 'ventas' && (
          <div className="max-w-3xl space-y-6">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Ventas</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.target);
              setVentas([...ventas, { id: Date.now(), concepto: d.get('concepto'), monto: d.get('monto') }]);
              e.target.reset();
            }} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 flex flex-col md:flex-row gap-4">
              <input name="concepto" placeholder="Ej: Stickers LEGO x50" required className="flex-1 bg-slate-50 dark:bg-slate-700 p-4 rounded-2xl outline-none font-bold" />
              <input name="monto" type="number" placeholder="Monto $" required className="w-full md:w-32 bg-slate-50 dark:bg-slate-700 p-4 rounded-2xl outline-none font-bold" />
              <button type="submit" className="bg-rose-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px]">Anotar</button>
            </form>
            <div className="space-y-3">
              {ventas.map(v => (
                <div key={v.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border dark:border-slate-700 flex justify-between items-center shadow-sm">
                  <span className="font-bold uppercase text-[11px]">{v.concepto}</span>
                  <span className="font-black text-rose-500">${v.monto}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ESCENARIO: COTIZADOR */}
        {activeTab === 'cotizador' && (
          <div className="max-w-xl space-y-8">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white">Cotizador de Stickers</h2>
            <div className="bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] border dark:border-slate-700 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Costo total de materiales</label>
                <input 
                  type="number" 
                  value={cotizacion.costoBase}
                  onChange={(e) => setCotizacion({...cotizacion, costoBase: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-700 p-6 rounded-3xl text-3xl font-black outline-none border-2 border-transparent focus:border-rose-500 transition-all" 
                  placeholder="0"
                />
              </div>
              <div className="pt-6 border-t border-dashed dark:border-slate-600">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Precio sugerido (Margen 50%)</p>
                <p className="text-6xl font-black text-rose-500 tracking-tighter">${(Number(cotizacion.costoBase) * 2).toFixed(0)}</p>
              </div>
            </div>
          </div>
        )}

        {/* ESCENARIO: TALLER */}
        {activeTab === 'taller' && (
          <div className="max-w-3xl space-y-6">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Cronómetro del Taller</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.target);
              setTareas([...tareas, { id: Date.now(), title: d.get('tarea'), tiempo: 0, isRunning: false }]);
              e.target.reset();
            }} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 flex gap-4 shadow-sm">
              <input name="tarea" placeholder="¿Qué vas a fabricar ahora?" required className="flex-1 bg-slate-50 dark:bg-slate-700 p-4 rounded-2xl outline-none font-bold" />
              <button type="submit" className="bg-slate-900 text-white px-8 rounded-2xl font-black uppercase text-[10px]">Iniciar</button>
            </form>
            <div className="space-y-4">
              {tareas.map(t => (
                <div key={t.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border dark:border-slate-700 flex justify-between items-center shadow-sm">
                  <div>
                    <h4 className="font-black uppercase text-xs tracking-tight">{t.title}</h4>
                    <p className={`text-4xl font-mono font-black mt-1 ${t.isRunning ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                      {formatTime(t.tiempo)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setTareas(tareas.map(x => x.id === t.id ? {...x, isRunning: !x.isRunning} : x))}
                      className={`p-5 rounded-2xl transition-all ${t.isRunning ? 'bg-amber-400 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
                    >
                      {t.isRunning ? <Clock /> : <Play />}
                    </button>
                    <button onClick={() => setTareas(tareas.filter(x => x.id !== t.id))} className="p-5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl"><Trash2 size={20}/></button>
                  </div>
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
