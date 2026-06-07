const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 依存パッケージの自動インストール
try {
  require('express');
} catch (e) {
  console.log('必要なパッケージをインストールしています (express)...');
  try {
    execSync('npm install express', { stdio: 'inherit' });
    console.log('インストールが完了しました。アプリを起動します。');
  } catch (err) {
    console.error('パッケージのインストールに失敗しました。手動で "npm install express" を実行してください。', err);
    process.exit(1);
  }
}

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'naps.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// データの初期化
function loadNaps() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveNaps(naps) {
  fs.writeFileSync(DB_FILE, JSON.stringify(naps, null, 2));
}

// API: 記録の取得
app.get('/api/naps', (req, res) => {
  const naps = loadNaps();
  // 新しい順にソートして返す
  naps.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(naps);
});

// API: 記録の追加
app.post('/api/naps', (req, res) => {
  const { duration, note, date } = req.body;
  if (!duration || isNaN(duration)) {
    return res.status(400).json({ error: '有効な昼寝時間を入力してください。' });
  }

  const naps = loadNaps();
  const newNap = {
    id: Date.now().toString(),
    date: date || new Date().toISOString(),
    duration: parseInt(duration, 10),
    note: note || 'すっきり！'
  };

  naps.push(newNap);
  saveNaps(naps);
  res.status(201).json(newNap);
});

// API: 記録の削除
app.delete('/api/naps/:id', (req, res) => {
  const { id } = req.params;
  let naps = loadNaps();
  naps = naps.filter(nap => nap.id !== id);
  saveNaps(naps);
  res.json({ success: true });
});

// フロントエンド（単一HTML）の配信
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>シエスタタイマー - 昼寝記録＆タイマー</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=M+PLUS+Rounded+1c:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'M PLUS Rounded 1c', sans-serif;
      background-color: #f0f4f8;
    }
    .brand-font {
      font-family: 'Fredoka One', 'M PLUS Rounded 1c', sans-serif;
    }
  </style>
</head>
<body class="text-slate-800 min-h-screen flex flex-col justify-between">

  <!-- ヘッダー -->
  <header class="bg-indigo-600 text-white shadow-md py-4 px-6">
    <div class="max-w-4xl mx-auto flex justify-between items-center">
      <h1 class="text-2xl font-bold brand-font flex items-center gap-2">
        <span>💤</span> SiestaTimer
      </h1>
      <span class="text-sm bg-indigo-500 px-3 py-1 rounded-full">理想の仮眠をサポート</span>
    </div>
  </header>

  <!-- メインコンテンツ -->
  <main class="max-w-4xl w-full mx-auto p-4 flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
    
    <!-- 左側：タイマー＆記録入力 -->
    <section class="space-y-6">
      
      <!-- タイマーカード -->
      <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col items-center">
        <h2 class="text-lg font-bold text-slate-600 mb-4 flex items-center gap-1">⏱️ 仮眠タイマー</h2>
        
        <!-- 時間プリセットボタン -->
        <div class="flex gap-2 mb-6 w-full justify-center flex-wrap">
          <button onclick="setTimer(10)" class="preset-btn px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold text-sm transition-all border border-indigo-100">10分 <span class="text-xs block font-normal text-indigo-500">（パワーナップ）</span></button>
          <button onclick="setTimer(20)" class="preset-btn px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold text-sm transition-all border border-indigo-100">20分 <span class="text-xs block font-normal text-indigo-500">（標準仮眠）</span></button>
          <button onclick="setTimer(30)" class="preset-btn px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold text-sm transition-all border border-indigo-100">30分 <span class="text-xs block font-normal text-indigo-500">（熟睡注意）</span></button>
        </div>

        <!-- カスタム設定 -->
        <div class="flex items-center gap-2 mb-6 text-sm text-slate-600">
          <input type="number" id="custom-minutes" min="1" max="180" value="15" class="w-16 px-2 py-1 border rounded-lg text-center font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <span>分に</span>
          <button onclick="setTimer(document.getElementById('custom-minutes').value)" class="bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-lg text-xs font-bold transition-all">変更する</button>
        </div>

        <!-- タイマー表示盤 -->
        <div class="relative w-52 h-52 flex items-center justify-center mb-6">
          <svg class="w-full h-full transform -rotate-90">
            <circle cx="104" cy="104" r="92" stroke="#e2e8f0" stroke-width="8" fill="transparent" />
            <circle id="progress-bar" cx="104" cy="104" r="92" stroke="#4f46e5" stroke-width="10" fill="transparent" 
              stroke-dasharray="578" stroke-dashoffset="0" stroke-linecap="round" class="transition-all duration-300" />
          </svg>
          <div class="absolute text-center">
            <div id="timer-display" class="text-4xl font-bold text-slate-800 tracking-wider">15:00</div>
            <div id="timer-status" class="text-xs text-slate-400 mt-1">Ready</div>
          </div>
        </div>

        <!-- コントロールボタン -->
        <div class="flex gap-3 w-full">
          <button id="btn-start" onclick="toggleTimer()" class="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 transition-all flex justify-center items-center gap-2">
            <span id="btn-start-icon">▶</span> <span id="btn-start-text">スタート</span>
          </button>
          <button id="btn-reset" onclick="resetTimer()" class="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-all">
            リセット
          </button>
        </div>
      </div>

      <!-- 手動記録フォーム -->
      <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h3 class="text-md font-bold text-slate-700 mb-3 flex items-center gap-1">✍️ 手動で昼寝を記録する</h3>
        <form id="nap-form" onsubmit="saveNapManual(event)" class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-slate-500 mb-1">昼寝時間 (分)</label>
              <input type="number" id="form-duration" required min="1" class="w-full px-3 py-2 border rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400">
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-1">メモ・状態</label>
              <input type="text" id="form-note" placeholder="すっきり、眠いなど" class="w-full px-3 py-2 border rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400">
            </div>
          </div>
          <button type="submit" class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all text-sm shadow-sm">
            記録を保存
          </button>
        </form>
      </div>

    </section>

    <!-- 右側：データ履歴＆統計 -->
    <section class="space-y-6">
      
      <!-- 統計ダッシュボード -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 text-center">
          <span class="text-xs text-slate-400 block">総仮眠回数</span>
          <span id="stat-count" class="text-2xl font-bold text-indigo-600">- 回</span>
        </div>
        <div class="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 text-center">
          <span class="text-xs text-slate-400 block">平均仮眠時間</span>
          <span id="stat-avg" class="text-2xl font-bold text-emerald-600">- 分</span>
        </div>
      </div>

      <!-- 履歴リスト -->
      <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex-grow flex flex-col min-h-[300px]">
        <h3 class="text-lg font-bold text-slate-700 mb-4 flex items-center justify-between">
          <span>📅 昼寝の記録</span>
          <span class="text-xs text-slate-400">最新の記録を表示</span>
        </h3>
        
        <div id="naps-list" class="space-y-3 max-h-[400px] overflow-y-auto flex-grow pr-1">
          <!-- 読み込み中表示 -->
          <p class="text-center text-slate-400 py-8 text-sm">記録をロードしています...</p>
        </div>
      </div>

    </section>
  </main>

  <!-- アラーム停止モーダル -->
  <div id="alarm-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-short">
      <div class="text-6xl mb-4 animate-pulse">⏰</div>
      <h3 class="text-xl font-bold text-slate-800 mb-2">仮眠時間が終了しました！</h3>
      <p class="text-sm text-slate-500 mb-6">すっきりと起きましょう！仮眠時間を自動記録しますか？</p>
      
      <div class="space-y-2">
        <button onclick="stopAlarmAndSave()" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200">
          起きて記録する
        </button>
        <button onclick="stopAlarmOnly()" class="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl transition-all">
          記録せずに閉じる
        </button>
      </div>
    </div>
  </div>

  <!-- フッター -->
  <footer class="text-center py-6 text-xs text-slate-400 border-t border-slate-200 bg-white">
    <p>© SiestaTimer - 健やかな仮眠ライフを</p>
  </footer>

  <!-- クライアントサイド JavaScript -->
  <script>
    let timerInterval = null;
    let initialTime = 900; // デフォルト15分 (秒)
    let timeLeft = 900;
    let isRunning = false;
    let audioContext = null;
    let alarmOscillator = null;
    let currentTimerDuration = 15; // 記録用の元の設定時間 (分)

    // SVGサークルの周長
    const CIRCLE_CIRCUMFERENCE = 578;

    document.addEventListener("DOMContentLoaded", () => {
      fetchNaps();
      setTimer(15);
    });

    // タイマー時間設定
    function setTimer(minutes) {
      if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        document.getElementById('btn-start-text').innerText = 'スタート';
        document.getElementById('btn-start-icon').innerText = '▶';
        document.getElementById('btn-start').className = "flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 transition-all flex justify-center items-center gap-2";
      }
      currentTimerDuration = parseInt(minutes, 10);
      initialTime = currentTimerDuration * 60;
      timeLeft = initialTime;
      updateDisplay();
      document.getElementById('timer-status').innerText = 'Ready';
    }

    // 表示更新
    function updateDisplay() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      document.getElementById('timer-display').innerText = 
        \`\${String(minutes).padStart(2, '0')}:\${String(seconds).padStart(2, '0')}\`;

      // プログレスバー更新
      const progressBar = document.getElementById('progress-bar');
      const percentage = timeLeft / initialTime;
      const strokeOffset = CIRCLE_CIRCUMFERENCE * (1 - percentage);
      progressBar.style.strokeDashoffset = strokeOffset;
    }

    // タイマー スタート / 一時停止
    function toggleTimer() {
      if (isRunning) {
        // 一時停止
        clearInterval(timerInterval);
        isRunning = false;
        document.getElementById('btn-start-text').innerText = '再開する';
        document.getElementById('btn-start-icon').innerText = '▶';
        document.getElementById('btn-start').className = "flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200 transition-all flex justify-center items-center gap-2";
        document.getElementById('timer-status').innerText = 'Paused';
      } else {
        // スタート
        isRunning = true;
        document.getElementById('btn-start-text').innerText = '一時停止';
        document.getElementById('btn-start-icon').innerText = '⏸';
        document.getElementById('btn-start').className = "flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-200 transition-all flex justify-center items-center gap-2";
        document.getElementById('timer-status').innerText = '仮眠中...';

        timerInterval = setInterval(() => {
          if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
          } else {
            clearInterval(timerInterval);
            isRunning = false;
            triggerAlarm();
          }
        }, 1000);
      }
    }

    // タイマーリセット
    function resetTimer() {
      clearInterval(timerInterval);
      isRunning = false;
      timeLeft = initialTime;
      updateDisplay();
      document.getElementById('btn-start-text').innerText = 'スタート';
      document.getElementById('btn-start-icon').innerText = '▶';
      document.getElementById('btn-start').className = "flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 transition-all flex justify-center items-center gap-2";
      document.getElementById('timer-status').innerText = 'Ready';
    }

    // アラーム発生 (Web Audio API を利用したここちよいチャイム)
    function triggerAlarm() {
      document.getElementById('alarm-modal').classList.remove('hidden');
      document.getElementById('timer-status').innerText = 'お疲れ様でした！';
      playAlarmSound();
    }

    function playAlarmSound() {
      try {
        if (!audioContext) {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // 繰り返し心地よいビープ音を鳴らす
        let count = 0;
        const interval = setInterval(() => {
          if (!document.getElementById('alarm-modal').classList.contains('hidden')) {
            playTone(523.25, 0.15); // ド
            setTimeout(() => playTone(659.25, 0.15), 150); // ミ
            setTimeout(() => playTone(783.99, 0.3), 300); // ソ
          } else {
            clearInterval(interval);
          }
        }, 1500);

      } catch (e) {
        console.error("オーディオ再生エラー:", e);
      }
    }

    function playTone(freq, duration) {
      if (!audioContext) return;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start();
      osc.stop(audioContext.currentTime + duration);
    }

    // アラーム停止＆記録保存
    async function stopAlarmAndSave() {
      document.getElementById('alarm-modal').classList.add('hidden');
      resetTimer();

      // バックエンドに自動保存
      try {
        const response = await fetch('/api/naps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            duration: currentTimerDuration,
            note: 'タイマー完了ですっきり起床！',
            date: new Date().toISOString()
          })
        });
        if (response.ok) {
          fetchNaps();
        }
      } catch (err) {
        console.error('保存に失敗しました:', err);
      }
    }

    // アラームのみ停止
    function stopAlarmOnly() {
      document.getElementById('alarm-modal').classList.add('hidden');
      resetTimer();
    }

    // 手動記録送信
    async function saveNapManual(event) {
      event.preventDefault();
      const duration = document.getElementById('form-duration').value;
      const note = document.getElementById('form-note').value;

      try {
        const response = await fetch('/api/naps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ duration, note })
        });

        if (response.ok) {
          document.getElementById('form-duration').value = '';
          document.getElementById('form-note').value = '';
          fetchNaps();
        } else {
          alert('エラーが発生しました。値を正しく入力してください。');
        }
      } catch (err) {
        console.error(err);
      }
    }

    // データ読み込みと表示
    async function fetchNaps() {
      try {
        const response = await fetch('/api/naps');
        const naps = await response.json();
        renderNaps(naps);
        updateStats(naps);
      } catch (err) {
        console.error('データの読み込みに失敗しました:', err);
      }
    }

    // 統計の計算・更新
    function updateStats(naps) {
      const count = naps.length;
      document.getElementById('stat-count').innerText = \`\${count} 回\`;

      if (count > 0) {
        const total = naps.reduce((acc, curr) => acc + curr.duration, 0);
        const avg = Math.round(total / count);
        document.getElementById('stat-avg').innerText = \`\${avg} 分\`;
      } else {
        document.getElementById('stat-avg').innerText = '0 分';
      }
    }

    // 履歴リスト描画
    function renderNaps(naps) {
      const listContainer = document.getElementById('naps-list');
      if (naps.length === 0) {
        listContainer.innerHTML = \`
          <div class="text-center text-slate-400 py-12 text-sm flex flex-col items-center gap-2">
            <span class="text-3xl">🛏️</span>
            <span>まだ仮眠データがありません。<br>タイマーを使ってお昼寝をはじめましょう！</span>
          </div>
        \`;
        return;
      }

      listContainer.innerHTML = naps.map(nap => {
        const dateObj = new Date(nap.date);
        const formattedDate = \`\${dateObj.getFullYear()}/\${String(dateObj.getMonth() + 1).padStart(2, '0')}/\&nbsp;\${String(dateObj.getDate()).padStart(2, '0')} \${String(dateObj.getHours()).padStart(2, '0')}:\${String(dateObj.getMinutes()).padStart(2, '0')}\`;

        return \`
          <div class="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100/80 transition-all border border-slate-100">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-extrabold text-slate-800 bg-indigo-100/70 text-indigo-700 px-2 py-0.5 rounded-md">\${nap.duration} 分</span>
                <span class="text-xs text-slate-400 font-mono">\${formattedDate}</span>
              </div>
              <p class="text-xs text-slate-600 mt-1.5 font-medium">\${nap.note || 'すっきり！'}</p>
            </div>
            <button onclick="deleteNap('\${nap.id}')" class="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-all text-sm" title="削除">
              🗑️
            </button>
          </div>
        \`;
      }).join('');
    }

    // データの削除
    async function deleteNap(id) {
      if (!confirm('本当にこの仮眠記録を削除しますか？')) return;
      try {
        const response = await fetch(\`/api/naps/\${id}\`, { method: 'DELETE' });
        if (response.ok) {
          fetchNaps();
        }
      } catch (err) {
        console.error('削除失敗:', err);
      }
    }
  </script>
</body>
</html>
  `);
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` 昼寝記録＋タイマーアプリ (SiestaTimer) 🚀`);
  console.log(` サーバーがポート ${PORT} で起動しました。`);
  console.log(` ブラウザで以下にアクセスしてください:`);
  console.log(` http://localhost:${PORT}`);
  console.log(`=========================================`);
});