
import React, { useState, useEffect } from 'react';
import { Database, Advisor, Branch, UTEntry, BondEntry, GenericIncomeEntry } from './types';
import Dashboard from './components/Dashboard';
import DataInput from './components/DataInput';
import ReportView from './components/ReportView';
import TransactionList from './components/TransactionList';
import SyncCenter from './components/SyncCenter';

const MASTER_KEY = 'WEALTH_HUB_MASTER_STORAGE_PERSISTENT';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'input' | 'reports' | 'history' | 'sync'>('dashboard');
  const [lastSaved, setLastSaved] = useState<string>(new Date().toLocaleTimeString());
  
  const [db, setDb] = useState<Database>(() => {
    const masterEntries: Database = { utEntries: [], bondEntries: [], genericEntries: [] };
    const seenIds = new Set<string>();

    const mergeIntoMaster = (data: any) => {
      if (!data || typeof data !== 'object') return;
      // 兼容所有可能的旧版字段名
      const uts = data.utEntries || data.uts || data.ut || [];
      const bonds = data.bondEntries || data.bonds || data.bond || [];
      const generics = data.genericEntries || data.generics || data.generic || [];

      if (Array.isArray(uts)) {
        uts.forEach((e: any) => { if (e?.id && !seenIds.has(e.id)) { masterEntries.utEntries.push(e); seenIds.add(e.id); } });
      }
      if (Array.isArray(bonds)) {
        bonds.forEach((e: any) => { if (e?.id && !seenIds.has(e.id)) { masterEntries.bondEntries.push(e); seenIds.add(e.id); } });
      }
      if (Array.isArray(generics)) {
        generics.forEach((e: any) => { if (e?.id && !seenIds.has(e.id)) { masterEntries.genericEntries.push(e); seenIds.add(e.id); } });
      }
    };

    // 扫描所有 LocalStorage Key 找回 13 号数据
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const raw = localStorage.getItem(key);
          if (raw && (raw.includes('utEntries') || raw.includes('revenue') || raw.includes('advisor'))) {
            const parsed = JSON.parse(raw);
            mergeIntoMaster(parsed);
          }
        } catch (e) {}
      }
    }
    return masterEntries;
  });

  useEffect(() => {
    localStorage.setItem(MASTER_KEY, JSON.stringify(db));
    setLastSaved(new Date().toLocaleTimeString());
  }, [db]);

  const addUTEntry = (entry: Omit<UTEntry, 'id'>) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setDb(prev => ({ ...prev, utEntries: [newEntry, ...prev.utEntries] }));
  };

  const addBondEntry = (entry: Omit<BondEntry, 'id'>) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setDb(prev => ({ ...prev, bondEntries: [newEntry, ...prev.bondEntries] }));
  };

  const addGenericEntry = (entry: Omit<GenericIncomeEntry, 'id'>) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setDb(prev => ({ ...prev, genericEntries: [newEntry, ...prev.genericEntries] }));
  };

  const deleteEntry = (type: 'ut' | 'bond' | 'generic', id: string) => {
    setDb(prev => ({
      ...prev,
      utEntries: type === 'ut' ? prev.utEntries.filter(e => e.id !== id) : prev.utEntries,
      bondEntries: type === 'bond' ? prev.bondEntries.filter(e => e.id !== id) : prev.bondEntries,
      genericEntries: type === 'generic' ? prev.genericEntries.filter(e => e.id !== id) : prev.genericEntries,
    }));
  };

  const handleImport = (importedDb: Database) => {
    setDb(prev => {
      const seenIds = new Set([...prev.utEntries, ...prev.bondEntries, ...prev.genericEntries].map(e => e.id));
      const newUt = [...prev.utEntries];
      const newBond = [...prev.bondEntries];
      const newGen = [...prev.genericEntries];

      importedDb.utEntries.forEach(e => { if (!seenIds.has(e.id)) newUt.push(e); });
      importedDb.bondEntries.forEach(e => { if (!seenIds.has(e.id)) newBond.push(e); });
      importedDb.genericEntries.forEach(e => { if (!seenIds.has(e.id)) newGen.push(e); });

      return { utEntries: newUt, bondEntries: newBond, genericEntries: newGen };
    });
  };

  const clearData = () => {
    if (window.confirm('警告：这将删除所有设备上的本地数据。')) {
      localStorage.removeItem(MASTER_KEY);
      setDb({ utEntries: [], bondEntries: [], genericEntries: [] });
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-72 bg-slate-950/80 backdrop-blur-xl border-r border-white/5 p-8 flex flex-col gap-8 z-20">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight leading-none text-white">WealthHub</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-cyan-400 mt-1">Vercel Cloud Pro</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} label="智能概览" />
          <NavItem active={activeTab === 'input'} onClick={() => setActiveTab('input')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>} label="录入数据" />
          <NavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>} label="历史明细" />
          <NavItem active={activeTab === 'reports'} onClick={() => setActiveTab('reports'} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} label="汇点报告" />
          <div className="h-px bg-white/5 my-2"></div>
          <NavItem active={activeTab === 'sync'} onClick={() => setActiveTab('sync'} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>} label="同步中心" />
        </nav>

        <div className="mt-auto bg-white/5 rounded-2xl p-5 border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-black">Storage Status</p>
          <div className="space-y-2">
             <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-500">UT Records:</span> <span className="text-cyan-400 font-bold">{db.utEntries.length}</span></div>
             <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-500">Others:</span> <span className="text-emerald-400 font-bold">{db.bondEntries.length + db.genericEntries.length}</span></div>
             <div className="text-[9px] text-slate-600 mt-2 border-t border-white/5 pt-2 italic">数据存储于当前浏览器中</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative z-10 p-6 md:p-12">
        <div className="max-w-6xl mx-auto space-y-10">
          {activeTab === 'dashboard' && <Dashboard db={db} />}
          {activeTab === 'input' && <DataInput onAddUT={addUTEntry} onAddBond={addBondEntry} onAddGeneric={addGenericEntry} />}
          {activeTab === 'history' && <TransactionList db={db} onDelete={deleteEntry} />}
          {activeTab === 'reports' && <ReportView db={db} />}
          {activeTab === 'sync' && <SyncCenter db={db} onImport={handleImport} />}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 group ${active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
    <span className={`${active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>{icon}</span>
    <span className="font-semibold text-sm tracking-wide">{label}</span>
    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
  </button>
);

export default App;
