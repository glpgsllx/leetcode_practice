'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  Download,
  History,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Shuffle,
  Target,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { categories, problems, type Difficulty, type Problem } from './problems';

declare global {
  interface Document {
    modelContext?: {
      registerTool: (
        tool: {
          name: string;
          title: string;
          description: string;
          inputSchema: Record<string, unknown>;
          annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
          execute: (input: unknown) => unknown;
        },
        options?: { signal?: AbortSignal },
      ) => void | Promise<void>;
    };
  }
}

type Result = '通过' | '未通过' | '看题解';
type Attempt = {
  id: string;
  problemId: number;
  duration: number;
  result: Result;
  note: string;
  createdAt: string;
};

const STORE_KEY = 'hot100-tracker-v1';
const resultStyle: Record<Result, string> = {
  通过: 'result-pass',
  未通过: 'result-fail',
  看题解: 'result-review',
};

const difficultyStyle: Record<Difficulty, string> = {
  简单: 'difficulty easy',
  中等: 'difficulty medium',
  困难: 'difficulty hard',
};

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function pickRandom(pool: Problem[], currentId?: number) {
  const choices = pool.filter((problem) => problem.id !== currentId);
  const source = choices.length ? choices : pool;
  return source[Math.floor(Math.random() * source.length)] ?? problems[0];
}

export default function Home() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [current, setCurrent] = useState<Problem | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [note, setNote] = useState('');
  const [draftMinutes, setDraftMinutes] = useState('0');
  const [draftSeconds, setDraftSeconds] = useState('0');
  const [difficulty, setDifficulty] = useState<'全部' | Difficulty>('全部');
  const [category, setCategory] = useState('全部专题');
  const [unmasteredOnly, setUnmasteredOnly] = useState(true);
  const [search, setSearch] = useState('');
  const [activeView, setActiveView] = useState<'练习' | '题目' | '记录'>('练习');
  const fileInput = useRef<HTMLInputElement>(null);
  const currentRef = useRef<Problem | null>(null);
  const secondsRef = useRef(0);
  const poolRef = useRef<Problem[]>(problems);
  currentRef.current = current;
  secondsRef.current = seconds;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved) setAttempts(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORE_KEY);
    }
    setCurrent(pickRandom(problems));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORE_KEY, JSON.stringify(attempts));
  }, [attempts, hydrated]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const byProblem = useMemo(() => {
    const map = new Map<number, Attempt[]>();
    attempts.forEach((attempt) => map.set(attempt.problemId, [...(map.get(attempt.problemId) ?? []), attempt]));
    return map;
  }, [attempts]);

  const passedIds = useMemo(
    () => new Set(attempts.filter((attempt) => attempt.result === '通过').map((attempt) => attempt.problemId)),
    [attempts],
  );

  const pool = useMemo(() => {
    let result = problems.filter((problem) =>
      (difficulty === '全部' || problem.difficulty === difficulty) &&
      (category === '全部专题' || problem.category === category),
    );
    if (unmasteredOnly) {
      const fresh = result.filter((problem) => {
        const passes = (byProblem.get(problem.id) ?? []).filter((attempt) => attempt.result === '通过').length;
        return passes < 2;
      });
      if (fresh.length) result = fresh;
    }
    return result;
  }, [difficulty, category, unmasteredOnly, byProblem]);
  poolRef.current = pool;

  const visibleProblems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return problems.filter((problem) => !query || `${problem.id} ${problem.title} ${problem.category}`.toLowerCase().includes(query));
  }, [search]);

  const totalSeconds = attempts.reduce((sum, attempt) => sum + attempt.duration, 0);
  const average = attempts.length ? Math.round(totalSeconds / attempts.length) : 0;

  function draw(problem?: Problem) {
    setCurrent(problem ?? pickRandom(pool, current?.id));
    setSeconds(0);
    setRunning(false);
    setFinishing(false);
    setNote('');
    setDraftMinutes('0');
    setDraftSeconds('0');
    setActiveView('练习');
  }

  function openFinish() {
    setRunning(false);
    setDraftMinutes(String(Math.floor(seconds / 60)));
    setDraftSeconds(String(seconds % 60));
    setFinishing(true);
  }

  function finish(result: Result) {
    if (!current) return;
    const duration = Math.max(0, (Number.parseInt(draftMinutes, 10) || 0) * 60 + (Number.parseInt(draftSeconds, 10) || 0));
    setAttempts((items) => [{
      id: crypto.randomUUID(),
      problemId: current.id,
      duration,
      result,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    }, ...items]);
    setCurrent(pickRandom(poolRef.current, current.id));
    setSeconds(0);
    setFinishing(false);
    setRunning(false);
    setNote('');
    setDraftMinutes('0');
    setDraftSeconds('0');
  }

  function deleteAttempt(id: string) {
    if (!window.confirm('确定删除这条练习记录吗？')) return;
    setAttempts((items) => items.filter((attempt) => attempt.id !== id));
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), attempts }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hot100-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function importData(file?: File) {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed.attempts)) throw new Error('invalid');
      setAttempts(parsed.attempts);
    } catch {
      window.alert('无法导入：请选择本工具导出的 JSON 文件。');
    }
  }

  const currentAttempts = current ? byProblem.get(current.id) ?? [] : [];

  useEffect(() => {
    if (!hydrated || !document.modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    const context = document.modelContext;

    void Promise.resolve(context.registerTool({
      name: 'draw_random_problem',
      title: '随机抽一道 Hot 100',
      description: '从 LeetCode Hot 100 中随机抽取一道题，并在页面中开始一次新的练习。可选按难度或专题筛选。',
      inputSchema: {
        type: 'object',
        properties: {
          difficulty: { type: 'string', enum: ['全部', '简单', '中等', '困难'] },
          category: { type: 'string', enum: ['全部专题', ...categories] },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const value = (input ?? {}) as { difficulty?: string; category?: string };
        if (value.difficulty && !['全部', '简单', '中等', '困难'].includes(value.difficulty)) throw new Error('不支持的难度');
        if (value.category && !['全部专题', ...categories].includes(value.category)) throw new Error('不支持的专题');
        const eligible = problems.filter((problem) =>
          (!value.difficulty || value.difficulty === '全部' || problem.difficulty === value.difficulty) &&
          (!value.category || value.category === '全部专题' || problem.category === value.category),
        );
        const selected = pickRandom(eligible, currentRef.current?.id);
        setCurrent(selected);
        setSeconds(0);
        setRunning(false);
        setFinishing(false);
        setActiveView('练习');
        return { id: selected.id, title: selected.title, difficulty: selected.difficulty, category: selected.category };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);

    void Promise.resolve(context.registerTool({
      name: 'record_current_attempt',
      title: '记录本次刷题结果',
      description: '为页面中当前题目记录一次练习结果、用时和可选笔记。',
      inputSchema: {
        type: 'object',
        properties: {
          result: { type: 'string', enum: ['通过', '未通过', '看题解'] },
          durationSeconds: { type: 'integer', minimum: 0 },
          note: { type: 'string', maxLength: 500 },
        },
        required: ['result'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const value = input as { result?: Result; durationSeconds?: number; note?: string };
        const selected = currentRef.current;
        if (!selected) throw new Error('当前没有题目');
        if (!value || !['通过', '未通过', '看题解'].includes(value.result ?? '')) throw new Error('结果必须是：通过、未通过或看题解');
        const duration = value.durationSeconds ?? secondsRef.current;
        if (!Number.isInteger(duration) || duration < 0) throw new Error('用时必须是非负整数秒');
        const attempt: Attempt = { id: crypto.randomUUID(), problemId: selected.id, duration, result: value.result!, note: (value.note ?? '').slice(0, 500), createdAt: new Date().toISOString() };
        setAttempts((items) => [attempt, ...items]);
        const next = pickRandom(poolRef.current, selected.id);
        setCurrent(next);
        setSeconds(0);
        setRunning(false);
        setFinishing(false);
        setNote('');
        return { problemId: selected.id, title: selected.title, result: attempt.result, durationSeconds: duration, saved: true, nextProblem: { id: next.id, title: next.title } };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);

    return () => lifecycle.abort();
  }, [hydrated]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setActiveView('练习')} aria-label="回到练习">
          <span className="brand-mark">L<span>100</span></span>
          <span><strong>刷题轨迹</strong><small>LeetCode Hot 100</small></span>
        </button>
        <nav aria-label="主导航">
          {(['练习', '题目', '记录'] as const).map((view) => (
            <button key={view} className={activeView === view ? 'active' : ''} onClick={() => setActiveView(view)}>{view}</button>
          ))}
        </nav>
        <div className="header-progress">
          <span>{passedIds.size}<small>/ 100 已通过</small></span>
          <Progress value={passedIds.size} className="progress-bar" />
        </div>
      </header>

      <main>
        {activeView === '练习' && (
          <section className="practice-view">
            <aside className="filter-panel">
              <p className="eyebrow">随机条件</p>
              <div className="filter-group">
                <label>难度</label>
                <div className="segmented">
                  {(['全部', '简单', '中等', '困难'] as const).map((item) => (
                    <button key={item} className={difficulty === item ? 'selected' : ''} onClick={() => setDifficulty(item)}>{item}</button>
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <label htmlFor="category">专题</label>
                <select id="category" value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option>全部专题</option>
                  {categories.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <label className="check-row">
                <input type="checkbox" checked={unmasteredOnly} onChange={(event) => setUnmasteredOnly(event.target.checked)} />
                <span><strong>优先未掌握</strong><small>排除已通过 2 次的题目</small></span>
              </label>
              <div className="pool-size"><Target />当前池中 <strong>{pool.length}</strong> 道题</div>
              <Button className="draw-side" onClick={() => draw()}><Shuffle />重新抽一道</Button>
              <div className="tip"><span>TIP</span><p>同一道题至少独立通过两次，才算真正掌握。</p></div>
            </aside>

            <div className="practice-main">
              <div className="practice-heading">
                <div><p className="eyebrow">本次挑战</p><h1>专注解决眼前这一题</h1></div>
                <Button variant="outline" onClick={() => draw()}><RefreshCw />换一题</Button>
              </div>

              {current && (
                <article className="problem-card">
                  <div className="card-stripe" />
                  <div className="problem-meta">
                    <span className={difficultyStyle[current.difficulty]}>{current.difficulty}</span>
                    <span>{current.category}</span>
                    <span className="attempt-count">已刷 {currentAttempts.length} 次</span>
                  </div>
                  <div className="problem-title">
                    <span className="problem-number">{current.id}</span>
                    <div><p>LEETCODE HOT 100</p><h2>{current.title}</h2></div>
                  </div>
                  <a className="leetcode-link" href={`https://leetcode.cn/problems/${current.slug}/description/?envId=top-100-liked&envType=study-plan-v2`} target="_blank" rel="noreferrer">
                    在力扣中打开题目 <ArrowUpRight />
                  </a>
                  <div className="timer-block">
                    <p><Clock3 />本次用时</p>
                    <output aria-live="polite">{formatTime(seconds)}</output>
                    <div className="timer-actions">
                      <Button size="lg" onClick={() => setRunning((value) => !value)}>
                        {running ? <><Pause />暂停</> : <><Play />{seconds ? '继续' : '开始计时'}</>}
                      </Button>
                      <Button size="lg" variant="outline" onClick={() => { setRunning(false); setSeconds(0); }}><RotateCcw />归零</Button>
                    </div>
                  </div>
                  {!finishing ? (
                    <Button className="finish-button" size="lg" variant="outline" onClick={openFinish}>结束本次练习<ChevronRight /></Button>
                  ) : (
                    <div className="finish-panel">
                      <div><strong>这次结果如何？</strong><button onClick={() => setFinishing(false)} aria-label="取消记录"><X /></button></div>
                      <div className="duration-editor">
                        <label><Clock3 />本次用时</label>
                        <div>
                          <label><input aria-label="用时分钟" type="number" min="0" value={draftMinutes} onChange={(event) => setDraftMinutes(event.target.value)} /><span>分</span></label>
                          <label><input aria-label="用时秒数" type="number" min="0" max="59" value={draftSeconds} onChange={(event) => setDraftSeconds(event.target.value)} /><span>秒</span></label>
                        </div>
                      </div>
                      <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="可选：记下卡住的地方、关键思路……" rows={2} />
                      <div className="result-buttons">
                        <button className="pass" onClick={() => finish('通过')}><Check />通过</button>
                        <button className="review" onClick={() => finish('看题解')}><Search />看题解</button>
                        <button className="fail" onClick={() => finish('未通过')}><X />未通过</button>
                      </div>
                    </div>
                  )}
                </article>
              )}
            </div>

            <aside className="stats-panel">
              <p className="eyebrow">你的轨迹</p>
              <div className="stats-grid">
                <div><strong>{attempts.length}</strong><span>总练习次数</span></div>
                <div><strong>{formatTime(average)}</strong><span>平均用时</span></div>
                <div><strong>{passedIds.size}</strong><span>已通过题目</span></div>
                <div><strong>{formatTime(totalSeconds)}</strong><span>累计专注</span></div>
              </div>
              <div className="recent-heading"><span><History />最近记录</span><button onClick={() => setActiveView('记录')}>查看全部</button></div>
              <div className="recent-list">
                {attempts.slice(0, 5).map((attempt) => {
                  const problem = problems.find((item) => item.id === attempt.problemId)!;
                  return <div className="recent-entry" key={attempt.id}><button className="recent-problem" onClick={() => draw(problem)}><span className={resultStyle[attempt.result]} /> <div><strong>{problem.id}. {problem.title}</strong><small>{new Date(attempt.createdAt).toLocaleDateString('zh-CN')} · {formatTime(attempt.duration)}</small></div><span>{attempt.result}</span></button><button className="delete-attempt" onClick={() => deleteAttempt(attempt.id)} aria-label={`删除 ${problem.title} 的记录`} title="删除记录"><Trash2 /></button></div>;
                })}
                {!attempts.length && <div className="empty-small">完成第一道题后，记录会出现在这里。</div>}
              </div>
            </aside>
          </section>
        )}

        {activeView === '题目' && (
          <section className="library-view">
            <div className="view-heading"><div><p className="eyebrow">完整题单</p><h1>Hot 100 题目库</h1></div><label className="search-box"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索题号、名称或专题" /></label></div>
            <div className="problem-grid">
              {visibleProblems.map((problem) => {
                const records = byProblem.get(problem.id) ?? [];
                const passes = records.filter((item) => item.result === '通过').length;
                return <button className="library-card" key={problem.id} onClick={() => draw(problem)}><span className="list-number">{problem.id}</span><div><strong>{problem.title}</strong><small>{problem.category} · {problem.difficulty}</small></div><span className={passes >= 2 ? 'mastered' : passes ? 'started' : ''}>{passes >= 2 ? '已掌握' : records.length ? `${records.length} 次` : '未开始'}</span></button>;
              })}
            </div>
          </section>
        )}

        {activeView === '记录' && (
          <section className="history-view">
            <div className="view-heading"><div><p className="eyebrow">完整记录</p><h1>每一次尝试都算数</h1></div><div className="data-actions"><input ref={fileInput} hidden type="file" accept="application/json" onChange={(event) => importData(event.target.files?.[0])} /><Button variant="outline" onClick={() => fileInput.current?.click()}><Upload />导入</Button><Button variant="outline" onClick={exportData} disabled={!attempts.length}><Download />导出</Button></div></div>
            {attempts.length ? <div className="history-table"><div className="history-row table-head"><span>题目</span><span>结果</span><span>用时</span><span>日期</span><span>笔记</span></div>{attempts.map((attempt) => { const problem = problems.find((item) => item.id === attempt.problemId)!; return <button className="history-row" key={attempt.id} onClick={() => draw(problem)}><span><strong>{problem.id}. {problem.title}</strong><small>{problem.category}</small></span><span className={`result-pill ${resultStyle[attempt.result]}`}>{attempt.result}</span><span>{formatTime(attempt.duration)}</span><span>{new Date(attempt.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span><span>{attempt.note || '—'}</span></button>; })}</div> : <div className="empty-state"><History /><h2>还没有练习记录</h2><p>抽一道题，开启你的 Hot 100 轨迹。</p><Button onClick={() => setActiveView('练习')}><Shuffle />开始第一题</Button></div>}
          </section>
        )}
      </main>
      <footer><span>数据仅保存在你的浏览器中</span><a href="https://leetcode.cn/studyplan/top-100-liked/" target="_blank" rel="noreferrer">力扣 Hot 100 官方题单 <ArrowUpRight /></a></footer>
    </div>
  );
}
