const songs = [
  { id: "s1", title: "夜空中最亮的星", artist: "逃跑计划", category: "国语", tags: ["热门", "乐队", "合唱"], duration: 258, color: "#ffd34d", lyrics: [[0,"夜空中最亮的星 能否听清"],[18,"那仰望的人 心底的孤独和叹息"],[38,"我祈祷拥有一颗透明的心灵"],[58,"和会流泪的眼睛"],[78,"给我再去相信的勇气"],[102,"越过谎言去拥抱你"],[132,"每当我找不到存在的意义"],[162,"每当我迷失在黑夜里"],[194,"夜空中最亮的星 请指引我靠近你"]] },
  { id: "s2", title: "海阔天空", artist: "Beyond", category: "粤语", tags: ["热门", "摇滚", "经典"], duration: 326, color: "#31d7c6", lyrics: [[0,"今天我 寒夜里看雪飘过"],[20,"怀着冷却了的心窝漂远方"],[44,"风雨里追赶 雾里分不清影踪"],[74,"天空海阔你与我 可会变"],[116,"多少次 迎着冷眼与嘲笑"],[156,"从没有放弃过心中的理想"],[206,"原谅我这一生不羁放纵爱自由"],[252,"也会怕有一天会跌倒"]] },
  { id: "s3", title: "告白气球", artist: "周杰伦", category: "国语", tags: ["甜歌", "热门", "轻快"], duration: 215, color: "#ff8fab", lyrics: [[0,"塞纳河畔 左岸的咖啡"],[19,"我手一杯 品尝你的美"],[38,"亲爱的 爱上你 从那天起"],[66,"甜蜜的很轻易"],[96,"亲爱的 别任性 你的眼睛"],[132,"在说我愿意"],[166,"拥有你就拥有 全世界"]] },
  { id: "s4", title: "稻香", artist: "周杰伦", category: "国语", tags: ["治愈", "热门"], duration: 223, color: "#a7f3d0", lyrics: [[0,"对这个世界如果你有太多的抱怨"],[24,"跌倒了就不敢继续往前走"],[54,"为什么人要这么的脆弱 堕落"],[92,"请你打开电视看看"],[128,"多少人为生命在努力勇敢的走下去"],[170,"还记得你说家是唯一的城堡"]] },
  { id: "s5", title: "后来", artist: "刘若英", category: "国语", tags: ["经典", "情歌"], duration: 341, color: "#93c5fd", lyrics: [[0,"后来 我总算学会了如何去爱"],[34,"可惜你 早已远去 消失在人海"],[76,"后来 终于在眼泪中明白"],[122,"有些人 一旦错过就不再"],[178,"栀子花 白花瓣 落在我蓝色百褶裙上"],[242,"爱你 你轻声说"]] },
  { id: "s6", title: "Someone Like You", artist: "Adele", category: "英文", tags: ["英文", "情歌"], duration: 285, color: "#c4b5fd", lyrics: [[0,"I heard that you're settled down"],[24,"That you found a voice and you're singing now"],[52,"Never mind I'll find someone like you"],[96,"I wish nothing but the best for you"],[146,"Sometimes it lasts in love"],[190,"But sometimes it hurts instead"]] },
  { id: "s7", title: "Lemon", artist: "米津玄师", category: "日语", tags: ["日语", "热门"], duration: 255, color: "#fde68a", lyrics: [[0,"梦ならばどれほどよかったでしょう"],[30,"未だにあなたのことを梦にみる"],[68,"忘れた物を取りに帰るように"],[112,"古びた思い出の埃を払う"],[166,"戻らない幸せがあることを"],[210,"最後にあなたが教えてくれた"]] },
  { id: "s8", title: "富士山下", artist: "陈奕迅", category: "粤语", tags: ["粤语", "经典"], duration: 259, color: "#fca5a5", lyrics: [[0,"拦路雨偏似雪花 饮泣的你冻吗"],[34,"这风褛我给你磨到有襟花"],[76,"连调了职也不怕 怎么始终牵挂"],[126,"苦心选中今天想车你回家"],[178,"原谅我不再送花"],[226,"伤口应要结疤"]] }
];

const storageKey = "vibektv-state-v2";
const saved = readSavedState();
const state = {
  category: "全部",
  query: "",
  queue: [],
  current: null,
  playing: false,
  startedAt: 0,
  pausedAt: 0,
  timer: null,
  synthNodes: [],
  favorites: new Set(saved.favorites || []),
  history: saved.history || [],
  toastTimer: null
};

const $ = (id) => document.querySelector(id);
const els = {
  songList: $("#songList"), queueList: $("#queueList"), songCount: $("#songCount"), queueCount: $("#queueCount"), searchInput: $("#searchInput"), player: $("#player"),
  playPauseBtn: $("#playPauseBtn"), nextBtn: $("#nextBtn"), restartBtn: $("#restartBtn"), progress: $("#progress"), lyrics: $("#lyrics"), stageTitle: $("#stageTitle"), stageArtist: $("#stageArtist"),
  modeBadge: $("#modeBadge"), timeLabel: $("#timeLabel"), nextSong: $("#nextSong"), musicVolume: $("#musicVolume"), micVolume: $("#micVolume"), reverb: $("#reverb"),
  micToggle: $("#micToggle"), vocalToggle: $("#vocalToggle"), importSongBtn: $("#importSongBtn"), importLyricBtn: $("#importLyricBtn"), audioFileInput: $("#audioFileInput"), lyricFileInput: $("#lyricFileInput"),
  clearQueueBtn: $("#clearQueueBtn"), surpriseBtn: $("#surpriseBtn"), favoriteBtn: $("#favoriteBtn"), scoreBtn: $("#scoreBtn"), clearHistoryBtn: $("#clearHistoryBtn"), fullscreenBtn: $("#fullscreenBtn"), toast: $("#toast")
};
let audioContext, masterGain, micStream, micGain, delayGain;

function readSavedState() { try { return JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { return {}; } }
function saveState() { localStorage.setItem(storageKey, JSON.stringify({ favorites: [...state.favorites], history: state.history, settings: { music: els.musicVolume?.value, mic: els.micVolume?.value, reverb: els.reverb?.value } })); }
function applySavedSettings() { const settings = saved.settings || {}; if (settings.music) els.musicVolume.value = settings.music; if (settings.mic) els.micVolume.value = settings.mic; if (settings.reverb) els.reverb.value = settings.reverb; }
function toast(message) { els.toast.textContent = message; els.toast.classList.add("show"); clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => els.toast.classList.remove("show"), 1600); }
function formatTime(seconds) { if (!Number.isFinite(seconds)) return "00:00"; return `${String(Math.floor(seconds / 60)).padStart(2,"0")}:${String(Math.floor(seconds % 60)).padStart(2,"0")}`; }
function currentTime() { return state.current?.localUrl ? els.player.currentTime || 0 : state.playing ? (audioContext.currentTime - state.startedAt) : state.pausedAt; }
function durationOf(song = state.current) { return song?.localUrl ? (els.player.duration || song.duration || 0) : (song?.duration || 0); }
function byId(id) { return songs.find((song) => song.id === id); }
function filteredSongs() {
  return songs.filter((song) => {
    const text = `${song.title} ${song.artist} ${song.category} ${song.tags.join(" ")}`.toLowerCase();
    const inCategory = state.category === "全部" || song.category === state.category || song.tags.includes(state.category) || (state.category === "收藏" && state.favorites.has(song.id)) || (state.category === "最近" && state.history.some((item) => item.id === song.id));
    return inCategory && text.includes(state.query.toLowerCase());
  });
}
function ensureAudio() { if (audioContext) return; audioContext = new AudioContext(); masterGain = audioContext.createGain(); masterGain.connect(audioContext.destination); updateMusicVolume(); }
function stopSynth() { state.synthNodes.forEach((node) => { try { node.stop?.(); node.disconnect?.(); } catch {} }); state.synthNodes = []; }
function scheduleTone(time, frequency, length, gainValue, type = "sine") { const osc = audioContext.createOscillator(); const gain = audioContext.createGain(); osc.type = type; osc.frequency.value = frequency; gain.gain.setValueAtTime(0.0001, time); gain.gain.exponentialRampToValueAtTime(gainValue, time + 0.02); gain.gain.exponentialRampToValueAtTime(0.0001, time + length); osc.connect(gain).connect(masterGain); osc.start(time); osc.stop(time + length + 0.05); state.synthNodes.push(osc); }
function scheduleBeat(offset = 0) { ensureAudio(); stopSynth(); const bpm = els.vocalToggle.checked ? 76 : 92; const beat = 60 / bpm; const start = audioContext.currentTime + 0.04; state.startedAt = audioContext.currentTime - offset; const song = state.current; const horizon = Math.min(song.duration - offset, 36); const base = [261.63, 329.63, 392.0, 493.88]; for (let t = 0; t < horizon; t += beat) { const now = start + t; const step = Math.floor((offset + t) / beat) % 8; scheduleTone(now, base[step % base.length] / 2, beat * 0.82, 0.08, "triangle"); if (step % 2 === 0) scheduleTone(now, 92, 0.08, 0.12, "square"); scheduleTone(now + beat * 0.5, 880, 0.03, 0.03, "sine"); } }
function playSynth(offset = 0) { ensureAudio(); audioContext.resume(); state.playing = true; state.pausedAt = offset; scheduleBeat(offset); startTimer(); }
function pauseSynth() { state.pausedAt = currentTime(); state.playing = false; stopSynth(); stopTimer(); }
function startTimer() { stopTimer(); state.timer = setInterval(tick, 180); }
function stopTimer() { if (state.timer) clearInterval(state.timer); state.timer = null; }
function tick() { if (!state.current) return; const now = currentTime(); const duration = durationOf(); if (duration && now >= duration) return nextSong(); els.progress.value = duration ? (now / duration) * 100 : 0; els.timeLabel.textContent = `${formatTime(now)} / ${formatTime(duration)}`; renderLyrics(now); if (!state.current.localUrl && state.playing && audioContext.currentTime - state.startedAt - state.pausedAt > 30) scheduleBeat(now); }
function updateMusicVolume() { const volume = Number(els.musicVolume.value) / 100; els.player.volume = volume; if (masterGain) masterGain.gain.value = volume; saveState(); }
async function toggleMic() { ensureAudio(); if (!els.micToggle.checked) { if (micStream) micStream.getTracks().forEach((track) => track.stop()); micStream = null; return; } try { micStream = await navigator.mediaDevices.getUserMedia({ audio: true }); const micSource = audioContext.createMediaStreamSource(micStream); micGain = audioContext.createGain(); const delayNode = audioContext.createDelay(.25); delayGain = audioContext.createGain(); delayNode.delayTime.value = .12; updateMicMix(); micSource.connect(micGain).connect(audioContext.destination); micSource.connect(delayNode).connect(delayGain).connect(audioContext.destination); toast("麦克风已连接"); } catch { els.micToggle.checked = false; toast("没有拿到麦克风权限"); } }
function updateMicMix() { if (micGain) micGain.gain.value = Number(els.micVolume.value) / 100; if (delayGain) delayGain.gain.value = Number(els.reverb.value) / 180; saveState(); }
function addHistory(song) { state.history = [{ id: song.id, title: song.title, artist: song.artist, playedAt: Date.now() }, ...state.history.filter((item) => item.id !== song.id)].slice(0, 20); saveState(); }
function toggleFavorite(song) { if (state.favorites.has(song.id)) { state.favorites.delete(song.id); toast("已取消收藏"); } else { state.favorites.add(song.id); toast("已收藏"); } saveState(); renderSongs(); updateFavoriteButton(); }
function renderSongs() { const list = filteredSongs(); els.songCount.textContent = `${list.length} 首可点`; els.songList.innerHTML = list.length ? list.map((song) => `<article class="song-card ${state.favorites.has(song.id) ? "favorite" : ""}"><div class="cover" style="background: linear-gradient(135deg, ${song.color}, #fff)">${song.title.slice(0,1)}</div><div class="song-meta"><strong>${song.title}</strong><span>${song.artist}</span><div class="tag-row">${song.category} · ${song.tags.slice(0,2).join(" · ")} · ${formatTime(song.duration)}</div></div><div class="song-actions"><button class="pick-button" data-pick="${song.id}">点歌</button><button class="star-button ${state.favorites.has(song.id) ? "active" : ""}" data-star="${song.id}">★</button></div></article>`).join("") : `<div class="empty-state">没有找到匹配的歌曲</div>`; }
function renderQueue() { els.queueCount.textContent = `${state.queue.length} 首排队`; els.queueList.innerHTML = state.queue.length ? state.queue.map((song, index) => `<article class="queue-item ${state.current?.id === song.id ? "playing" : ""}"><div class="queue-meta"><strong>${index + 1}. ${song.title}</strong><span>${song.artist}</span></div><div class="queue-tools"><button class="small-button" data-play-index="${index}">播放</button><button class="small-button" data-top="${index}">置顶</button><button class="small-button" data-remove="${index}">移除</button></div></article>`).join("") : `<div class="empty-state">还没有点歌</div>`; const currentIndex = state.queue.findIndex((song) => song.id === state.current?.id); const next = state.queue[currentIndex + 1] || state.queue.find((song) => song.id !== state.current?.id); els.nextSong.textContent = `下一首：${next ? `${next.title} - ${next.artist}` : "暂无"}`; }
function renderStage() { if (!state.current) return; els.stageTitle.textContent = state.current.title; els.stageArtist.textContent = state.current.artist; els.modeBadge.textContent = els.vocalToggle.checked ? "原唱" : "伴奏"; updateFavoriteButton(); renderLyrics(currentTime()); }
function renderLyrics(now = 0) { if (!state.current) return; const lines = state.current.lyrics?.length ? state.current.lyrics : [[0, "暂无歌词"]]; let active = 0; lines.forEach(([time], index) => { if (now >= time) active = index; }); const from = Math.max(0, active - 1); els.lyrics.innerHTML = lines.slice(from, active + 3).map(([_, text], index) => `<p class="${from + index === active ? "active" : ""}">${text}</p>`).join(""); }
function updateFavoriteButton() { if (!state.current) { els.favoriteBtn.textContent = "收藏当前"; return; } els.favoriteBtn.textContent = state.favorites.has(state.current.id) ? "取消收藏" : "收藏当前"; }
function playSong(song, keep = true) { ensureAudio(); stopSynth(); els.player.pause(); state.current = song; state.pausedAt = 0; if (keep && !state.queue.some((item) => item.id === song.id)) state.queue.push(song); addHistory(song); if (song.localUrl) { els.player.src = song.localUrl; els.player.currentTime = 0; els.player.play(); state.playing = true; startTimer(); } else { els.player.removeAttribute("src"); playSynth(0); } els.playPauseBtn.textContent = "暂停"; renderStage(); renderQueue(); renderSongs(); }
function addToQueue(song) { if (!song) return; state.queue.push(song); toast(`已点：${song.title}`); if (!state.current) playSong(song, false); renderQueue(); }
function nextSong() { if (!state.queue.length) { stopPlayback(); return; } const currentIndex = state.queue.findIndex((song) => song.id === state.current?.id); const next = state.queue[currentIndex + 1] || state.queue[0]; playSong(next, false); }
function togglePlay() { if (!state.current && state.queue[0]) playSong(state.queue[0], false); if (!state.current) return; if (state.current.localUrl) { if (els.player.paused) { els.player.play(); state.playing = true; startTimer(); els.playPauseBtn.textContent = "暂停"; } else { els.player.pause(); state.playing = false; stopTimer(); els.playPauseBtn.textContent = "播放"; } } else { if (state.playing) { pauseSynth(); els.playPauseBtn.textContent = "播放"; } else { playSynth(state.pausedAt); els.playPauseBtn.textContent = "暂停"; } } }
function stopPlayback() { stopSynth(); els.player.pause(); els.player.removeAttribute("src"); state.current = null; state.playing = false; state.pausedAt = 0; stopTimer(); els.playPauseBtn.textContent = "播放"; els.progress.value = 0; els.timeLabel.textContent = "00:00 / 00:00"; els.stageTitle.textContent = "还没有开始播放"; els.stageArtist.textContent = "先点一首歌吧"; els.lyrics.innerHTML = "<p>欢迎来到 VibeKTV</p><p>点歌后歌词会在这里滚动</p>"; updateFavoriteButton(); renderQueue(); }
function parseLrc(text) { const lines = []; text.split(/\r?\n/).forEach((line) => { const matches = [...line.matchAll(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g)]; const lyric = line.replace(/\[[^\]]+\]/g, "").trim(); if (!matches.length || !lyric) return; matches.forEach((match) => { const seconds = Number(match[1]) * 60 + Number(match[2]) + Number((match[3] || "0").padEnd(3, "0")) / 1000; lines.push([seconds, lyric]); }); }); return lines.sort((a, b) => a[0] - b[0]); }
function bindEvents() {
  document.querySelectorAll(".nav-tab").forEach((button) => button.addEventListener("click", () => { document.querySelector(".nav-tab.active").classList.remove("active"); button.classList.add("active"); state.category = button.dataset.category; renderSongs(); }));
  els.searchInput.addEventListener("input", (event) => { state.query = event.target.value; renderSongs(); });
  els.songList.addEventListener("click", (event) => { const pick = event.target.dataset.pick; const star = event.target.dataset.star; if (pick) addToQueue(byId(pick)); if (star) toggleFavorite(byId(star)); });
  els.queueList.addEventListener("click", (event) => { const remove = event.target.dataset.remove; const top = event.target.dataset.top; const playIndex = event.target.dataset.playIndex; if (remove !== undefined) { const removed = state.queue.splice(Number(remove), 1)[0]; if (removed?.id === state.current?.id) { state.queue.length ? nextSong() : stopPlayback(); } else { renderQueue(); } return; } if (top !== undefined) { const [song] = state.queue.splice(Number(top), 1); state.queue.unshift(song); renderQueue(); toast("已置顶"); return; } if (playIndex !== undefined) playSong(state.queue[Number(playIndex)], false); });
  els.playPauseBtn.addEventListener("click", togglePlay); els.nextBtn.addEventListener("click", nextSong); els.restartBtn.addEventListener("click", () => state.current && playSong(state.current, false));
  els.progress.addEventListener("input", () => { const target = Number(els.progress.value) / 100 * durationOf(); if (state.current?.localUrl) els.player.currentTime = target; else { state.pausedAt = target; if (state.playing) playSynth(target); else tick(); } });
  els.player.addEventListener("loadedmetadata", () => { if (state.current?.localUrl && Number.isFinite(els.player.duration)) state.current.duration = els.player.duration; tick(); renderSongs(); });
  els.player.addEventListener("ended", nextSong); els.musicVolume.addEventListener("input", updateMusicVolume); els.micVolume.addEventListener("input", updateMicMix); els.reverb.addEventListener("input", updateMicMix); els.micToggle.addEventListener("change", toggleMic);
  els.vocalToggle.addEventListener("change", () => { renderStage(); if (state.current && !state.current.localUrl && state.playing) playSynth(currentTime()); });
  els.clearQueueBtn.addEventListener("click", () => { state.queue = state.current ? [state.current] : []; renderQueue(); toast("队列已清理"); });
  els.surpriseBtn.addEventListener("click", () => { const list = filteredSongs(); const song = list[Math.floor(Math.random() * list.length)]; if (song) addToQueue(song); });
  els.favoriteBtn.addEventListener("click", () => state.current && toggleFavorite(state.current));
  els.scoreBtn.addEventListener("click", () => { const score = Math.floor(82 + Math.random() * 17); els.scoreBtn.textContent = `评分 ${score}`; setTimeout(() => els.scoreBtn.textContent = "开启评分", 1200); });
  els.clearHistoryBtn.addEventListener("click", () => { state.history = []; saveState(); renderSongs(); toast("最近记录已清空"); });
  els.fullscreenBtn.addEventListener("click", () => { document.body.classList.toggle("fullscreen-stage"); els.fullscreenBtn.textContent = document.body.classList.contains("fullscreen-stage") ? "退出全屏" : "演唱全屏"; });
  els.importSongBtn.addEventListener("click", () => els.audioFileInput.click());
  els.importLyricBtn.addEventListener("click", () => { if (!state.current) return toast("请先播放一首歌"); els.lyricFileInput.click(); });
  els.audioFileInput.addEventListener("change", (event) => { const file = event.target.files[0]; if (!file) return; const localSong = { id: `local-${Date.now()}`, title: file.name.replace(/\.[^.]+$/, ""), artist: "本地导入", category: "国语", tags: ["本地", "导入"], duration: 240, color: "#86efac", localUrl: URL.createObjectURL(file), lyrics: [[0,"本地歌曲已导入"],[12,"可以导入 LRC 歌词替换这里"],[28,"现在可以测试点歌和播放流程"],[44,"VibeKTV 正在开唱"]] }; songs.unshift(localSong); addToQueue(localSong); renderSongs(); event.target.value = ""; });
  els.lyricFileInput.addEventListener("change", async (event) => { const file = event.target.files[0]; if (!file || !state.current) return; const lines = parseLrc(await file.text()); if (!lines.length) return toast("没有解析到有效歌词"); state.current.lyrics = lines; renderLyrics(currentTime()); toast(`已导入 ${lines.length} 行歌词`); event.target.value = ""; });
  document.addEventListener("keydown", (event) => { if (["INPUT", "TEXTAREA"].includes(event.target.tagName)) return; if (event.code === "Space") { event.preventDefault(); togglePlay(); } if (event.key.toLowerCase() === "n") nextSong(); if (event.key.toLowerCase() === "f") els.fullscreenBtn.click(); if (event.key.toLowerCase() === "r") state.current && playSong(state.current, false); });
}
applySavedSettings(); updateMusicVolume(); renderSongs(); renderQueue(); bindEvents();

