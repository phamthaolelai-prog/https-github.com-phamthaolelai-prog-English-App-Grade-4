
import React, { useState, useEffect } from 'react';
import type { Unit, ToastState } from '../types';
import { ILLUSTRATIONS } from '../constants';
import { calculateScore, playApplause, playBeepError } from '../utils';
import { useSpeech } from '../hooks/useSpeech';
import { IconButton } from './IconButton';
import { ScoreBar } from './ScoreBar';
import { Toast } from './Toast';
import { VolumeIcon, MicIcon, PrevIcon, NextIcon } from './icons';

interface VocabularyPanelProps {
  unit: Unit;
  currentWordIndex: number;
  onNextWord: () => void;
  onPrevWord: () => void;
  speechRate: number;
  selectedVoice: string;
}

export const VocabularyPanel: React.FC<VocabularyPanelProps> = ({ unit, currentWordIndex, onNextWord, onPrevWord, speechRate, selectedVoice }) => {
  const { speak, startRecording, isRecording, isSupported: micSupported } = useSpeech();
  const [heardWord, setHeardWord] = useState('—');
  const [score, setScore] = useState(0);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'ok', visible: false });

  const currentWord = unit.vocab[currentWordIndex];
  
  useEffect(() => {
    setHeardWord('—');
    setScore(0);
    setToast(t => ({...t, visible: false}));
  }, [currentWordIndex, unit]);

  const showToast = (type: 'ok' | 'warn' | 'bad', message: string) => {
    setToast({ type, message, visible: true });
  };
  
  const handleScore = (target: string, spoken: string) => {
    const newScore = calculateScore(target, spoken);
    setScore(newScore);

    if (newScore >= 9) {
      playApplause();
      speak('Excellent!', speechRate, selectedVoice);
      showToast('ok', '👏 Excellent! Phát âm rất tốt.');
    } else if (newScore >= 7) {
      showToast('ok', '👍 Khá tốt! Cố gắng rõ âm hơn nhé.');
    } else if (newScore >= 5) {
      showToast('warn', '🟠 Chưa chuẩn lắm, đọc chậm và nhấn trọng âm.');
    } else {
      playBeepError();
      speak('You can do it better.', speechRate, selectedVoice);
      showToast('bad', '❌ Chưa đúng. Nghe mẫu rồi đọc lại nhé.');
    }
  };

  const handleRecord = () => {
    if (!micSupported) {
        showToast('warn', 'Trình duyệt chưa hỗ trợ thu âm (SpeechRecognition). Vui lòng dùng Chrome.');
        return;
    }
    if (isRecording) return; // Should be handled by disabling button, but as a safeguard.
    
    setHeardWord('(đang nghe…)');
    startRecording(
        'en-US',
        (transcript) => {
            setHeardWord(transcript);
            handleScore(currentWord, transcript);
        },
        () => {
            showToast('bad', 'Không thu được âm. Thử lại nhé.');
            setHeardWord('—');
        }
    );
  };
  
  return (
    <div className="bg-white border border-[color:var(--frame)] rounded-[var(--radius)] p-3.5 shadow-[var(--shadow)]">
      <div className="grid md:grid-cols-[120px_1fr_auto] gap-4 items-center">
        <div className="w-[110px] h-[110px] mx-auto md:mx-0 rounded-2xl border border-[color:var(--frame)] bg-gradient-to-br from-white to-indigo-50 shadow-[var(--shadow)] grid place-items-center text-6xl">
          {ILLUSTRATIONS[currentWord] || '🔤'}
        </div>
        <div>
          <div className="text-sm text-[color:var(--muted)]">Unit hiện tại • Từ số {currentWordIndex + 1}/{unit.vocab.length}</div>
          <div className="text-4xl lg:text-5xl font-extrabold tracking-wide my-1" aria-live="polite">{currentWord}</div>
          <div className="flex flex-wrap gap-2">
            {unit.topicChips.map(chip => <div key={chip} className="bg-[color:var(--chip)] border border-indigo-200 text-[#2b3674] px-2.5 py-2 rounded-full text-xs">{chip}</div>)}
          </div>
        </div>
        <div className="flex gap-2.5 justify-center">
          <IconButton aria-label="Nghe phát âm từ" onClick={() => speak(currentWord, speechRate, selectedVoice)}>
            <VolumeIcon />
          </IconButton>
          <IconButton aria-label="Thu âm đọc từ" onClick={handleRecord} pressed={isRecording} disabled={isRecording}>
            <MicIcon />
          </IconButton>
          <IconButton aria-label="Từ trước" onClick={onPrevWord}>
            <PrevIcon />
          </IconButton>
          <IconButton aria-label="Từ tiếp theo" variant="next" onClick={onNextWord}>
            <NextIcon />
          </IconButton>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-2.5">
        <div>
          <div className="text-sm text-[color:var(--muted)]">Bạn nói:</div>
          <div className="bg-indigo-50 border-dashed border-indigo-200 border rounded-xl p-2.5 text-sm min-h-[44px]" aria-live="polite">{heardWord}</div>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-[color:var(--muted)]">Điểm phát âm</div>
            <div className="font-bold">{score}/10</div>
          </div>
          <ScoreBar score={score} />
        </div>
      </div>
      <Toast toastState={toast} onDismiss={() => setToast(t => ({ ...t, visible: false }))} />
    </div>
  );
};
