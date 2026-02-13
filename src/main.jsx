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
