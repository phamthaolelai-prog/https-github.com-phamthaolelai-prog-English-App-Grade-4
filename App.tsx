
import React, { useState, useEffect, useMemo } from 'react';
import { DATA } from './constants';
import { AppMode, Unit } from './types';
import { VocabularyPanel } from './components/VocabularyPanel';
import { SentencePanel } from './components/SentencePanel';
import { useSpeech } from './hooks/useSpeech';

const App: React.FC = () => {
  const [currentUnitId, setCurrentUnitId] = useState<number>(1);
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.Vocabulary);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  
  const { voices } = useSpeech();
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  const currentUnit: Unit = useMemo(() => DATA.units[currentUnitId], [currentUnitId]);

  useEffect(() => {
    const [brand, accent] = currentUnit.theme;
    document.documentElement.style.setProperty('--brand', brand);
    document.documentElement.style.setProperty('--accent', accent);
  }, [currentUnit]);

  useEffect(() => {
    if (voices.length > 0 && !selectedVoice) {
      const preferredVoices = [
        "Google UK English Female", "Microsoft Zira - English (United States)", "Google US English", "Google UK English Male"
      ];
      const foundVoice = voices.find(v => preferredVoices.includes(v.name)) || voices.find(v => v.lang.startsWith('en-'));
      if (foundVoice) {
        setSelectedVoice(foundVoice.name);
      }
    }
  }, [voices, selectedVoice]);

  const handleSetUnit = (id: number) => {
    setCurrentUnitId(id);
    setCurrentWordIndex(0);
  };

  const handleNextWord = () => {
    setCurrentWordIndex(prev => (prev + 1) % currentUnit.vocab.length);
  };

  const handlePrevWord = () => {
    setCurrentWordIndex(prev => (prev - 1 + currentUnit.vocab.length) % currentUnit.vocab.length);
  };
  
  const renderVoiceOptions = () => {
    const groupedVoices: Record<string, SpeechSynthesisVoice[]> = {
      'British': voices.filter(v => v.lang.startsWith('en-GB')),
      'American': voices.filter(v => v.lang.startsWith('en-US')),
      'Australian': voices.filter(v => v.lang.startsWith('en-AU')),
      'Other': voices.filter(v => v.lang.startsWith('en-') && !v.lang.startsWith('en-GB') && !v.lang.startsWith('en-US') && !v.lang.startsWith('en-AU')),
    };

    return Object.entries(groupedVoices).map(([groupName, groupVoices]) => {
      if (groupVoices.length === 0) return null;
      return (
        <optgroup label={groupName} key={groupName}>
          {groupVoices.map(voice => (
            <option key={voice.name} value={voice.name}>{voice.name}</option>
          ))}
        </optgroup>
      );
    });
  };

  return (
    <div className="max-w-5xl mx-auto my-5 p-4 bg-[color:var(--paper)] border border-[color:var(--frame)] rounded-3xl shadow-[var(--shadow)]" role="application" aria-label="ENGLISH APP-GRADE 4">
      <header className="flex flex-wrap gap-3 items-center justify-between mb-2">
        <div className="flex gap-3 items-center">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[color:var(--brand)] via-[color:var(--accent)] to-[color:var(--ok)] shadow-inner-white shadow-[var(--shadow)]" aria-hidden="true"></div>
          <div>
            <h1 className="text-xl font-bold leading-tight">ENGLISH APP-GRADE 4</h1>
            <div className="text-xs text-[color:var(--muted)]">Units 1–5 • Vocabulary & Sentence Builder • Voice & Mic Practice</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 items-center">
            <div className="flex gap-2 items-center bg-white border border-[color:var(--frame)] p-2 rounded-xl">
                <label htmlFor="unitSel" className="text-sm">Unit:</label>
                <select id="unitSel" value={currentUnitId} onChange={(e) => handleSetUnit(Number(e.target.value))} className="p-2 border border-[color:var(--frame)] rounded-lg bg-white text-sm outline-none">
                    {Object.keys(DATA.units).map(id => <option key={id} value={id}>{id}. {DATA.units[Number(id)].name}</option>)}
                </select>
            </div>
          
            <div className="flex gap-2 bg-white border border-[color:var(--frame)] p-1.5 rounded-xl" role="tablist">
                <button onClick={() => setActiveMode(AppMode.Vocabulary)} className={`px-3.5 py-2.5 rounded-lg text-sm transition-colors ${activeMode === AppMode.Vocabulary ? 'bg-[color:var(--brand)] text-white' : 'bg-transparent'}`} role="tab" aria-selected={activeMode === AppMode.Vocabulary}>Từ vựng</button>
                <button onClick={() => setActiveMode(AppMode.Sentence)} className={`px-3.5 py-2.5 rounded-lg text-sm transition-colors ${activeMode === AppMode.Sentence ? 'bg-[color:var(--brand)] text-white' : 'bg-transparent'}`} role="tab" aria-selected={activeMode === AppMode.Sentence}>Mẫu câu</button>
            </div>

            <div className="flex gap-2 items-center bg-white border border-[color:var(--frame)] p-2 rounded-xl">
                <label htmlFor="voiceSel" className="text-sm">Giọng:</label>
                <select id="voiceSel" value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} className="p-2 border border-[color:var(--frame)] rounded-lg bg-white text-sm outline-none">
                    {renderVoiceOptions()}
                </select>
            </div>

            <div className="flex gap-2 items-center bg-white border border-[color:var(--frame)] p-2 rounded-xl">
                <label htmlFor="rate" className="text-sm">Tốc độ:</label>
                <input id="rate" type="number" min="0.7" max="1.4" step="0.1" value={speechRate} onChange={(e) => setSpeechRate(Number(e.target.value))} className="w-20 p-2 border border-[color:var(--frame)] rounded-lg bg-white text-sm outline-none"/>
            </div>
        </div>
      </header>

      <main className="mt-1.5">
        {activeMode === AppMode.Vocabulary ? (
          <VocabularyPanel 
            unit={currentUnit} 
            currentWordIndex={currentWordIndex}
            onNextWord={handleNextWord}
            onPrevWord={handlePrevWord}
            speechRate={speechRate}
            selectedVoice={selectedVoice}
          />
        ) : (
          <SentencePanel 
            unit={currentUnit}
            speechRate={speechRate}
            selectedVoice={selectedVoice}
          />
        )}
      </main>

      <footer className="text-xs text-[color:var(--muted)] text-center mt-2">
        Dùng <strong>Google Chrome</strong> để bật micro. Chọn <strong>Giọng</strong> (Anh–Anh/Mỹ/Úc). Hình minh hoạ có thể thay bằng ảnh riêng.
      </footer>
    </div>
  );
};

export default App;
