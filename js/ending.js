export const albumLinks = Object.freeze({
  listenUrl: "",
  projectUrl: "",
  artistUrl: "",
});

export const nextChapter = Object.freeze({
  title: "BREAK OF DAWN",
  chapterNumber: 3,
  available: false,
  url: "",
});

export function createEndingController({
  root,
  fullTrack,
  audio,
  onRestart,
}) {
  const cover = root.querySelector("#ending-cover");
  const coverFallback = root.querySelector("#ending-cover-fallback");
  const playToggle = root.querySelector("#ending-play-toggle");
  const autoplayButton = root.querySelector("#ending-autoplay");
  const currentTime = root.querySelector("#ending-current-time");
  const duration = root.querySelector("#ending-duration");
  const progress = root.querySelector("#ending-progress");
  const volume = root.querySelector("#ending-volume");
  const playbackStatus = root.querySelector("#ending-playback-status");
  const restartButton = root.querySelector("#restart-chapter");
  const nextButton = root.querySelector("#next-chapter");
  const comingSoon = root.querySelector("#coming-soon");
  const closeComingSoon = root.querySelector("#close-coming-soon");
  const albumLinkPanel = root.querySelector("#album-links");
  let visible = false;
  let autoplayTimer = null;

  configureAlbumLinks(albumLinkPanel);

  cover.addEventListener("load", () => {
    cover.hidden = false;
    coverFallback.hidden = true;
  });
  cover.addEventListener("error", () => {
    cover.hidden = true;
    coverFallback.hidden = false;
  });

  playToggle.addEventListener("click", async () => {
    if (!visible) return;
    if (fullTrack.paused || fullTrack.ended) {
      try {
        await fullTrack.play();
        autoplayButton.hidden = true;
      } catch {
        autoplayButton.hidden = false;
      }
    } else {
      fullTrack.pause();
    }
    updatePlayerUi();
  });

  autoplayButton.addEventListener("click", async () => {
    try {
      await fullTrack.play();
      autoplayButton.hidden = true;
    } catch {
      autoplayButton.hidden = false;
    }
    updatePlayerUi();
  });

  progress.addEventListener("input", () => {
    if (!Number.isFinite(fullTrack.duration) || fullTrack.duration <= 0) return;
    fullTrack.currentTime = (Number(progress.value) / 1000) * fullTrack.duration;
    updatePlayerUi();
  });

  volume.addEventListener("input", () => {
    fullTrack.volume = Number(volume.value);
  });

  restartButton.addEventListener("click", () => {
    if (!visible) return;
    onRestart();
  });

  nextButton.addEventListener("click", () => {
    if (nextChapter.available && nextChapter.url) {
      fullTrack.pause();
      window.location.assign(nextChapter.url);
      return;
    }
    comingSoon.hidden = false;
    closeComingSoon.focus();
  });

  closeComingSoon.addEventListener("click", () => {
    comingSoon.hidden = true;
    nextButton.focus();
  });

  for (const eventName of ["timeupdate", "durationchange", "loadedmetadata", "play", "pause", "ended"]) {
    fullTrack.addEventListener(eventName, updatePlayerUi);
  }

  function show() {
    visible = true;
    root.hidden = false;
    comingSoon.hidden = true;
    autoplayButton.hidden = true;
    fullTrack.pause();
    try { fullTrack.currentTime = 0; } catch { /* metadata may still be loading */ }
    fullTrack.volume = Number(volume.value);
    updatePlayerUi();
    root.querySelector("h2")?.focus();
    if (autoplayTimer !== null) window.clearTimeout(autoplayTimer);
    autoplayTimer = window.setTimeout(async () => {
      autoplayTimer = null;
      if (!visible) return;
      const played = await audio.playEndingFullTrack();
      autoplayButton.hidden = played;
      updatePlayerUi();
    }, 700);
  }

  function hide() {
    visible = false;
    if (autoplayTimer !== null) {
      window.clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }
    root.hidden = true;
    comingSoon.hidden = true;
    autoplayButton.hidden = true;
  }

  function updatePlayerUi() {
    const total = Number.isFinite(fullTrack.duration) ? fullTrack.duration : 0;
    const elapsed = Number.isFinite(fullTrack.currentTime) ? fullTrack.currentTime : 0;
    currentTime.textContent = formatTime(elapsed);
    duration.textContent = formatTime(total);
    progress.value = total > 0 ? String(Math.round((elapsed / total) * 1000)) : "0";
    playToggle.textContent = fullTrack.paused ? "播放" : "暫停";
    playbackStatus.textContent = fullTrack.ended
      ? "播放完成"
      : fullTrack.paused ? "已暫停" : "正在播放《Fugata》";
  }

  return {
    show,
    hide,
    isVisible: () => visible,
    showAutoplayFallback: () => { autoplayButton.hidden = false; },
  };
}

function configureAlbumLinks(container) {
  const definitions = [
    ["listenUrl", "聆聽完整作品"],
    ["projectUrl", "Logic Code 企劃介紹"],
    ["artistUrl", "藝術家／樂團"],
  ];
  let count = 0;
  for (const [key, label] of definitions) {
    const url = albumLinks[key];
    if (!url) continue;
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label;
    container.append(link);
    count += 1;
  }
  container.hidden = count === 0;
}

function formatTime(seconds) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}
