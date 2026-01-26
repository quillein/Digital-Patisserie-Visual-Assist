
import React, { useState, useEffect, useMemo } from 'react';
import { Palette, Feather, Sparkles, Image as ImageIcon, Loader2, Camera, ArrowRight, X, AlertCircle, Heart, Trash2, BookOpen, Info, Droplets, Share2, Check, Copy, Globe, Layers, Layout, Brush, HeartHandshake, Eye, Download, FileText, Key, Wand2, RefreshCw } from 'lucide-react';
import { generateCakeDesign } from './services/geminiService';
import { AppState, CakeDesign, StudioMode } from './types';
import { jsPDF } from 'jspdf';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [pastryFormat, setPastryFormat] = useState('');
  const [theme, setTheme] = useState('');
  const [mode, setMode] = useState<StudioMode>('poetic');
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [state, setState] = useState<AppState>({
    isGenerating: false,
    result: null,
    error: null
  });
  const [favorites, setFavorites] = useState<CakeDesign[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('qp_favorites_v3');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load favorites", e);
      }
    }

    const handleSharedLink = () => {
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        try {
          const encodedData = hash.substring(1);
          const decodedData = JSON.parse(decodeURIComponent(atob(encodedData)));
          if (decodedData && decodedData.title) {
            setState(prev => ({ ...prev, result: { ...decodedData, isShared: true } }));
          }
        } catch (e) {
          console.error("Failed to decode shared design", e);
        }
      }
    };

    handleSharedLink();
  }, []);

  useEffect(() => {
    localStorage.setItem('qp_favorites_v3', JSON.stringify(favorites));
  }, [favorites]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageFile(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt && !imageFile) return;
    
    const aistudio = (window as any).aistudio;
    if (aistudio && !(await aistudio.hasSelectedApiKey())) {
      await aistudio.openSelectKey();
    }

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const result = await generateCakeDesign({
        prompt: prompt || "A feeling of unnamable peace.",
        imageData: imageFile || undefined,
        pastryFormat: pastryFormat || "Single-tier Cake",
        theme,
        mode
      });
      
      setState({ isGenerating: false, result, error: null });
    } catch (err: any) {
      console.error("Generation Error:", err);
      let errorText = "The manifestation failed to reach our physical plane.";
      if (err.message?.includes("MANIFEST_DATA_INCOMPLETE")) {
        errorText = "Incomplete Manifestation: The technical details (colors/technique) could not be captured. Please try a different prompt.";
      } else if (err.message?.includes("429") || err.message?.includes("quota")) {
        errorText = "The creative ethers are crowded. Please try again in a few moments.";
      }
      setState(prev => ({ ...prev, isGenerating: false, error: errorText }));
    }
  };

  const toggleFavorite = (design: CakeDesign) => {
    const isFav = favorites.some(f => f.title === design.title && f.timestamp === design.timestamp);
    if (isFav) {
      setFavorites(favorites.filter(f => !(f.title === design.title && f.timestamp === design.timestamp)));
    } else {
      setFavorites([{ ...design, timestamp: Date.now() }, ...favorites]);
    }
  };

  const shareDesign = (design: CakeDesign) => {
    try {
      const { imageUrl, ...shareableData } = design;
      const encoded = btoa(encodeURIComponent(JSON.stringify(shareableData)));
      const url = `${window.location.origin}${window.location.pathname}#${encoded}`;
      navigator.clipboard.writeText(url);
      setCopyStatus(design.id);
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (e) {
      console.error("Failed to share", e);
    }
  };

  const downloadPdf = async (design: CakeDesign) => {
    const doc = new jsPDF();
    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(180);
    doc.text('Quille en Poème - Digital Atelier', 105, 10, { align: 'center' });
    
    doc.setFontSize(24);
    doc.setTextColor(40);
    doc.text(design.title, 105, 25, { align: 'center' });

    if (design.imageUrl) {
      doc.addImage(design.imageUrl, 'PNG', 25, 35, 160, 160);
    }

    doc.setFontSize(12);
    const splitDesc = doc.splitTextToSize(design.visualDescription, 160);
    doc.text(splitDesc, 25, 205);

    doc.addPage();
    doc.setFontSize(18);
    doc.text('Technical Directives', 25, 20);

    doc.setFontSize(14);
    doc.text('Gestural Execution:', 25, 35);
    doc.setFontSize(10);
    const splitTech = doc.splitTextToSize(design.technique, 160);
    doc.text(splitTech, 25, 45);

    doc.setFontSize(14);
    doc.text('Color Alchemy (Peotraco):', 25, 80);
    let y = 90;
    design.colorRecipes.forEach(c => {
      doc.setFillColor(c.hex);
      doc.rect(25, y, 10, 10, 'F');
      doc.setFontSize(10);
      doc.setTextColor(40);
      doc.text(c.name.toUpperCase(), 40, y + 4);
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(c.recipe, 40, y + 8);
      y += 15;
    });

    doc.save(`${design.title.toLowerCase().replace(/\s/g, '_')}_manifest.pdf`);
  };

  const isFavorited = useMemo(() => {
    if (!state.result) return false;
    return favorites.some(f => f.title === state.result?.title && f.timestamp === state.result?.timestamp);
  }, [state.result, favorites]);

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <nav className="sticky top-0 z-50 ethereal-blur border-b border-stone-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-stone-800 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-serif italic">QP</span>
          </div>
          <h1 className="text-xl tracking-widest uppercase font-light text-stone-800">Quille en Poème</h1>
        </div>
        <button onClick={() => setShowFavorites(!showFavorites)} className="px-4 py-2 bg-white rounded-full border border-stone-100 shadow-sm text-[10px] uppercase tracking-widest font-bold text-stone-500 hover:text-stone-800 transition-all flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Galerie ({favorites.length})
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* INPUTS */}
          <div className="space-y-10">
            <header className="space-y-4">
              <div className="flex items-center gap-2">
                 <div className="h-px w-8 bg-stone-300" />
                 <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold">Studio Manifestation</span>
              </div>
              <h2 className="text-6xl font-light text-stone-800 leading-[0.85]">Sucre en <br /><span className="italic">Poème</span></h2>
              <p className="text-stone-500 max-w-sm font-light leading-relaxed italic text-lg">"Where whimsical dreams are translated into edible soul."</p>
            </header>

            {state.error && (
              <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-600 animate-in fade-in zoom-in duration-300">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest font-bold">Incomplete Revelation</p>
                  <p className="text-xs opacity-80">{state.error}</p>
                </div>
              </div>
            )}

            <div className="bg-white p-8 rounded-[3rem] border border-stone-100 shadow-sm space-y-8">
              <div className="flex p-1 bg-stone-50 rounded-2xl">
                <button onClick={() => setMode('poetic')} className={`flex-1 py-4 rounded-xl transition-all ${mode === 'poetic' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 opacity-60'}`}>
                  <span className="text-[9px] uppercase tracking-widest font-bold">Poésie Botanique</span>
                </button>
                <button onClick={() => setMode('recreation')} className={`flex-1 py-4 rounded-xl transition-all ${mode === 'recreation' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 opacity-60'}`}>
                  <span className="text-[9px] uppercase tracking-widest font-bold">Étude de Maître</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Vessel Format</label>
                    <input type="text" value={pastryFormat} onChange={(e) => setPastryFormat(e.target.value)} placeholder="Single-tier Cake" className="w-full bg-stone-50 rounded-xl p-4 text-xs outline-none focus:ring-1 focus:ring-stone-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Occasion Aura</label>
                    <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Twilight Garden Wedding" className="w-full bg-stone-50 rounded-xl p-4 text-xs outline-none focus:ring-1 focus:ring-stone-200" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">The Poem / Prompt</label>
                  <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="A dream of a winter garden at dawn..." className="w-full h-32 bg-stone-50 rounded-2xl p-4 outline-none text-xs leading-relaxed resize-none focus:ring-1 focus:ring-stone-200" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Botanical Baseline</label>
                  {imageFile ? (
                    <div className="relative aspect-video rounded-3xl overflow-hidden shadow-inner ring-1 ring-stone-100">
                      <img src={imageFile} className="w-full h-full object-cover" />
                      <button onClick={() => setImageFile(null)} className="absolute top-3 right-3 p-1.5 bg-black/40 text-white rounded-full backdrop-blur-md"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-stone-100 rounded-3xl cursor-pointer hover:bg-stone-50 group">
                      <Camera className="w-6 h-6 text-stone-200 mb-2 group-hover:text-stone-400 transition-colors" />
                      <p className="text-[9px] uppercase tracking-widest font-bold text-stone-400">Upload Reference</p>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>

                <div className="space-y-4 pt-4">
                  <button disabled={state.isGenerating || (!prompt && !imageFile)} onClick={handleGenerate} className="w-full py-5 bg-stone-800 text-white rounded-[2rem] hover:bg-stone-700 transition-all font-medium flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl group">
                    {state.isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Manifesting Vision...</> : <><Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Manifest Design</>}
                  </button>
                  <button onClick={async () => { await (window as any).aistudio?.openSelectKey(); }} className="w-full py-3 bg-stone-50 text-stone-400 hover:text-stone-800 rounded-xl text-[9px] uppercase font-bold tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                    <Key className="w-3 h-3" /> Select API Key (Required for Image Gen)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RESULTS */}
          <div className="lg:sticky lg:top-24 h-fit">
            {state.isGenerating ? (
              <div className="aspect-square bg-white rounded-[4rem] border border-stone-100 shadow-sm flex flex-col items-center justify-center p-20 text-center animate-pulse">
                <Wand2 className="w-12 h-12 text-stone-200 mb-8" />
                <p className="text-xl serif italic text-stone-400 max-w-xs">"Translating unnamable feelings into edible soul..."</p>
                <div className="mt-8 flex gap-2">
                  {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-stone-100 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                </div>
              </div>
            ) : state.result ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="relative group">
                  <div className="aspect-square rounded-[4rem] overflow-hidden shadow-2xl border border-stone-100 bg-white ring-1 ring-stone-50">
                    {state.result.imageUrl ? (
                      <img src={state.result.imageUrl} className="w-full h-full object-cover grayscale-[5%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center text-stone-300 italic">
                        <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                        No visual manifest captured.
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute -bottom-8 -right-8 flex gap-3">
                    <button onClick={() => state.result && downloadPdf(state.result)} title="Download Technical Guide (PDF)" className="p-6 bg-stone-800 text-white rounded-full shadow-2xl hover:bg-stone-700 hover:scale-110 active:scale-95 transition-all"><FileText className="w-6 h-6" /></button>
                    <button onClick={() => toggleFavorite(state.result!)} title="Save to Galerie" className={`p-6 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 ${isFavorited ? 'bg-red-500 text-white' : 'bg-white text-stone-400 hover:text-red-500'}`}><Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} /></button>
                  </div>
                </div>

                <div className="space-y-10 px-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.4em] font-bold text-stone-300">
                      {state.result.mode === 'recreation' ? 'Étude de Maître' : 'Poésie Botanique'}
                      <div className="w-1.5 h-1.5 bg-stone-200 rounded-full" />
                      {state.result.pastryFormat || 'Patisserie Art'}
                    </div>
                    <h3 className="text-5xl font-light italic text-stone-800 leading-tight">{state.result.title}</h3>
                    <p className="text-lg text-stone-500 font-light italic leading-relaxed border-l-2 border-stone-100 pl-8">{state.result.visualDescription}</p>
                  </div>

                  <div className="space-y-12 bg-white p-12 rounded-[3.5rem] border border-stone-100 shadow-sm ring-1 ring-stone-50">
                    {/* COLOR ALCHEMY SECTION */}
                    <div className="space-y-8">
                      <div className="flex items-center gap-4">
                        <Droplets className="w-5 h-5 text-stone-300" />
                        <h4 className="text-[11px] uppercase tracking-[0.3em] font-bold text-stone-800">Alchimie des Couleurs (Peotraco)</h4>
                      </div>
                      <div className="space-y-8">
                        {state.result.colorRecipes.length > 0 ? state.result.colorRecipes.map((c, i) => (
                          <div key={i} className="flex gap-8 items-center group/color">
                            <div className="w-16 h-16 rounded-[1.5rem] border-4 border-stone-50 shadow-lg flex-shrink-0 transition-all group-hover/color:rounded-full group-hover/color:rotate-12" style={{ backgroundColor: c.hex }} />
                            <div className="flex-1">
                              <div className="text-[10px] uppercase font-bold text-stone-700 tracking-wider mb-2">{c.name}</div>
                              <p className="text-xs text-stone-400 font-light italic leading-relaxed bg-stone-50/50 p-2 rounded-lg border border-stone-100/50">Recette: {c.recipe}</p>
                            </div>
                          </div>
                        )) : (
                          <div className="p-6 bg-stone-50 rounded-2xl border border-dashed border-stone-100 text-center">
                            <RefreshCw className="w-4 h-4 text-stone-300 mx-auto mb-2" />
                            <p className="text-[10px] text-stone-300 uppercase font-bold tracking-widest">Awaiting Mixing Directives</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="h-px bg-stone-50" />

                    {/* GESTURAL SECTION */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Brush className="w-5 h-5 text-stone-300" />
                        <h4 className="text-[11px] uppercase tracking-[0.3em] font-bold text-stone-800">Geste Technique (Spatule)</h4>
                      </div>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-stone-100" />
                        <p className="text-xs text-stone-500 font-light leading-relaxed italic pl-8 whitespace-pre-wrap">{state.result.technique}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-stone-50/50 rounded-[4rem] border-2 border-dashed border-stone-100 flex flex-col items-center justify-center p-20 text-center text-stone-300 transition-all duration-700 hover:bg-stone-50">
                <Feather className="w-12 h-12 mb-6 opacity-20 animate-bounce" />
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold">L'Espace de la Création</p>
                <p className="mt-4 text-[9px] italic opacity-40">Compose your poem to reveal the vision.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* GALLERY DRAWER */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white z-[60] shadow-2xl transition-transform duration-500 border-l border-stone-100 flex flex-col ${showFavorites ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 border-b flex justify-between items-center bg-[#faf9f6]/50">
          <div>
            <h3 className="text-2xl serif italic">Le Musée</h3>
            <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">Saved Manifestations</p>
          </div>
          <button onClick={() => setShowFavorites(false)} className="p-3 hover:bg-stone-100 rounded-full transition-colors"><X className="w-5 h-5 text-stone-300" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {favorites.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
              <Globe className="w-8 h-8 mb-4 stroke-1" />
              <p className="text-xs italic">Your artistic journey awaits.</p>
            </div>
          ) : favorites.map((fav) => (
            <div key={`${fav.id}-${fav.timestamp}`} className="space-y-4 group relative">
              <div className="aspect-square rounded-[2rem] overflow-hidden shadow-sm border border-stone-100 relative bg-stone-50">
                {fav.imageUrl && <img src={fav.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />}
                <div className="absolute inset-0 bg-stone-800/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                   <button onClick={() => { setState({ ...state, result: fav }); setShowFavorites(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-4 bg-white text-stone-800 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform" title="Recall Vision"><ArrowRight className="w-5 h-5" /></button>
                   <button onClick={() => shareDesign(fav)} className="p-4 bg-white text-stone-600 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform" title="Share Manifestation">
                     {copyStatus === fav.id ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                   </button>
                   <button onClick={() => toggleFavorite(fav)} className="p-4 bg-white text-red-400 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform" title="Remove"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-stone-800">{fav.title}</h4>
                <p className="text-[9px] text-stone-400 font-bold uppercase tracking-tighter">{new Date(fav.timestamp).toLocaleDateString()} — {fav.mode === 'recreation' ? 'ÉTUDE' : 'POÈME'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
