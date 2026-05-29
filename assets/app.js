(function () {
  const START_DATE = new Date("2022-10-07T00:00:00+08:00");
  const LYRICS = [
    "从 2022.10.07 那天开始",
    "我把很多普通的日子记成了纪念日",
    "路很长，但我一直想走向你",
    "欠你的那束花，我会亲手补上",
    "后面的旅程，也想继续和你一起"
  ];

  const chapters = window.MEMORY_CHAPTERS || [];
  const memories = window.MEMORIES || [];
  const chapterMap = new Map(chapters.map((chapter) => [chapter.key, chapter]));

  const state = {
    activeFilter: "all",
    activeChapter: chapters[0] ? chapters[0].key : "all",
    modalIndex: 0,
    lyricTimer: null,
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
      "songPlayer",
      "lyricLine",
      "flower",
      "finalScreen",
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
    bindSong();
    bindFlower();
    els.againButton.addEventListener("click", () => {
      state.finalShown = false;
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
    els.lightboxImage.src = memory.src;
    els.lightboxImage.alt = memory.title;
    els.lightboxTitle.textContent = memory.title;
    els.lightboxMeta.textContent = `${chapter ? chapter.title : ""} · ${memory.series}`;
    if (!els.lightbox.open) {
      els.lightbox.showModal();
    }
    document.body.classList.add("modal-open");
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

  function bindSong() {
    loadOptionalSong();
    els.songPlayer.addEventListener("play", () => {
      let index = 0;
      els.lyricLine.textContent = LYRICS[index];
      window.clearInterval(state.lyricTimer);
      state.lyricTimer = window.setInterval(() => {
        index = (index + 1) % LYRICS.length;
        els.lyricLine.textContent = LYRICS[index];
      }, 4400);
    });
    els.songPlayer.addEventListener("pause", () => window.clearInterval(state.lyricTimer));
    els.songPlayer.addEventListener("ended", () => window.clearInterval(state.lyricTimer));
    els.songPlayer.addEventListener("error", () => {
      els.lyricLine.textContent = "伴奏文件放进来以后，这里会跟着亮起来。";
    });
  }

  async function loadOptionalSong() {
    try {
      const response = await fetch("accompaniment.mp3", { method: "HEAD", cache: "no-store" });
      if (!response.ok) return;

      const source = document.createElement("source");
      source.src = "accompaniment.mp3";
      source.type = "audio/mpeg";
      els.songPlayer.appendChild(source);
      els.songPlayer.load();
    } catch (error) {
      els.lyricLine.textContent = "伴奏文件放进来以后，这里会跟着亮起来。";
    }
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
