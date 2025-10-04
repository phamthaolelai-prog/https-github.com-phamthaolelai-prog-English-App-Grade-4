
import React, { useState, useCallback, useEffect } from 'react';
import type { Unit, ToastState } from '../types';
import { useSpeech } from '../hooks/useSpeech';
import { calculateScore, playApplause, playBeepError } from '../utils';
import { IconButton } from './IconButton';
import { ScoreBar } from './ScoreBar';
import { Toast } from './Toast';
import { SentenceBuilder } from './SentenceBuilder';
import { VolumeIcon, MicIcon } from './icons';

interface SentencePanelProps {
  unit: Unit;
  speechRate: number;
  selectedVoice: string;
}

export const SentencePanel: React.FC<SentencePanelProps> = ({ unit, speechRate, selectedVoice }) => {
  const { speak, startRecording, isRecording, isSupported: micSupported } = useSpeech();
  
  const [question, setQuestion] = useState('—');
  const [modelAnswer, setModelAnswer] = useState('—');
  const [builtSentence, setBuiltSentence] = useState('—');
  
  const [heardSentence, setHeardSentence] = useState('—');
  const [score, setScore] = useState(0);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'ok', visible: false });

  const handleSentenceChange = useCallback((newQuestion: string, newModelAnswer: string) => {
    setQuestion(newQuestion);
    setModelAnswer(newModelAnswer);
    setBuiltSentence(newModelAnswer); // Default user answer to model answer
  }, []);

  // Reset state when unit changes
  useEffect(() => {
    setHeardSentence('—');
    setScore(0);
    setToast(t => ({...t, visible: false}));
  }, [unit]);

  const showToast = (type: 'ok' | 'warn' | 'bad', message: string) => {
    setToast({ type, message, visible: true });
  };

  const handleScore = (target: string, spoken: string) => {
    const newScore = calculateScore(target, spoken);
    setScore(newScore);

    if (newScore >= 9) {
      playApplause();
      speak('Excellent!', speechRate, selectedVoice);
      showToast('ok', '👏 Excellent! Câu rất chuẩn.');
    } else if (newScore >= 7) {
      showToast('ok', '👍 Khá tốt! Nói liền mạch tự nhiên hơn.');
    } else if (newScore >= 5) {
      showToast('warn', '🟠 Cần rõ ràng hơn từng từ trong câu.');
    } else {
      playBeepError();
      speak('You can do it better.', speechRate, selectedVoice);
      showToast('bad', '❌ Phát âm chưa đúng. Nghe lại câu rồi thử lần nữa nhé.');
    }
  };

  const handleRecord = () => {
    if (!micSupported) {
        showToast('warn', 'Trình duyệt chưa hỗ trợ thu âm (SpeechRecognition). Vui lòng dùng Chrome.');
        return;
    }
    if (isRecording) return;
    
    setHeardSentence('(đang nghe…)');
    startRecording(
        'en-US',
        (transcript) => {
            setHeardSentence(transcript);
            handleScore(builtSentence, transcript);
        },
        () => {
            showToast('bad', 'Không thu được âm. Thử lại nhé.');
            setHeardSentence('—');
        }
    );
  };

  return (
    <div className="bg-white border border-[color:var(--frame)] rounded-[var(--radius)] p-3.5 shadow-[var(--shadow)] space-y-3">
      {/* Question */}
      <div className="flex items-center justify-between gap-3 bg-gradient-to-b from-amber-50 to-white border border-amber-200 rounded-xl p-2.5">
        <div>
          <div className="text-sm text-[color:var(--muted)]">CÂU HỎI LUYỆN</div>
          <div className="font-bold" aria-live="polite">{question}</div>
        </div>
        <IconButton aria-label="Nghe câu hỏi" onClick={() => speak(question, speechRate, selectedVoice)}>
          <VolumeIcon />
        </IconButton>
      </div>

      {/* Builder */}
      <SentenceBuilder unit={unit} onSentenceChange={handleSentenceChange} />
      
      {/* Answers */}
      <div className="grid md:grid-cols-2 gap-3 mt-1.5">
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-[color:var(--muted)]">CÂU TRẢ LỜI MẪU</div>
            <IconButton aria-label="Nghe câu trả lời mẫu" onClick={() => speak(modelAnswer, speechRate, selectedVoice)} className="w-12 h-12">
              <VolumeIcon />
            </IconButton>
          </div>
          <div className="text-xl font-bold bg-indigo-50 border border-indigo-200 rounded-xl p-2.5 min-h-[68px]" aria-live="polite">{modelAnswer}</div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-[color:var(--muted)]">CÂU TRẢ LỜI CỦA BẠN</div>
            <div className="flex gap-2">
              <IconButton aria-label="Nghe câu trả lời của bạn" onClick={() => speak(builtSentence, speechRate, selectedVoice)} className="w-12 h-12">
                <VolumeIcon />
              </IconButton>
              <IconButton aria-label="Thu âm đọc câu" pressed={isRecording} onClick={handleRecord} disabled={isRecording} className="w-12 h-12">
                <MicIcon />
              </IconButton>
            </div>
          </div>
          <div className="text-xl font-bold bg-indigo-50 border border-indigo-200 rounded-xl p-2.5 min-h-[68px]" aria-live="polite">{builtSentence}</div>
        </div>
      </div>

      {/* Scoring */}
      <div className="grid md:grid-cols-2 gap-4 mt-2.5">
        <div>
          <div className="text-sm text-[color:var(--muted)]">Bạn nói:</div>
          <div className="bg-indigo-50 border-dashed border-indigo-200 border rounded-xl p-2.5 text-sm min-h-[44px]" aria-live="polite">{heardSentence}</div>
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
