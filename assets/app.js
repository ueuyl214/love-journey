(function () {
  const START_DATE = new Date("2022-10-07T00:00:00+08:00");
  const LYRIC_SYNC_OFFSET = 0.12;
  const FINAL_LRC = `
[00:00.00] 《我的满分题》
[00:13.10] 你总害怕自己不行 偶尔偷偷地叹气
[00:19.50] 总觉得做得不够好
[00:21.38] 一个人默默委屈
[00:24.75] 但在我的心里 知道
[00:27.29] 你一直都是最棒的
[00:31.24] 每次我都相信你
[00:33.26] 你的存在就是满分题
[00:37.74] 记得一千天纪念的那个秘密
[00:44.10] 你把酒店房间 藏满了浪漫的痕迹
[00:50.35] 而我像个呆子 挂着相机
[00:53.77] 拎着一大袋礼物
[00:56.92] 只想把这心动 一帧一帧存进内存里
[01:03.90] 你是我心里永远 最闪耀的那个“小白”
[01:07.59] 我是永远陪着你 逗你笑的“小鸡毛”
[01:10.84] 一千三百四十天
[01:12.36] 每天都是热恋的步调
[01:15.91] 你不知道你发光的样子
[01:19.35] 究竟有多么的好
[01:22.51] 别再偷偷没自信啦
[01:24.87] 我的女孩
[01:26.15] 你已经把全宇宙的可爱 都统统承包
[01:32.96] 回忆那次考完试
[01:34.52] 剧情走向实在太搞笑
[01:36.20] 你想给我惊喜
[01:37.56] 偷偷在地铁站门口守着通道
[01:39.64] 我也想给你惊喜
[01:40.76] 故意发消息说“哎呀还没到”
[01:42.62] 结果我一顿操作 直接奔向了酒店的转角
[01:45.52] 你问我怎么不在
[01:47.35] 我问你跑去了哪条街道
[01:48.74] 我们在两个坐标
[01:49.94] 玩着双向奔赴的捉迷藏
[01:51.80] 就算完美错过 也是只有我们懂的甜度频道
[01:57.51] 你总是把我照顾得 无微不至刚刚好
[02:03.96] 而我也想做你 遮风挡雨的外套
[02:10.10] 就算未来偶尔会有 想要退缩的烦恼
[02:16.90] 别怕 把你的那些小自卑 通通都上交
[02:21.50] 吉他 Solo 过渡
[02:49.50] 你是我心里永远 最闪耀的那个“小白”
[02:53.22] 我是永远陪着你 逗你笑的“小鸡毛”
[02:56.44] 一千三百四十天
[02:57.98] 每天都是热恋的步调
[03:01.54] 你不知道你发光的样子
[03:04.94] 究竟有多么的好
[03:08.12] 别再偷偷没自信啦
[03:10.48] 我的女孩
[03:11.75] 你在我心里的C位 永远替换不掉
[03:15.77] 三年多 只是个美好的起跑
[03:19.00] 牵着线条小狗 我们接着闹
[03:22.97] 小白和小鸡毛 永远刚刚好
  `.trim();
  const FINAL_LYRICS = parseLrc(FINAL_LRC);

  const chapters = window.MEMORY_CHAPTERS || [];
  const memories = window.MEMORIES || [];
  const chapterMap = new Map(chapters.map((chapter) => [chapter.key, chapter]));

  const state = {
    activeFilter: "all",
    activeChapter: chapters[0] ? chapters[0].key : "all",
    modalIndex: 0,
    finalLyricIndex: -1,
    finalShown: false
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    renderHeroCollage();
    renderHeroStats();
    renderChapterNav();
    renderSpotlight(state.activeChapter);
    renderSeriesShelves();
    renderAlbumStack();
    renderFilterTabs();
    renderGallery("all");
    bindEvents();
    startCounter();
  }

  function cacheElements() {
    [
      "gate",
      "app",
      "enterButton",
      "counter",
      "heroStats",
      "heroCollage",
      "chapterNav",
      "chapterSpotlight",
      "seriesShelves",
      "filterTabs",
      "memoryGrid",
      "galleryIntro",
      "randomButton",
      "albumStack",
      "flower",
      "finalScreen",
      "finalSongPlayer",
      "finalPlayButton",
      "finalSongProgress",
      "finalSongTime",
      "lyricsList",
      "againButton",
      "lightbox",
      "lightboxImage",
      "lightboxTitle",
      "lightboxMeta",
      "closeLightbox",
      "prevMemory",
      "nextMemory"
    ].forEach((id) => {
      els[id] = document.getElementById(id);
    });
  }

  function bindEvents() {
    els.enterButton.addEventListener("click", openStory);
    els.randomButton.addEventListener("click", openRandomMemory);
    els.memoryGrid.addEventListener("click", handleMemoryGridClick);
    els.seriesShelves.addEventListener("click", handleSeriesClick);
    els.chapterSpotlight.addEventListener("click", handleSpotlightClick);
    els.filterTabs.addEventListener("click", handleFilterClick);
    els.chapterNav.addEventListener("click", handleChapterClick);
    els.closeLightbox.addEventListener("click", closeLightbox);
    els.prevMemory.addEventListener("click", () => shiftLightbox(-1));
    els.nextMemory.addEventListener("click", () => shiftLightbox(1));
    els.lightbox.addEventListener("close", () => document.body.classList.remove("modal-open"));
    els.lightbox.addEventListener("click", (event) => {
      if (event.target === els.lightbox) {
        closeLightbox();
      }
    });
    document.addEventListener("keydown", handleKeyboard);
    renderFinalLyrics();
    bindFinalPlayer();
    bindFlower();
    els.againButton.addEventListener("click", () => {
      state.finalShown = false;
      stopFinalSong();
      els.finalScreen.classList.remove("is-visible");
      els.finalScreen.setAttribute("aria-hidden", "true");
      document.body.classList.remove("final-open");
      resetFlower();
      document.getElementById("memories").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function openStory() {
    els.app.hidden = false;
    window.requestAnimationFrame(() => {
      els.gate.classList.add("is-open");
      document.body.classList.remove("final-open");
    });
    setTimeout(() => {
      els.gate.remove();
    }, 900);
  }

  function startCounter() {
    updateCounter();
    window.setInterval(updateCounter, 1000);
  }

  function updateCounter() {
    const diff = Date.now() - START_DATE.getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff / 3600000) % 24);
    const minutes = Math.floor((diff / 60000) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    els.counter.textContent = `我们已经在一起 ${days} 天 ${pad(hours)} 小时 ${pad(minutes)} 分 ${pad(seconds)} 秒`;
  }

  function renderHeroStats() {
    const days = Math.floor((Date.now() - START_DATE.getTime()) / 86400000);
    els.heroStats.innerHTML = [
      statPill(days, "天一起走过"),
      statPill(memories.length, "张照片收进来"),
      statPill(chapters.length, "段回忆章节")
    ].join("");
  }

  function statPill(value, label) {
    return `<div class="stat-pill"><strong>${value}</strong><span>${label}</span></div>`;
  }

  function renderHeroCollage() {
    const picks = pickMemories([
      "官宣图片",
      "第一次约会",
      "高考完一起去海边",
      "一起在海边牵着手",
      "广州塔美照",
      "1000天一起去看海",
      "大头贴"
    ], 7);

    els.heroCollage.innerHTML = picks
      .map((memory) => `<div class="hero-tile"><img src="${memory.thumb}" alt="" loading="eager"></div>`)
      .join("");
  }

  function renderChapterNav() {
    els.chapterNav.innerHTML = chapters
      .map((chapter) => {
        const active = chapter.key === state.activeChapter ? " is-active" : "";
        return `
          <button class="chapter-button${active}" type="button" data-chapter="${chapter.key}">
            <span><strong>${escapeHtml(chapter.title)}</strong><span>${escapeHtml(chapter.subtitle)}</span></span>
            <em>${chapter.count}</em>
          </button>
        `;
      })
      .join("");
  }

  function renderSpotlight(chapterKey) {
    const chapter = chapterMap.get(chapterKey) || chapters[0];
    if (!chapter) {
      els.chapterSpotlight.innerHTML = "";
      return;
    }

    state.activeChapter = chapter.key;
    updateChapterActiveState();

    const list = memories.filter((memory) => memory.chapter === chapter.key);
    const cover = list[Math.floor(list.length * 0.42)] || list[0] || memories[0];
    const mini = list.slice(0, 6);
    const seriesCount = new Set(list.map((memory) => memory.series)).size;

    els.chapterSpotlight.innerHTML = `
      <div class="spotlight__image">
        <img src="${cover ? cover.thumb : ""}" alt="${cover ? escapeHtml(cover.title) : ""}" loading="lazy">
      </div>
      <div class="spotlight__content">
        <p class="eyebrow">CHAPTER</p>
        <h3>${escapeHtml(chapter.title)}</h3>
        <p>${escapeHtml(chapter.subtitle)}</p>
        <div class="spotlight__meta">
          <span class="tag">${list.length} 张照片</span>
          <span class="tag">${seriesCount} 组小片段</span>
        </div>
        <button class="secondary-button" type="button" data-open-chapter="${chapter.key}">看这一章</button>
        <div class="spotlight__mini-grid">
          ${mini.map((memory) => `
            <button class="spotlight__mini" type="button" data-index="${memories.indexOf(memory)}">
              <img src="${memory.thumb}" alt="${escapeHtml(memory.title)}" loading="lazy">
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderSeriesShelves() {
    const groups = groupBy(memories, "series")
      .filter((group) => group.items.length >= 3)
      .sort((a, b) => memories.indexOf(a.items[0]) - memories.indexOf(b.items[0]))
      .slice(0, 12);

    els.seriesShelves.innerHTML = groups
      .map((group) => `
        <section class="series-shelf">
          <div class="series-shelf__top">
            <h3>${escapeHtml(group.name)}</h3>
            <span>${group.items.length} 张</span>
          </div>
          <div class="series-track">
            ${group.items.slice(0, 10).map((memory) => `
              <button class="series-card" type="button" data-index="${memories.indexOf(memory)}">
                <img src="${memory.thumb}" alt="${escapeHtml(memory.title)}" loading="lazy">
                <span>${escapeHtml(memory.title)}</span>
              </button>
            `).join("")}
          </div>
        </section>
      `)
      .join("");
  }

  function renderAlbumStack() {
    const picks = pickMemories([
      "1000天一起去看海",
      "人生美照",
      "一起在海边牵着手",
      "广州塔美照"
    ], 4);

    els.albumStack.innerHTML = picks
      .map((memory) => `<div class="album-card"><img src="${memory.thumb}" alt="" loading="lazy"></div>`)
      .join("");
  }

  function renderFilterTabs() {
    const allButton = `<button class="filter-button is-active" type="button" data-filter="all">全部 ${memories.length}</button>`;
    const chapterButtons = chapters
      .map((chapter) => `<button class="filter-button" type="button" data-filter="${chapter.key}">${escapeHtml(chapter.title)} ${chapter.count}</button>`)
      .join("");
    els.filterTabs.innerHTML = allButton + chapterButtons;
  }

  function renderGallery(filter) {
    state.activeFilter = filter;
    updateFilterActiveState();

    const list = filter === "all"
      ? memories
      : memories.filter((memory) => memory.chapter === filter);
    const chapter = chapterMap.get(filter);
    els.galleryIntro.textContent = chapter
      ? `${chapter.title}，共 ${list.length} 张。`
      : `所有照片都在这里，共 ${list.length} 张。`;

    els.memoryGrid.innerHTML = list.map((memory) => memoryCard(memory)).join("");
  }

  function memoryCard(memory) {
    const index = memories.indexOf(memory);
    const ratio = `${memory.width} / ${memory.height}`;
    const chapter = chapterMap.get(memory.chapter);
    return `
      <button class="memory-card" type="button" data-index="${index}">
        <img src="${memory.thumb}" alt="${escapeHtml(memory.title)}" loading="lazy" style="--ratio: ${ratio}">
        <span class="memory-card__body">
          <strong>${escapeHtml(memory.title)}</strong>
          <span>${chapter ? escapeHtml(chapter.title) : ""} · ${escapeHtml(memory.series)}</span>
        </span>
      </button>
    `;
  }

  function handleMemoryGridClick(event) {
    const card = event.target.closest(".memory-card");
    if (!card) return;
    openMemory(Number(card.dataset.index));
  }

  function handleSeriesClick(event) {
    const card = event.target.closest(".series-card");
    if (!card) return;
    openMemory(Number(card.dataset.index));
  }

  function handleSpotlightClick(event) {
    const mini = event.target.closest(".spotlight__mini");
    if (mini) {
      openMemory(Number(mini.dataset.index));
      return;
    }
    const chapterButton = event.target.closest("[data-open-chapter]");
    if (chapterButton) {
      renderGallery(chapterButton.dataset.openChapter);
      document.getElementById("memories").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleFilterClick(event) {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    renderGallery(button.dataset.filter);
  }

  function handleChapterClick(event) {
    const button = event.target.closest("[data-chapter]");
    if (!button) return;
    renderSpotlight(button.dataset.chapter);
  }

  function openRandomMemory() {
    const list = state.activeFilter === "all"
      ? memories
      : memories.filter((memory) => memory.chapter === state.activeFilter);
    const memory = list[Math.floor(Math.random() * list.length)];
    if (memory) {
      openMemory(memories.indexOf(memory));
    }
  }

  function openMemory(index) {
    if (!memories[index]) return;
    const memory = memories[index];
    const chapter = chapterMap.get(memory.chapter);
    state.modalIndex = index;
    els.lightboxImage.src = memory.thumb;
    els.lightboxImage.alt = memory.title;
    els.lightboxImage.decoding = "async";
    els.lightboxTitle.textContent = memory.title;
    els.lightboxMeta.textContent = `${chapter ? chapter.title : ""} · ${memory.series}`;
    if (!els.lightbox.open) {
      els.lightbox.showModal();
    }
    document.body.classList.add("modal-open");

    const fullImage = new Image();
    fullImage.onload = () => {
      if (state.modalIndex === index) {
        els.lightboxImage.src = memory.src;
      }
    };
    fullImage.src = memory.src;
  }

  function closeLightbox() {
    if (els.lightbox.open) {
      els.lightbox.close();
    }
  }

  function shiftLightbox(step) {
    const nextIndex = (state.modalIndex + step + memories.length) % memories.length;
    openMemory(nextIndex);
  }

  function handleKeyboard(event) {
    if (els.lightbox.open) {
      if (event.key === "ArrowLeft") shiftLightbox(-1);
      if (event.key === "ArrowRight") shiftLightbox(1);
    }
  }

  function parseLrc(lrc) {
    return lrc
      .split(/\r?\n/)
      .map((line) => {
        const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2})\]\s*(.*)$/);
        if (!match) return null;

        const minutes = Number(match[1]);
        const seconds = Number(match[2]);
        const hundredths = Number(match[3]);

        return {
          time: minutes * 60 + seconds + hundredths / 100,
          text: match[4].trim()
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.time - b.time);
  }

  function getActiveLyricIndex(currentTime) {
    if (!FINAL_LYRICS.length) return -1;

    const targetTime = currentTime + LYRIC_SYNC_OFFSET;
    let low = 0;
    let high = FINAL_LYRICS.length - 1;
    let active = 0;

    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      if (FINAL_LYRICS[middle].time <= targetTime) {
        active = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    return active;
  }

  function renderFinalLyrics() {
    els.lyricsList.innerHTML = FINAL_LYRICS
      .map((line, index) => `
        <li class="lyrics-item" data-lyric-index="${index}">
          ${line.section ? `<span>${escapeHtml(line.section)}</span>` : ""}
          <strong>${escapeHtml(line.text)}</strong>
        </li>
      `)
      .join("");
  }

  function bindFinalPlayer() {
    els.finalPlayButton.addEventListener("click", () => {
      if (els.finalSongPlayer.paused) {
        playFinalSong(false);
      } else {
        els.finalSongPlayer.pause();
      }
    });

    els.finalSongPlayer.addEventListener("loadedmetadata", updateFinalPlayer);
    els.finalSongPlayer.addEventListener("timeupdate", updateFinalPlayer);
    els.finalSongPlayer.addEventListener("play", () => {
      els.finalPlayButton.textContent = "暂停";
    });
    els.finalSongPlayer.addEventListener("pause", () => {
      els.finalPlayButton.textContent = "播放";
    });
    els.finalSongPlayer.addEventListener("ended", () => {
      els.finalPlayButton.textContent = "再听一遍";
      setActiveLyric(FINAL_LYRICS.length - 1);
    });
  }

  function playFinalSong(fromStart) {
    if (fromStart) {
      els.finalSongPlayer.currentTime = 0;
      state.finalLyricIndex = -1;
      setActiveLyric(0);
    }

    els.finalSongPlayer.volume = 0.86;
    const playPromise = els.finalSongPlayer.play();
    if (playPromise) {
      playPromise.catch(() => {
        els.finalPlayButton.textContent = "播放这首歌";
      });
    }
  }

  function stopFinalSong() {
    els.finalSongPlayer.pause();
    els.finalSongPlayer.currentTime = 0;
    state.finalLyricIndex = -1;
    setActiveLyric(0);
    updateFinalPlayer();
  }

  function updateFinalPlayer() {
    const lastLyric = FINAL_LYRICS[FINAL_LYRICS.length - 1];
    const fallbackDuration = lastLyric ? lastLyric.time + 5 : 180;
    const duration = Number.isFinite(els.finalSongPlayer.duration) ? els.finalSongPlayer.duration : fallbackDuration;
    const current = els.finalSongPlayer.currentTime || 0;
    const progress = duration ? Math.min(1, current / duration) : 0;
    els.finalSongProgress.style.width = `${progress * 100}%`;
    els.finalSongTime.textContent = `${formatTime(current)} / ${formatTime(duration)}`;

    const lyricIndex = getActiveLyricIndex(current);
    if (lyricIndex >= 0) {
      setActiveLyric(lyricIndex);
    }
  }

  function setActiveLyric(index) {
    if (index === state.finalLyricIndex) return;
    state.finalLyricIndex = index;
    const items = Array.from(els.lyricsList.querySelectorAll(".lyrics-item"));
    items.forEach((item, itemIndex) => {
      item.classList.toggle("is-active", itemIndex === index);
      item.classList.toggle("is-past", itemIndex < index);
    });
    const active = items[index];
    if (active) {
      active.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  function formatTime(value) {
    const totalSeconds = Math.max(0, Math.floor(value || 0));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${pad(minutes)}:${pad(seconds)}`;
  }

  function bindFlower() {
    const flower = els.flower;
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    flower.addEventListener("pointerdown", (event) => {
      const rect = flower.getBoundingClientRect();
      dragging = true;
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      flower.classList.add("is-dragging");
      flower.style.left = `${rect.left}px`;
      flower.style.top = `${rect.top}px`;
      flower.style.transform = "rotate(-8deg)";
      flower.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    flower.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const nextLeft = event.clientX - offsetX;
      const nextTop = event.clientY - offsetY;
      flower.style.left = `${nextLeft}px`;
      flower.style.top = `${nextTop}px`;
      if (event.clientX > window.innerWidth - 82) {
        dragging = false;
        flower.classList.remove("is-dragging");
        triggerFinal();
      }
    });

    flower.addEventListener("pointerup", () => {
      dragging = false;
      flower.classList.remove("is-dragging");
    });

    flower.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        triggerFinal();
      }
    });
  }

  function triggerFinal() {
    if (state.finalShown) return;
    state.finalShown = true;
    els.finalScreen.classList.add("is-visible");
    els.finalScreen.setAttribute("aria-hidden", "false");
    document.body.classList.add("final-open");
    playFinalSong(true);
    burstHearts();
  }

  function resetFlower() {
    els.flower.style.left = "";
    els.flower.style.top = "";
    els.flower.style.transform = "";
  }

  function burstHearts() {
    let count = 0;
    const timer = window.setInterval(() => {
      createHeart();
      count += 1;
      if (count > 30) {
        window.clearInterval(timer);
      }
    }, 110);
  }

  function createHeart() {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = "♥";
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.fontSize = `${18 + Math.random() * 22}px`;
    heart.style.animationDuration = `${3 + Math.random() * 1.8}s`;
    document.body.appendChild(heart);
    window.setTimeout(() => heart.remove(), 5200);
  }

  function updateFilterActiveState() {
    els.filterTabs.querySelectorAll(".filter-button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.filter === state.activeFilter);
    });
  }

  function updateChapterActiveState() {
    els.chapterNav.querySelectorAll(".chapter-button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.chapter === state.activeChapter);
    });
  }

  function pickMemories(queries, count) {
    const picked = [];
    queries.forEach((query) => {
      const found = memories.find((memory) => memory.title.includes(query));
      if (found && !picked.includes(found)) {
        picked.push(found);
      }
    });

    const step = Math.max(1, Math.floor(memories.length / Math.max(count, 1)));
    for (let index = 0; picked.length < count && index < memories.length; index += step) {
      const memory = memories[index];
      if (memory && !picked.includes(memory)) {
        picked.push(memory);
      }
    }
    return picked.slice(0, count);
  }

  function groupBy(items, key) {
    const groups = new Map();
    items.forEach((item) => {
      const value = item[key] || "其他";
      if (!groups.has(value)) {
        groups.set(value, []);
      }
      groups.get(value).push(item);
    });
    return Array.from(groups.entries()).map(([name, groupItems]) => ({ name, items: groupItems }));
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
