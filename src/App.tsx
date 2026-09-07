import { useState, useCallback, useEffect, type ReactNode, useRef, type ChangeEvent, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { 
  Mail, 
  Trash2, 
  Copy, 
  Check, 
  Filter, 
  SortAsc, 
  RotateCcw, 
  Download,
  AlertCircle,
  FileText,
  Globe,
  Upload,
  FileUp,
  WifiOff,
  ExternalLink,
  List,
  Wand2,
  Search,
  ShieldAlert
} from 'lucide-react';
import { usePWA } from './hooks/usePWA';
import { PWAInstallButton } from './components/PWAInstallButton';
import type { CleanedEmail, Stats } from './types';

export default function App() {
  const { isOnline } = usePWA();
  const [scrolled, setScrolled] = useState(false);
  const [sessionFiles, setSessionFiles] = useState<{ name: string, count: number, id: string }[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [output, setOutput] = useState('');
  const [results, setResults] = useState<CleanedEmail[]>([]);
  const [domainFilter, setDomainFilter] = useState('');
  const [domainCounts, setDomainCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<Stats>({
    total: 0,
    duplicates: 0,
    invalid: 0,
    cleaned: 0,
    corrected: 0
  });
  const [copied, setCopied] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'txt' | 'csv'>('txt');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [options, setOptions] = useState({
    removeDuplicates: true,
    removeInvalid: true,
    sortAlphabetically: true,
    toLowercase: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker.ts', import.meta.url));
    workerRef.current.onmessage = (e) => {
      const { output, results, stats, domainCounts } = e.data;
      setOutput(output);
      setResults(results || []);
      setStats(stats);
      setDomainCounts(domainCounts);
      setIsProcessing(false);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  const processFile = async (file: File | undefined) => {
    if (!file) return;

    setIsUploading(true);
    const fileName = file.name.toLowerCase();

    try {
      let text = '';
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          const csv = XLSX.utils.sheet_to_csv(sheet);
          text += csv + '\n';
        });
      } else {
        text = await file.text();
      }

      // Add to session tracking
      setSessionFiles(prev => [
        ...prev, 
        { name: file.name, count: 0, id: Math.random().toString(36).substr(2, 9) }
      ]);
      
      setInput(prev => (prev ? prev + '\n' + text : text));
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Failed to read file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
  };

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  }, []);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const cleanData = useCallback(() => {
    if (workerRef.current) {
      setIsProcessing(true);
      workerRef.current.postMessage({
        input,
        options,
        domainFilter
      });
    }
  }, [input, options, domainFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      cleanData();
    }, 300);
    return () => clearTimeout(timer);
  }, [input, options, cleanData, domainFilter]);

  const copyToClipboard = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const downloadFile = () => {
    if (!output) return;
    
    let content = output;
    let mimeType = 'text/plain';
    let extension = 'txt';

    if (downloadFormat === 'csv') {
      // Add CSV header and wrap emails in quotes to handle any potential characters
      const emails = output.split('\n');
      content = 'Email\n' + emails.map(email => `"${email}"`).join('\n');
      mimeType = 'text/csv';
      extension = 'csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleaned_emails_${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
    setResults([]);
    setDomainFilter('');
    setStats({ total: 0, duplicates: 0, invalid: 0, cleaned: 0, corrected: 0 });
    setDomainCounts({});
    setSessionFiles([]);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-100 pb-safe">
      {/* Professional Navbar */}
      <nav className={`sticky top-0 z-[60] w-full transition-all duration-300 pt-safe ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.02)] border-neutral-200/50' 
          : 'bg-neutral-50/0 border-transparent'
      }`}>
        <div className={`max-w-6xl mx-auto px-4 transition-all duration-300 flex items-center justify-between ${
          scrolled ? 'h-11 md:h-12' : 'h-14 md:h-16'
        }`}>
          <div className="flex items-center gap-2 md:gap-2.5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-5 h-5 md:w-5.5 md:h-5.5 overflow-hidden"
            >
              <img 
                src="https://vibtools.github.io/vibtools-brand-assets/logos/icon-512.png" 
                alt="VibTools Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <motion.span 
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm md:text-[15px] font-bold tracking-tight text-neutral-900 whitespace-nowrap"
            >
              Email Data Cleaner
            </motion.span>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.a
              href="https://vib.tools/"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-[10px] md:text-11px font-bold hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-sm group ${
                scrolled ? 'scale-90' : 'scale-100'
              }`}
            >
              <span className="hidden xs:inline">Visit</span> Vib Tools
              <ExternalLink size={10} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </motion.a>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* Offline Indicator */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm"
            >
              <div className="bg-amber-500 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-[13px] font-bold">
                <WifiOff size={16} />
                <span>Offline Mode — Using cached tools</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PWA Components */}
        <PWAInstallButton />

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Controls & Input */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Paste Area */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col"
              >
                <div className="px-4 py-3 md:py-2.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                  <div className="flex items-center gap-2 font-semibold text-sm md:text-[13px]">
                    <FileText size={14} className="text-neutral-400" />
                    <span>Paste Text</span>
                  </div>
                  <button 
                    onClick={handleReset}
                    className="p-1 hover:bg-neutral-200 rounded-md transition-colors text-neutral-500"
                    title="Clear everything"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste emails here..."
                  className="w-full h-[180px] p-3 focus:outline-none resize-none text-neutral-700 bg-transparent text-[13px] leading-relaxed placeholder:text-neutral-300"
                />
              </motion.div>

              {/* Upload Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative bg-white rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 md:p-6 transition-all cursor-pointer group
                  ${isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-neutral-200 hover:border-blue-400 hover:bg-neutral-50/50'}
                `}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.csv,.xlsx,.xls"
                  className="hidden"
                />
                
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110
                  ${isDragging ? 'bg-blue-600 text-white animate-bounce' : 'bg-neutral-100 text-neutral-400 group-hover:bg-blue-100 group-hover:text-blue-600'}
                `}>
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" />
                  ) : (
                    <Upload size={24} />
                  )}
                </div>

                <div className="text-center">
                  <p className="text-[13px] font-bold text-neutral-700 mb-1">
                    {isUploading ? 'Reading file...' : 'Drop file here'}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    TXT, CSV, or Excel files
                  </p>
                </div>

                {isDragging && (
                  <div className="absolute inset-0 pointer-events-none border-4 border-blue-500/20 rounded-2xl animate-pulse" />
                )}
              </motion.div>
            </div>
            
            {/* Session History */}
            <AnimatePresence>
              {sessionFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
                >
                  <div className="px-4 py-2.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                    <div className="flex items-center gap-2 font-semibold text-[13px]">
                      <List size={14} className="text-neutral-400" />
                      <span>Batch Progress</span>
                      <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                        {sessionFiles.length} {sessionFiles.length === 1 ? 'File' : 'Files'}
                      </span>
                    </div>
                    <button 
                      onClick={handleReset}
                      className="text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={12} />
                      Clear Session
                    </button>
                  </div>
                  <div className="p-2 max-h-[160px] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sessionFiles.map((f, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={f.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-neutral-100/50 group"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-5 h-5 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-400 shrink-0">
                              {idx + 1}
                            </div>
                            <span className="text-xs text-neutral-600 truncate font-medium">{f.name}</span>
                          </div>
                          <Check size={12} className="text-green-500 shrink-0" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Options */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={options.removeDuplicates}
                  onChange={() => setOptions(prev => ({ ...prev, removeDuplicates: !prev.removeDuplicates }))}
                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-[13px] font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors">Duplicates</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={options.sortAlphabetically}
                  onChange={() => setOptions(prev => ({ ...prev, sortAlphabetically: !prev.sortAlphabetically }))}
                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-[13px] font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors">Sort A-Z</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={options.toLowercase}
                  onChange={() => setOptions(prev => ({ ...prev, toLowercase: !prev.toLowercase }))}
                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-[13px] font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors">Lowercase</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={options.removeInvalid}
                  onChange={() => setOptions(prev => ({ ...prev, removeInvalid: !prev.removeInvalid }))}
                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-[13px] font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors">Valid Only</span>
              </label>
              
              <div className="sm:col-span-2 pt-3 mt-1 border-t border-neutral-100">
                <div className="flex items-center gap-2 mb-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <Globe size={12} />
                  <span>Filter Domain</span>
                </div>
                <input 
                  type="text"
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  placeholder="gmail.com, example.com..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-[13px]"
                />
              </div>
            </motion.div>
          </div>

          {/* Stats & Output */}
          <div className="lg:col-span-5 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <StatCard label="Total Found" value={stats.total} icon={<Mail size={16} />} color="blue" />
              <StatCard 
                label={sessionFiles.length > 0 ? "Batch Cleaned" : "Cleaned"} 
                value={stats.cleaned} 
                icon={<Check size={16} />} 
                color="green" 
              />
              <StatCard label="Corrected" value={stats.corrected} icon={<Wand2 size={16} />} color="blue" />
              <StatCard label="Duplicates" value={stats.duplicates} icon={<Trash2 size={16} />} color="orange" />
              <StatCard label="Invalid" value={stats.invalid} icon={<AlertCircle size={16} />} color="red" />
            </div>

            {/* Domain Distribution */}
            {Object.keys(domainCounts).length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                  <Globe size={12} />
                  <span>Distribution</span>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-2 scrollbar-thin scrollbar-thumb-neutral-200">
                  {Object.entries(domainCounts)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([domain, count]) => (
                      <div key={domain} className="flex items-center justify-between group">
                        <span className="text-[13px] text-neutral-600 truncate mr-3 group-hover:text-blue-600 transition-colors">{domain}</span>
                        <span className="text-[10px] font-bold bg-neutral-50 px-1.5 py-0.5 rounded text-neutral-500 border border-neutral-100">{count}</span>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* Output */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-neutral-200 shadow-sm flex flex-col"
            >
              <div className="px-4 py-3 md:px-5 md:py-3 border-b border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-50/50">
                <div className="flex items-center gap-2 font-semibold text-sm w-full sm:w-auto">
                  <Filter size={16} className="text-neutral-400" />
                  <span>Result</span>
                  {isProcessing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="ml-2 flex items-center gap-1 text-[10px] text-blue-500 font-bold uppercase tracking-wider"
                    >
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                      Processing...
                    </motion.div>
                  )}
                </div>
                <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
                   <div className="flex items-center bg-neutral-100 rounded-lg p-0.5">
                     <button
                       onClick={() => setDownloadFormat('txt')}
                       className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded transition-all ${downloadFormat === 'txt' ? 'bg-white text-blue-600 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                     >
                       TXT
                     </button>
                     <button
                       onClick={() => setDownloadFormat('csv')}
                       className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded transition-all ${downloadFormat === 'csv' ? 'bg-white text-blue-600 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                     >
                       CSV
                     </button>
                   </div>
                   <button 
                    onClick={downloadFile}
                    disabled={!output}
                    className="p-1.5 hover:bg-neutral-200 rounded-lg transition-colors text-neutral-500 disabled:opacity-30"
                    title={`Download as ${downloadFormat.toUpperCase()}`}
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={copyToClipboard}
                    disabled={!output}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-200 text-white rounded-xl transition-all shadow-md shadow-blue-100 disabled:shadow-none font-semibold text-[13px]"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="flex-1 flex flex-col min-h-0 bg-blue-50/5">
                {results.length > 0 ? (
                  <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[300px] md:max-h-[400px] scrollbar-thin scrollbar-thumb-neutral-200">
                    {results.map((item, idx) => (
                      <div 
                        key={`${item.email}-${idx}`}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50/50 group transition-colors border border-transparent hover:border-blue-100"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="text-[10px] font-mono text-neutral-400 w-8 tabular-nums">
                            {(idx + 1).toString().padStart(3, '0')}
                          </div>
                          <span className="text-[13px] font-mono text-blue-600 truncate">{item.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.status === 'corrected' && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-600 text-[9px] font-bold uppercase tracking-wider">
                              <Wand2 size={10} />
                              Auto-Fixed
                            </div>
                          )}
                          {item.status === 'suspicious' && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-600 text-[9px] font-bold uppercase tracking-wider">
                              <ShieldAlert size={10} />
                              Suspicious
                            </div>
                          )}
                          {item.status === 'valid' && (
                            <Check size={14} className="text-green-500 opacity-40" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <Search size={32} className="text-neutral-200 mb-3" />
                    <p className="text-[13px] text-neutral-400">Cleaned results will appear here...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* SEO Informational Content & Landing Page Section */}
        <div className="mt-20 mb-20 border-t border-neutral-100 pt-16">
          <div className="max-w-4xl mx-auto space-y-24">
            
            {/* Value Proposition & Benefits */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert size={24} />
                </div>
                <h3 className="text-base font-bold text-neutral-900">100% Private</h3>
                <p className="text-[13px] text-neutral-500 leading-relaxed">Processing happens entirely in your browser. Your private email lists never leave your device.</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wand2 size={24} />
                </div>
                <h3 className="text-base font-bold text-neutral-900">Auto-Correction</h3>
                <p className="text-[13px] text-neutral-500 leading-relaxed">Instantly fix common domain typos like 'gamil.com' to save potentially lost leads.</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <List size={24} />
                </div>
                <h3 className="text-base font-bold text-neutral-900">Batch Processing</h3>
                <p className="text-[13px] text-neutral-500 leading-relaxed">Upload multiple files sequentially to merge and scrub thousands of records at once.</p>
              </div>
            </section>

            {/* In-depth SEO Text */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
              <div className="space-y-6 text-left">
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight leading-tight">
                  The Professional Choice for <br />
                  <span className="text-blue-600">Email List Hygiene</span>
                </h2>
                <div className="space-y-4 text-sm text-neutral-500 leading-relaxed">
                  <p>
                    Maintaining a clean email database is the single most effective way to reduce bounce rates and protect your sender reputation. Our <strong>bulk email scrubber</strong> is designed for high-performance marketing teams who need professional results without the enterprise price tag.
                  </p>
                  <p>
                    Whether you're preparing a <strong>B2B sales outreach</strong> or cleaning up a massive newsletter list, our tool provides the precision of a paid <strong>email list verifier</strong> with the speed of a local browser application.
                  </p>
                  <div className="pt-4 flex flex-wrap gap-2">
                    {['XLSX', 'CSV', 'TXT', 'VCF'].map(format => (
                      <span key={format} className="px-2 py-1 bg-neutral-100 text-neutral-400 rounded text-[10px] font-bold">{format} SUPPORTED</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest">Common Use Cases</h3>
                  <div className="space-y-4">
                    {[
                      { title: 'Cold Outreach Prep', desc: 'Verify leads from prospecting tools before importing to your CRM.' },
                      { title: 'Newsletter Hygiene', desc: 'Remove duplicates and invalid syntax from messy subscriber exports.' },
                      { title: 'CRM Data Cleanup', desc: 'Standardize casing and fix domain typos across your entire customer list.' }
                    ].map((useCase, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 text-xs font-bold">{i+1}</div>
                        <div>
                          <h4 className="text-sm font-bold text-neutral-800">{useCase.title}</h4>
                          <p className="text-xs text-neutral-500 mt-1">{useCase.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-12">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-neutral-900">Frequently Asked Questions</h2>
                <p className="text-[13px] text-neutral-500">Everything you need to know about our cleaning process.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { q: 'Is my data actually safe?', a: 'Yes. Unlike online services where you upload files to their servers, our tool runs purely on your device. Your data never touches a network.' },
                  { q: 'Is there a limit on list size?', a: 'Technically, there is no hard limit. However, performance depends on your device memory. We have tested lists up to 100k+ emails smoothly.' },
                  { q: 'Which file formats do you support?', a: 'We natively support .txt, .csv, and standard Excel files (.xls, .xlsx).' },
                  { q: 'How do I download the results?', a: 'Once cleaned, you can use the "Export Result" button to save as a TXT or CSV file instantly.' }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <h4 className="text-sm font-bold text-neutral-900 mb-2">{item.q}</h4>
                    <p className="text-[13px] text-neutral-500 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-neutral-100 text-center text-neutral-400 text-[11px]">
          <p className="mb-2">Practical software for real workflows.</p>
          <p>© {new Date().getFullYear()} <a href="https://vib.tools/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors font-semibold">Vib Tools</a> • Email Data Cleaner • Free & Private</p>
        </footer>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: ReactNode, color: 'blue' | 'green' | 'orange' | 'red' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-rose-50 text-rose-600 border-rose-100'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-3 md:p-4 rounded-xl md:rounded-2xl border ${colors[color]} flex flex-col gap-0.5 md:gap-1 shadow-sm`}
    >
      <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider opacity-60">
        {icon}
        {label}
      </div>
      <div className="text-base md:text-lg font-bold tabular-nums">{value.toLocaleString()}</div>
    </motion.div>
  );
}
