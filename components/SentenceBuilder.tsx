
import React, { useState, useEffect } from 'react';
import type { Unit } from '../types';
import { DATA } from '../constants';
import { conjugateRoutinePhrase, conjugateVerb, timeToWords } from '../utils';

interface SentenceBuilderProps {
  unit: Unit;
  onSentenceChange: (question: string, modelAnswer: string) => void;
}

const subjects = ['I', 'He', 'She', 'We', 'They'];

export const SentenceBuilder: React.FC<SentenceBuilderProps> = ({ unit, onSentenceChange }) => {
  const [state, setState] = useState<Record<string, string>>({});

  useEffect(() => {
    let question = unit.qs[0] || '—';
    let modelAnswer = '—';

    switch (unit.builderType) {
      case 'country': {
        const subj = state.subj || 'I';
        const country = state.country || DATA.countries[0];
        const be = subj === 'I' ? "I'm" : (subj === 'He' ? "He's" : (subj === 'She' ? "She's" : (subj === 'We' ? "We're" : "They're")));
        modelAnswer = `${be} from ${country}.`;
        question = subj === 'I' ? "Where are you from?" : `Where is ${subj.toLowerCase()} from?`;
        break;
      }
      case 'routine': {
        const subj = state.subj || 'I';
        const verb = state.verb || DATA.routines[0];
        const verbPhrase = conjugateRoutinePhrase(verb, subj);
        const baseVerb = verb.split(' ')[0];
        const qAux = (subj === 'He' || subj === 'She') ? 'does' : 'do';
        const qSubj = (subj === 'He' || subj === 'She') ? subj.toLowerCase() : 'you';
        question = `What time ${qAux} ${qSubj} ${verb}?`;
        const timeStr = timeToWords(state.hour || '1', state.min || '0');
        modelAnswer = `${subj} ${verbPhrase} at ${timeStr}.`;
        break;
      }
      case 'week': {
        const mode = state.mode || 'its';
        const day = state.day || DATA.days[0];
        if (mode === 'its') {
          modelAnswer = `It's ${day}.`;
          question = "What day is it today?";
        } else {
          const subj = state.subj || 'I';
          const activity = state.activity || "study at school";
          const verb = activity.split(' ')[0];
          const conjugated = conjugateVerb(verb, subj);
          const rest = activity.split(' ').slice(1).join(' ');
          modelAnswer = `${subj} ${conjugated}${rest ? ' ' + rest : ''}.`;
          question = `What do you do on ${day}?`;
        }
        break;
      }
      case 'party': {
        const type = state.type || 'eat';
        const item = state.item || (type === 'eat' ? DATA.partyEat[0] : DATA.partyDrink[0]);
        modelAnswer = `I want some ${item}.`;
        question = `What do you want to ${type}?`;
        break;
      }
      case 'ability': {
        const subj = state.subj || 'I';
        const ans = state.ans || 'Yes';
        const a1 = state.a1 || DATA.abilities[0];
        const a2 = state.a2 || '';
        const pron = subj.toLowerCase() === 'i' ? 'I' : subj.toLowerCase();
        const qSubj = subj.toLowerCase() === 'i' ? 'you' : subj.toLowerCase();
        question = `Can ${qSubj} ${a1}?`;
        if (ans === 'Yes') {
          modelAnswer = `Yes, ${pron} can.`;
        } else {
          modelAnswer = `No, ${pron} can’t` + (a2 ? `, but ${pron} can ${a2}.` : '.');
        }
        break;
      }
    }
    onSentenceChange(question, modelAnswer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, unit, onSentenceChange]);
  
  // Reset state when unit changes
  useEffect(() => setState({}), [unit]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const renderSelect = (name: string, label: string, options: string[]) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select name={name} value={state[name] || options[0]} onChange={handleChange} className="w-full p-2.5 border border-[color:var(--frame)] rounded-xl bg-white text-[color:var(--ink)] text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand)]">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const renderBuilderUI = () => {
    switch(unit.builderType) {
      case 'country':
        return <div className="grid grid-cols-2 gap-2.5">
          {renderSelect('subj', 'Chủ ngữ', subjects)}
          {renderSelect('country', 'Quốc gia', DATA.countries)}
        </div>;
      case 'routine':
        return <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {renderSelect('subj', 'Chủ ngữ', subjects)}
          {renderSelect('verb', 'Hoạt động', DATA.routines)}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giờ</label>
            <div className="flex gap-1.5">
              {renderSelect('hour', '', [...Array(12)].map((_,i)=>`${i+1}`))}
              {renderSelect('min', '', ['0', '30', '45'])}
            </div>
          </div>
        </div>;
      case 'week':
        return <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {renderSelect('mode', 'Kiểu câu', ['its', 'doon'], ['It\'s [Day].', 'I/He/She ... (theo ngày)'])}
          {state.mode === 'doon' && renderSelect('subj', 'Chủ ngữ', subjects)}
          {renderSelect('day', 'Thứ/ngày', DATA.days)}
          {state.mode === 'doon' && renderSelect('activity', 'Hoạt động', ["study at school", "do housework", "listen to music", "stay at home"])}
        </div>;
        function renderSelect(name: string, label: string, options: string[], displayOptions?: string[]) {
            return (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <select name={name} value={state[name] || options[0]} onChange={handleChange} className="w-full p-2.5 border border-[color:var(--frame)] rounded-xl bg-white text-[color:var(--ink)] text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand)]">
                  {(displayOptions || options).map((o, i) => <option key={options[i]} value={options[i]}>{o}</option>)}
                </select>
              </div>
            );
        }
      case 'party':
        return <div className="grid grid-cols-2 gap-2.5">
          {renderSelect('type', 'Chọn loại', ['eat', 'drink'])}
          {renderSelect('item', 'Món', state.type === 'eat' ? DATA.partyEat : DATA.partyDrink)}
        </div>;
      case 'ability':
        return <>
            <div className="grid grid-cols-3 gap-2.5">
                {renderSelect('subj', 'Chủ ngữ', ['I', 'He', 'She'])}
                {renderSelect('ans', 'Trả lời', ['Yes', 'No'])}
                {renderSelect('a1', 'Hành động', DATA.abilities)}
            </div>
            {state.ans === 'No' && <div className="mt-2">{renderSelect('a2', 'Nếu "No", chọn khả năng khác', ['', ...DATA.abilities])}</div>}
        </>;
      default: return null;
    }
  }

  return <div>{renderBuilderUI()}</div>;
};
