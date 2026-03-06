'use client';

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { 
  Lock, Search, Phone, Mail, Calendar, Filter, 
  Download, ChevronDown, Building2, User, AlertCircle, CheckCircle2 
} from 'lucide-react';

// --- CONFIGURACIÓN FIREBASE ---
const getFirebaseConfig = () => {
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_FIREBASE_CONFIG) {
    try { return JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG); } catch (e) { return {}; }
  }
  const globalVars = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  const fallbackConfig = globalVars.__firebase_config;
  if (fallbackConfig) return JSON.parse(fallbackConfig);

  // Fallback final: Credenciales de Santiago (Bravence)
  return {
    apiKey: "AIzaSyCbMOEED3yNtX0nn-9hgQJzGUkTdbap0rg",
    authDomain: "bravence-d3bbe.firebaseapp.com",
    projectId: "bravence-d3bbe",
    storageBucket: "bravence-d3bbe.firebasestorage.app",
    messagingSenderId: "305314105144",
    appId: "1:305314105144:web:000797b81456e767b823cd",
    measurementId: "G-L5S4T4XN1C"
  };
};

const getAppId = () => {
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_APP_ID) {
    return process.env.NEXT_PUBLIC_APP_ID;
  }
  const globalVars = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  return globalVars.__app_id || 'bravence-app';
};

const firebaseConfig = getFirebaseConfig();
const appId = getAppId();

const ACCESS_PIN = "bravence2025"; 

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [revenueFilter, setRevenueFilter] = useState("all");

  // Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ACCESS_PIN) {
      setIsAuthenticated(true);
      loadLeads();
    } else {
      setError("PIN Incorrecto");
    }
  };

  // Cargar Datos
  const loadLeads = () => {
    setLoading(true);
    try {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const db = getFirestore(app);

      const initAuth = async () => {
        const globalWithAuth = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
        if (globalWithAuth.__initial_auth_token) {
            await signInWithCustomToken(auth, globalWithAuth.__initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }
      };
      initAuth();

      onAuthStateChanged(auth, (user) => {
        if (user) {
          const q = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'leads'),
            orderBy('createdAt', 'desc')
          );

          onSnapshot(q, (snapshot) => {
            const leadsData = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                dateObj: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                date: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' }) : 'Pendiente'
              };
            });
            setLeads(leadsData);
            setLoading(false);
          });
        }
      });
    } catch (err) {
      console.error(err);
      setError("Error de conexión.");
      setLoading(false);
    }
  };

  // --- LÓGICA INTELIGENTE DE WHATSAPP ---
  const getWhatsAppLink = (phone: string) => {
    if (!phone) return '#';
    
    // 1. Dejar solo números
    let number = phone.replace(/[^0-9]/g, '');
    
    // 2. Quitar el '0' inicial si existe (ej: 011... -> 11...)
    if (number.startsWith('0')) {
      number = number.substring(1);
    }

    // 3. Si NO empieza con 54 (código Argentina), asumimos que es local y agregamos 549
    // (54 = Argentina, 9 = Móvil)
    if (!number.startsWith('54')) {
      number = `549${number}`;
    }

    return `https://wa.me/${number}`;
  };

  // Lógica de Filtrado
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRevenue = revenueFilter === 'all' || lead.revenue === revenueFilter;

    return matchesSearch && matchesRevenue;
  });

  const totalLeads = leads.length;
  const highTicketLeads = leads.filter(l => l.revenue === 'Más de $200 Millones' || l.revenue === 'corporate').length;

  const downloadCSV = () => {
    const headers = ["Fecha", "Nombre", "Empresa", "Cargo", "Email", "Teléfono", "Facturación", "Desafío"];
    const csvContent = [
      headers.join(","),
      ...filteredLeads.map(l => [
        `"${l.date}"`, `"${l.name}"`, `"${l.company}"`, `"${l.role}"`, `"${l.email}"`, `"${l.phone}"`, `"${l.revenue}"`, `"${l.challenge}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bravence_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-[#0a594f]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Bravence CRM</h1>
          <p className="text-gray-500 mb-6 text-sm">Acceso exclusivo para socios.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Ingresa tu PIN"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0a594f] focus:ring-2 focus:ring-[#0a594f]/20 text-center text-lg tracking-widest"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <button type="submit" className="w-full bg-[#0a594f] text-white font-bold py-3 rounded-lg hover:bg-[#08463e] transition-colors">
              Acceder al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0a594f] rounded-lg flex items-center justify-center text-white font-bold">B</div>
          <span className="font-bold text-xl tracking-tight text-[#0a594f]">Bravence<span className="text-gray-400">CRM</span></span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-900">Admin User</p>
            <p className="text-xs text-green-600">● Conectado</p>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><User size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900">{totalLeads}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Building2 size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">High Ticket (Mas de 200M)</p>
              <p className="text-3xl font-bold text-gray-900">{highTicketLeads}</p>
            </div>
          </div>
          <div className="bg-[#0a594f] p-6 rounded-xl shadow-lg text-white flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Estado del Sistema</p>
              <p className="text-xl font-bold mt-1">Operativo</p>
            </div>
            <CheckCircle2 className="text-green-300" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-t-xl border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar empresa, nombre..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4daea1] text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select 
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4daea1] text-sm cursor-pointer hover:bg-gray-100"
                value={revenueFilter}
                onChange={(e) => setRevenueFilter(e.target.value)}
              >
                <option value="all">Toda Facturación</option>
                <option value="Menos de $10 Millones">Micro (&lt;10M)</option>
                <option value="Entre $10M y $50 Millones">Pequeña (10-50M)</option>
                <option value="Entre $50M y $200 Millones">Mediana (50-200M)</option>
                <option value="Más de $200 Millones">Corporate (&gt;200M)</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>
          <button 
            onClick={downloadCSV}
            className="flex items-center gap-2 text-gray-600 hover:text-[#0a594f] text-sm font-medium transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg"
          >
            <Download size={16} /> Exportar CSV
          </button>
        </div>

        <div className="bg-white rounded-b-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Empresa / Contacto</th>
                  <th className="px-6 py-4">Facturación</th>
                  <th className="px-6 py-4">Desafío Principal</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">Cargando datos...</td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">No se encontraron leads.</td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar size={14} />
                          {lead.date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-base">{lead.company}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <User size={12} /> {lead.name} <span className="text-gray-300">|</span> {lead.role}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          lead.revenue === 'Más de $200 Millones' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          lead.revenue === 'Entre $50M y $200 Millones' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {lead.revenue === 'Más de $200 Millones' && '💎 '}
                          {lead.revenue}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate" title={lead.challenge}>
                        {lead.challenge}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          {/* Botón WhatsApp con lógica inteligente */}
                          <a 
                            href={getWhatsAppLink(lead.phone)} 
                            target="_blank"
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            title="WhatsApp"
                          >
                            <Phone size={16} />
                          </a>
                          <a 
                            href={`mailto:${lead.email}`}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Email"
                          >
                            <Mail size={16} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
            <span>Mostrando {filteredLeads.length} resultados</span>
            <span>Datos protegidos y encriptados</span>
          </div>
        </div>
      </div>
    </div>
  );
}