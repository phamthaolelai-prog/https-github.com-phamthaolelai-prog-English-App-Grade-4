
const audioCtx = (window.AudioContext || (window as any).webkitAudioContext) ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

export function playBeepError() {
  if(!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type='square'; o.frequency.setValueAtTime(320, audioCtx.currentTime);
  g.gain.setValueAtTime(0.001,audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime+0.02);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+0.35);
  o.connect(g).connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime+0.36);
}

export function playApplause() {
    if (!audioCtx) return;
    const playNoise = (delay: number) => {
        const dur = 0.8, sr = audioCtx.sampleRate, N = sr * dur;
        const buf = audioCtx.createBuffer(1, N, sr);
        const data = buf.getChannelData(0);
        for (let i = 0; i < N; i++) {
            const t = i / N, env = Math.pow(1 - t, 2);
            data[i] = (Math.random() * 2 - 1) * env * 0.6;
        }
        const src = audioCtx.createBufferSource(); src.buffer = buf;
        const filter = audioCtx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 1800; filter.Q.value = 0.7;
        const gain = audioCtx.createGain(); gain.gain.value = 0.6;
        src.connect(filter).connect(gain).connect(audioCtx.destination);
        src.start(audioCtx.currentTime + delay);
    };
    playNoise(0);
    playNoise(0.12);
    playNoise(0.25);
}


function normalize(s: string): string {
  return (s || '').toLowerCase()
    .replace(/’/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  a = normalize(a); b = normalize(b);
  const al = a.length, bl = b.length;
  if (al === 0) return bl; if (bl === 0) return al;
  const dp = Array.from({ length: al + 1 }, () => Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) dp[i][0] = i;
  for (let j = 0; j <= bl; j++) dp[0][j] = j;
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[al][bl];
}

export function calculateScore(target: string, spoken: string): number {
  const A = normalize(target), B = normalize(spoken);
  if (!B) return 1;
  const dist = levenshtein(A, B);
  const maxLen = Math.max(A.length, B.length) || 1;
  const sim = Math.max(0, 1 - dist / maxLen);
  let s = Math.round(sim * 9) + 1; s = Math.max(1, Math.min(10, s));
  return s;
}

const isThirdPerson = (s?: string) => ['he', 'she', 'it'].includes(String(s || '').toLowerCase());

export function conjugateVerb(base: string, subject: string): string {
  const b = base.toLowerCase();
  if (!isThirdPerson(subject)) return base;
  if (b === 'have') return 'has';
  if (b === 'do') return 'does';
  if (b === 'go') return 'goes';
  if (/[^aeiou]y$/.test(b)) return base.slice(0, -1) + 'ies';
  if (/(o|s|x|z|ch|sh)$/.test(b)) return base + 'es';
  return base + 's';
}

function getRoutineParts(phrase: string): [string, string] {
  const dict: { [key: string]: [string, string] } = {
    'get up': ['get', 'up'],
    'have breakfast': ['have', 'breakfast'],
    'go to school': ['go', 'to school'],
    'go to bed': ['go', 'to bed'],
    'do homework': ['do', 'homework'],
    'wash face': ['wash', 'face'],
    'clean the teeth': ['clean', 'the teeth']
  };
  return dict[phrase] || [phrase.split(' ')[0], phrase.split(' ').slice(1).join(' ')];
}

export function conjugateRoutinePhrase(phrase: string, subject: string): string {
  const [base, rest] = getRoutineParts(phrase);
  const conjugatedBase = conjugateVerb(base, subject);
  return rest ? `${conjugatedBase} ${rest}` : conjugatedBase;
}

export function timeToWords(h: string, m: string): string {
  const hour = parseInt(h, 10);
  const min = parseInt(m, 10);
  const hourNames = ["twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"];
  const hourWord = hourNames[hour % 12 === 0 ? 0 : hour % 12];

  let minuteWord = "";
  if (min === 0) minuteWord = "o’clock";
  else if (min === 30) minuteWord = "thirty";
  else if (min === 45) minuteWord = "forty five";
  else minuteWord = String(min).padStart(2, '0');
  
  return `${hourWord} ${minuteWord}`;
}
