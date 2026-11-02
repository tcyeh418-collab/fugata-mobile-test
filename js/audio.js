export const DOOR01_AUDIO_MANIFEST = Object.freeze({
  door01FragmentA: "assets/audio/fugata/door01_fragment_a.mp3",
  door01FragmentB: "assets/audio/fugata/door01_fragment_b.mp3",
  door01FragmentC: "assets/audio/fugata/door01_fragment_c.mp3",
  door01FragmentD: "assets/audio/fugata/door01_fragment_d.mp3",
  door01FragmentE: "assets/audio/fugata/door01_fragment_e.mp3",
});

export const DOOR02_AUDIO_MANIFEST = Object.freeze({
  door02AnswerA: "assets/audio/fugata/door02_answer_a.mp3",
  door02AnswerB: "assets/audio/fugata/door02_answer_b.mp3",
  door02AnswerC: "assets/audio/fugata/door02_answer_c.mp3",
  door02AnswerD: "assets/audio/fugata/door02_answer_d.mp3",
});

export const SUCCESS_LOOP_MANIFEST = Object.freeze({
  voice01Loop: "assets/audio/fugata/voice_01_loop.mp3",
  voice02Loop: "assets/audio/fugata/voice_02_loop.mp3",
});

export const DOOR03_AUDIO_MANIFEST = Object.freeze({
  door03Stage01OscillatorRaw: "assets/audio/fugata/door03_stage01_oscillator_raw.mp3",
  door03Stage02PitchSequence: "assets/audio/fugata/door03_stage02_pitch_sequence.mp3",
  door03Stage03Filtered: "assets/audio/fugata/door03_stage03_filtered.mp3",
  door03Stage04Effected: "assets/audio/fugata/door03_stage04_effected.mp3",
  door03Stage05EnvelopeDemo: "assets/audio/fugata/door03_stage05_envelope_demo.mp3",
  door03Stage06CompletePatch: "assets/audio/fugata/door03_stage06_complete_patch.mp3",
  door03PatchComplete: "assets/audio/fugata/door03_patch_complete.mp3",
});

export const DOOR03_STAGE_LOOP_CONFIG = Object.freeze({
  door03Stage01OscillatorRaw: Object.freeze({ loopStart: 0, loopEnd: 5.4 }),
  door03Stage02PitchSequence: Object.freeze({ loopStart: 0, loopEnd: 5.4 }),
  door03Stage03Filtered: Object.freeze({ loopStart: 0, loopEnd: 5.4 }),
  door03Stage04Effected: Object.freeze({ loopStart: 0, loopEnd: 5.4 }),
  door03Stage05EnvelopeDemo: Object.freeze({ loopStart: 0, loopEnd: 5.4 }),
  door03Stage06CompletePatch: Object.freeze({ loopStart: 0, loopEnd: 5.4 }),
});

export function door03LoopBounds(audioKey, bufferDuration) {
  const safeDuration = Number.isFinite(bufferDuration) && bufferDuration > 0
    ? bufferDuration
    : 0;
  const configured = DOOR03_STAGE_LOOP_CONFIG[audioKey] ?? {};
  const loopStart = Math.max(0, Math.min(configured.loopStart ?? 0, safeDuration));
  const requestedEnd = configured.loopEnd ?? safeDuration;
  const loopEnd = Math.max(loopStart, Math.min(requestedEnd, safeDuration));
  return { loopStart, loopEnd };
}

export const DOOR04_AUDIO_MANIFEST = Object.freeze({
  door04ReferenceMix: "assets/audio/fugata/door04_reference_mix.mp3",
  door04VoiceA: "assets/audio/fugata/door04_voice_a.mp3",
  door04VoiceB: "assets/audio/fugata/door04_voice_b.mp3",
  door04VoiceC: "assets/audio/fugata/door04_voice_c.mp3",
  door04VoiceD: "assets/audio/fugata/door04_voice_d.mp3",
});

// Source files are already authored combinations, not stems to layer or loop.
export function door04TestPlan(bufferDurations, _unusedInterval, testEntryCount = bufferDurations.length) {
  const durations = bufferDurations.slice(0, testEntryCount);
  if (![2,3,4].includes(testEntryCount) || durations.length !== testEntryCount || durations.some(d => !Number.isFinite(d) || d <= 0)) return {error:'missing-buffer'};
  let duration=0;
  const offsets=durations.map(d=>{const offset=duration;duration+=d;return offset;});
  return {error:null,entryCount:testEntryCount,durations,offsets,duration};
}

export const DOOR05_AUDIO_MANIFEST = Object.freeze({
  door05Foundation: "assets/audio/fugata/door05_foundation2.mp3",
  door05Drive: "assets/audio/fugata/door05_drive2.mp3",
  door05Sprint: "assets/audio/fugata/door05_sprint.mp3",
  door05RhythmComplete: "assets/audio/fugata/door05_rhythm_complete.mp3",
});

// Device calibration only: positive values delay the visual pulse, while
// negative values advance it. This never changes playback speed or answers.
// Some MP3 decoders discard frames in these files (Foundation becomes 4.104 s).
// Preserve the original samples and silence with a lossless PCM decode fallback;
// never stretch a short buffer or change the transport to match a broken decode.
export async function decodeDoor05CompatibleBuffer(context, key, url, bytes, fetchAudio = fetch) {
  const buffer = await context.decodeAudioData(bytes);
  const rhythmKey = ["door05Foundation", "door05Drive", "door05Sprint"].includes(key);
  if (!rhythmKey || buffer.duration >= 5.4) return { buffer, compatibilityFallback: false };
  const response = await fetchAudio(url.replace(/\.mp3$/, ".pcm.wav"));
  if (!response.ok) throw new Error(`Room 5 PCM fallback HTTP ${response.status}`);
  const compatible = await context.decodeAudioData(await response.arrayBuffer());
  if (!Number.isFinite(compatible.duration) || compatible.duration < 5.4) {
    throw new Error("Room 5 PCM fallback is shorter than the two-bar source");
  }
  return { buffer: compatible, compatibilityFallback: true, originalDuration: buffer.duration };
}

export const door05VisualSyncOffsetMs = 0;

export const DOOR06_AUDIO_MANIFEST = Object.freeze({
  door06FinalReference: "assets/audio/fugata/door06_final_reference.mp3",
  door06MemoryA: "assets/audio/fugata/door06_memory_a.mp3",
  door06MemoryB: "assets/audio/fugata/door06_memory_b.mp3",
  door06MemoryC: "assets/audio/fugata/door06_memory_c.mp3",
  door06Complete: "assets/audio/fugata/door06_complete.mp3",
});

const FULL_TRACK_NAME = "fugata_full.mp3";
const DOOR03_LOOP_CROSSFADE = 0.1;
const DOOR03_LOOP_VOLUME = 0.72;

export function door05PlaybackPlan(bufferDuration, testDuration = 5.4) {
  if (!Number.isFinite(bufferDuration) || bufferDuration < 2.7) {
    return {
      error: "buffer-too-short",
      bufferDuration,
      requiredDuration: 2.7,
    };
  }
  return {
    error: null,
    bufferDuration,
    duration: testDuration,
    looped: bufferDuration < testDuration,
    loopStart: bufferDuration < testDuration ? 0 : null,
    loopEnd: bufferDuration < testDuration ? 2.7 : null,
  };
}

export function door05AudibleClock(
  audioContext,
  visualSyncOffsetMs = door05VisualSyncOffsetMs,
) {
  if (!audioContext || !Number.isFinite(audioContext.currentTime)) return null;

  let rawAudibleContextTime = audioContext.currentTime;
  let source = "currentTime";
  let outputTimestampSupported = typeof audioContext.getOutputTimestamp === "function";

  if (outputTimestampSupported) {
    try {
      const timestamp = audioContext.getOutputTimestamp();
      if (Number.isFinite(timestamp?.contextTime) && timestamp.contextTime >= 0) {
        rawAudibleContextTime = timestamp.contextTime;
        source = "getOutputTimestamp";
      } else {
        outputTimestampSupported = false;
      }
    } catch {
      outputTimestampSupported = false;
    }
  }

  if (
    source === "currentTime"
    && Number.isFinite(audioContext.outputLatency)
    && audioContext.outputLatency >= 0
    && audioContext.outputLatency <= 1
  ) {
    rawAudibleContextTime = Math.max(0, audioContext.currentTime - audioContext.outputLatency);
    source = "currentTime-outputLatency";
  }

  return {
    source,
    outputTimestampSupported,
    rawAudibleContextTime,
    audibleContextTime: rawAudibleContextTime - visualSyncOffsetMs / 1000,
    visualSyncOffsetMs,
  };
}

export function createAudioSystem(fullTrack, callbacks = {}) {
  let context = null;
  let masterGain = null;
  let previewGain = null;
  let previewAnalyser = null;
  let previewData = null;
  let preloadPromise = null;
  let activePreviewSource = null;
  let activePreview = null;
  let successSources = [];
  let successGain = null;
  let door03LoopSource = null;
  let door03LoopGain = null;
  let door03CurrentLoopStage = null;
  let door03LoopEntityId = null;
  let door03LoopBoundsState = null;
  let door03LoopToken = 0;
  const door03RetiredLoops = new Set();
  let door03SuccessSource = null;
  let door03SuccessGain = null;
  let door03SuccessAnalyser = null;
  let door03SuccessData = null;
  let door04ReferenceOffset = 0;
  let door04ReferenceStartedAt = 0;
  let door04ReferenceSource = null;
  let door04ReferenceGain = null;
  let door04VoiceSource = null;
  let door04VoiceGain = null;
  let door04TestSources = [];
  let door04Sequence = null;
  let door04SequenceTicket = 0;
  let door04TestGains = [];
  let door04TestAnalysers = [];
  let door04TestData = [];
  let door04TestMasterGain = null;
  let door04SuccessSource = null;
  let door04SuccessGain = null;
  let door05ReferenceSource = null;
  let door05ReferenceGain = null;
  let door05ReferenceAnalyser = null;
  let door05ReferenceData = null;
  let door05ReferencePlayback = null;
  let door05ReferenceDiagnostics = null;
  const door05DecodeFallbacks = {};
  let door05TestNodes = [];
  let door05TestGain = null;
  let door05TestPlayback = null;
  let door05Diagnostics = null;
  let door05SuccessSource = null;
  let door05SuccessGain = null;
  let door05SuccessAnalyser = null;
  let door05SuccessData = null;
  let door06PreviewSource = null;
  let door06PreviewGain = null;
  let door06PreviewAnalyser = null;
  let door06PreviewData = null;
  let door06Preview = null;
  let door06SuccessSource = null;
  let door06SuccessGain = null;
  let door06SuccessAnalyser = null;
  let door06SuccessData = null;
  let fadeFrame = null;
  let fullTrackOwner = null;
  const buffers = new Map();

  fullTrack.volume = 0.72;

  function publishFull(status, error = null) {
    callbacks.onFullTrackState?.({ status, playing: !fullTrack.paused, error });
  }

  function publishGroup(callbackName, status, manifest) {
    const loaded = Object.keys(manifest).filter((key) => buffers.has(key)).length;
    callbacks[callbackName]?.({ status, loaded, total: Object.keys(manifest).length });
  }

  fullTrack.addEventListener("loadedmetadata", () => publishFull("Ready"));
  fullTrack.addEventListener("canplay", () => publishFull("Ready"));
  fullTrack.addEventListener("play", () => publishFull("Ready"));
  fullTrack.addEventListener("pause", () => publishFull(fullTrack.error ? "Error" : "Ready"));
  fullTrack.addEventListener("ended", () => {
    fullTrackOwner = null;
    publishFull("Ready");
  });
  fullTrack.addEventListener("error", () => {
    const detail = fullTrack.error?.message || "could not be loaded";
    publishFull("Error", `${FULL_TRACK_NAME}: ${detail}`);
  });
  if (fullTrack.readyState >= HTMLMediaElement.HAVE_METADATA) publishFull("Ready");
  else publishFull("Loading");

  function initializeContext() {
    if (context) return context;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) {
      console.error("[Fugata Audio] Web Audio API is unavailable.");
      return null;
    }
    context = new Context();
    masterGain = context.createGain();
    previewGain = context.createGain();
    previewAnalyser = context.createAnalyser();
    previewAnalyser.fftSize = 256;
    previewData = new Uint8Array(previewAnalyser.fftSize);
    masterGain.gain.value = 0.62;
    previewGain.gain.value = 0.72;
    previewGain.connect(previewAnalyser);
    previewAnalyser.connect(masterGain);
    masterGain.connect(context.destination);
    preloadPromise = preloadAssets();
    return context;
  }

  async function resume() {
    const audioContext = initializeContext();
    if (!audioContext) return false;
    try {
      if (audioContext.state === "suspended") await audioContext.resume();
      return audioContext.state === "running";
    } catch (error) {
      console.error("[Fugata Audio] AudioContext resume failed:", error);
      return false;
    }
  }

  async function loadGroup(manifest, callbackName) {
    publishGroup(callbackName, "Loading", manifest);
    const results = await Promise.all(Object.entries(manifest).map(async ([key, url]) => {
      if (!url) return null;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const bytes = await response.arrayBuffer();
        const decoded = await decodeDoor05CompatibleBuffer(context, key, url, bytes);
        buffers.set(key, decoded.buffer);
        if (decoded.compatibilityFallback) {
          door05DecodeFallbacks[key] = decoded.originalDuration;
        }
        publishGroup(callbackName, "Loading", manifest);
        return true;
      } catch (error) {
        console.error(`[Fugata Audio] Failed to load ${url.split("/").pop()}:`, error);
        return false;
      }
    }));
    const ready = results.every(Boolean);
    const partial = !ready && results.some(Boolean);
    publishGroup(callbackName, ready ? "Ready" : partial ? "Partial" : "Error", manifest);
    return ready || partial;
  }

  function preloadAssets() {
    if (preloadPromise) return preloadPromise;
    if (!context) return Promise.resolve(false);
    preloadPromise = Promise.all([
      loadGroup(DOOR01_AUDIO_MANIFEST, "onFragmentAssetsState"),
      loadGroup(DOOR02_AUDIO_MANIFEST, "onDoor02AssetsState"),
      loadGroup(SUCCESS_LOOP_MANIFEST, "onSuccessLoopState"),
      loadGroup(DOOR03_AUDIO_MANIFEST, "onDoor03AssetsState"),
      loadGroup(DOOR04_AUDIO_MANIFEST, "onDoor04AssetsState"),
      loadGroup(DOOR05_AUDIO_MANIFEST, "onDoor05AssetsState"),
      loadGroup(DOOR06_AUDIO_MANIFEST, "onDoor06AssetsState"),
    ]).then((results) => results.every(Boolean));
    return preloadPromise;
  }

  async function playFullTrack() {
    cancelFade();
    fullTrack.volume = 0.72;
    fullTrackOwner = "title";
    try {
      await fullTrack.play();
      publishFull("Ready");
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (fullTrackOwner === "title") fullTrackOwner = null;
      console.error(`[Fugata Audio] Failed to play ${FULL_TRACK_NAME}: ${message}`);
      publishFull("Error", `${FULL_TRACK_NAME}: ${message}`);
      return false;
    }
  }

  function pauseFullTrack() {
    fullTrackOwner = null;
    fullTrack.pause();
    publishFull(fullTrack.error ? "Error" : "Ready");
  }
  async function toggleFullTrack() { if (fullTrack.paused) return playFullTrack(); pauseFullTrack(); return true; }

  function playRoom01Theme() {
    cancelFade();
    stopPreview();
    fullTrack.pause();
    try { fullTrack.currentTime = 0; } catch { /* metadata may still be loading */ }
    fullTrack.volume = 0.72;
    fullTrackOwner = "room01";
    try {
      const playback = fullTrack.play();
      Promise.resolve(playback).then(
        () => publishFull("Ready"),
        (error) => {
          if (fullTrackOwner === "room01") fullTrackOwner = null;
          const message = error instanceof Error ? error.message : String(error);
          console.error(`[Fugata Audio] Failed to play ${FULL_TRACK_NAME}: ${message}`);
          publishFull("Error", `${FULL_TRACK_NAME}: ${message}`);
        },
      );
      publishFull("Ready");
      return true;
    } catch (error) {
      fullTrackOwner = null;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Fugata Audio] Failed to play ${FULL_TRACK_NAME}: ${message}`);
      publishFull("Error", `${FULL_TRACK_NAME}: ${message}`);
      return false;
    }
  }

  function stopRoom01Theme() {
    if (fullTrackOwner !== "room01") return false;
    resetFullTrack();
    return true;
  }

  function isRoom01ThemePlaying() {
    return fullTrackOwner === "room01";
  }

  function fadeOutFullTrack(duration = 1.25) {
    cancelFade();
    if (fullTrack.paused || fullTrack.ended) { resetFullTrack(); return Promise.resolve(); }
    const startVolume = fullTrack.volume;
    const startedAt = performance.now();
    return new Promise((resolve) => {
      function step(now) {
        const progress = Math.min(1, (now - startedAt) / (duration * 1000));
        fullTrack.volume = startVolume * (1 - progress);
        if (progress < 1) { fadeFrame = requestAnimationFrame(step); return; }
        fadeFrame = null;
        resetFullTrack();
        resolve();
      }
      fadeFrame = requestAnimationFrame(step);
    });
  }

  function resetFullTrack() {
    fullTrackOwner = null;
    fullTrack.pause();
    try { fullTrack.currentTime = 0; } catch { /* metadata may still be loading */ }
    fullTrack.volume = 0.72;
    publishFull(fullTrack.error ? "Error" : "Ready");
  }

  function cancelFade() { if (fadeFrame !== null) { cancelAnimationFrame(fadeFrame); fadeFrame = null; } }

  function stopPreview() {
    const previous = activePreview;
    if (activePreviewSource) {
      try { activePreviewSource.stop(); } catch { /* already ended */ }
      try { activePreviewSource.disconnect(); } catch { /* already disconnected */ }
    }
    activePreviewSource = null;
    activePreview = null;
    if (previous) callbacks.onPreviewState?.({ ...previous, playing: false });
  }

  function playPreview(audioKey, entityId, kind) {
    if (!context || context.state !== "running" || !previewGain) return false;
    const buffer = buffers.get(audioKey);
    if (!buffer) return false;
    stopPreview();
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(previewGain);
    activePreviewSource = source;
    activePreview = { entityId, kind };
    callbacks.onPreviewState?.({ entityId, kind, playing: true });
    source.onended = () => {
      try { source.disconnect(); } catch { /* no-op */ }
      if (activePreviewSource !== source) return;
      activePreviewSource = null;
      activePreview = null;
      callbacks.onPreviewState?.({ entityId, kind, playing: false });
    };
    source.start();
    return true;
  }

  function playFragment(audioKey, fragmentId) { return playPreview(audioKey, fragmentId, "fragment"); }

  function getPreviewLevel() {
    if (!previewAnalyser || (!activePreviewSource && !door03LoopSource) || !previewData) return 0;
    previewAnalyser.getByteTimeDomainData(previewData);
    let energy = 0;
    for (const sample of previewData) { const centered = (sample - 128) / 128; energy += centered * centered; }
    return Math.min(1, Math.sqrt(energy / previewData.length) * 4.4);
  }

  function playDoor03StageLoop(audioKey, entityId, options = {}) {
    if (!context || context.state !== "running" || !masterGain || !previewAnalyser) return false;
    const buffer = buffers.get(audioKey);
    if (!buffer) return false;
    const restart = options.restart === true;
    if (door03LoopSource && door03CurrentLoopStage === audioKey && !restart) return true;

    clearRetiredDoor03Loops();
    const previousSource = door03LoopSource;
    const previousGain = door03LoopGain;
    const now = context.currentTime;
    const crossfade = Math.max(
      0.08,
      Math.min(0.15, options.crossfade ?? DOOR03_LOOP_CROSSFADE),
    );
    const bounds = door03LoopBounds(audioKey, buffer.duration);
    if (bounds.loopEnd <= bounds.loopStart) return false;

    const nextGain = context.createGain();
    nextGain.gain.setValueAtTime(0.0001, now);
    nextGain.gain.exponentialRampToValueAtTime(DOOR03_LOOP_VOLUME, now + crossfade);
    nextGain.connect(previewAnalyser);
    const nextSource = context.createBufferSource();
    nextSource.buffer = buffer;
    nextSource.loop = true;
    nextSource.loopStart = bounds.loopStart;
    nextSource.loopEnd = bounds.loopEnd;
    nextSource.connect(nextGain);

    try {
      nextSource.start(now, bounds.loopStart);
    } catch (error) {
      try { nextSource.disconnect(); } catch { /* no-op */ }
      try { nextGain.disconnect(); } catch { /* no-op */ }
      console.error(`[Fugata Audio] Door 3 loop failed to start (${audioKey}):`, error);
      return false;
    }

    stopPreview();
    door03LoopToken += 1;
    door03LoopSource = nextSource;
    door03LoopGain = nextGain;
    door03CurrentLoopStage = audioKey;
    door03LoopEntityId = entityId;
    door03LoopBoundsState = {
      ...bounds,
      bufferDuration: buffer.duration,
    };
    if (previousSource) retireDoor03Loop(previousSource, previousGain, crossfade, now);
    callbacks.onPreviewState?.({ entityId, kind: "door03-stage", playing: true });
    return true;
  }

  function stopDoor03Loop(duration = DOOR03_LOOP_CROSSFADE) {
    clearRetiredDoor03Loops();
    const source = door03LoopSource;
    const gain = door03LoopGain;
    const entityId = door03LoopEntityId;
    if (!source || !context) return false;
    const now = context.currentTime;
    const fadeDuration = Math.max(0, Math.min(0.15, duration));
    door03LoopToken += 1;
    door03LoopSource = null;
    door03LoopGain = null;
    door03CurrentLoopStage = null;
    door03LoopEntityId = null;
    door03LoopBoundsState = null;
    if (fadeDuration > 0) {
      retireDoor03Loop(source, gain, fadeDuration, now);
    } else {
      try { source.stop(now); } catch { /* already stopped */ }
      try { source.disconnect(); } catch { /* no-op */ }
      try { gain?.disconnect(); } catch { /* no-op */ }
    }
    callbacks.onPreviewState?.({ entityId, kind: "door03-stage", playing: false });
    return true;
  }

  function retireDoor03Loop(source, gain, duration, now) {
    const record = { source, gain };
    door03RetiredLoops.add(record);
    if (gain) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
      if (duration > 0) {
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      } else {
        gain.gain.setValueAtTime(0.0001, now);
      }
    }
    source.onended = () => cleanupRetiredDoor03Loop(record);
    try { source.stop(now + duration + 0.015); } catch { /* already stopped */ }
  }

  function cleanupRetiredDoor03Loop(record) {
    door03RetiredLoops.delete(record);
    try { record.source.disconnect(); } catch { /* no-op */ }
    try { record.gain?.disconnect(); } catch { /* no-op */ }
  }

  function clearRetiredDoor03Loops() {
    for (const record of door03RetiredLoops) {
      try { record.source.stop(); } catch { /* already stopped */ }
      cleanupRetiredDoor03Loop(record);
    }
  }

  function getDoor03LoopDiagnostics() {
    return {
      active: Boolean(door03LoopSource),
      stage: door03CurrentLoopStage,
      token: door03LoopToken,
      retiredSourceCount: door03RetiredLoops.size,
      ...(door03LoopBoundsState ?? {
        loopStart: null,
        loopEnd: null,
        bufferDuration: null,
      }),
    };
  }

  function playRejectedCue() {
    if (!context || context.state !== "running" || !previewGain) return false;
    stopPreview();
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(149, now);
    oscillator.frequency.linearRampToValueAtTime(112, now + 0.28);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.075, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    oscillator.connect(gain);
    gain.connect(previewGain);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(now);
    oscillator.stop(now + 0.36);
    return true;
  }

  function startSuccessLoops() {
    if (!context || context.state !== "running" || successSources.length) return false;
    const loopBuffers = [buffers.get("voice01Loop"), buffers.get("voice02Loop")];
    if (loopBuffers.some((buffer) => !buffer)) return false;
    successGain = context.createGain();
    const now = context.currentTime;
    successGain.gain.setValueAtTime(0.0001, now);
    successGain.gain.exponentialRampToValueAtTime(0.42, now + 0.5);
    successGain.connect(masterGain);
    const startAt = now + 0.06;
    successSources = loopBuffers.map((buffer) => {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(successGain);
      source.start(startAt);
      return source;
    });
    callbacks.onSuccessLoopsPlaying?.(true);
    return true;
  }

  function stopSuccessLoops(duration = 0.35) {
    if (!successSources.length) return;
    const sources = successSources;
    successSources = [];
    const gain = successGain;
    successGain = null;
    const now = context.currentTime;
    if (gain) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }
    sources.forEach((source) => {
      try { source.stop(now + duration + 0.02); } catch { /* no-op */ }
      source.onended = () => { try { source.disconnect(); } catch { /* no-op */ } };
    });
    if (gain) setTimeout(() => { try { gain.disconnect(); } catch { /* no-op */ } }, (duration + 0.08) * 1000);
    callbacks.onSuccessLoopsPlaying?.(false);
  }

  function playDoor03Success() {
    if (!context || context.state !== "running" || door03SuccessSource) return false;
    const buffer = buffers.get("door03PatchComplete");
    if (!buffer) return false;
    stopPreview();
    stopSuccessLoops(0.2);

    const now = context.currentTime;
    const loopFadeDuration = door03LoopSource ? 0.12 : 0;
    const successStartAt = now + loopFadeDuration + (loopFadeDuration ? 0.025 : 0);
    if (door03LoopSource) stopDoor03Loop(loopFadeDuration);
    door03SuccessGain = context.createGain();
    door03SuccessAnalyser = context.createAnalyser();
    door03SuccessAnalyser.fftSize = 256;
    door03SuccessData = new Uint8Array(door03SuccessAnalyser.fftSize);
    door03SuccessGain.gain.setValueAtTime(0.0001, successStartAt);
    door03SuccessGain.gain.exponentialRampToValueAtTime(0.46, successStartAt + 0.28);
    door03SuccessGain.connect(door03SuccessAnalyser);
    door03SuccessAnalyser.connect(masterGain);

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(door03SuccessGain);
    door03SuccessSource = source;
    callbacks.onDoor03SuccessPlaying?.(true);
    source.onended = () => {
      try { source.disconnect(); } catch { /* no-op */ }
      if (door03SuccessSource !== source) return;
      door03SuccessSource = null;
      try { door03SuccessGain?.disconnect(); } catch { /* no-op */ }
      try { door03SuccessAnalyser?.disconnect(); } catch { /* no-op */ }
      door03SuccessGain = null;
      door03SuccessAnalyser = null;
      door03SuccessData = null;
      callbacks.onDoor03SuccessPlaying?.(false);
    };
    source.start(successStartAt);
    return true;
  }

  function stopDoor03Success(duration = 0.2) {
    const source = door03SuccessSource;
    if (!source || !context) return;
    door03SuccessSource = null;
    const gain = door03SuccessGain;
    const analyser = door03SuccessAnalyser;
    door03SuccessGain = null;
    door03SuccessAnalyser = null;
    door03SuccessData = null;
    const now = context.currentTime;
    if (gain) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }
    try { source.stop(now + duration + 0.02); } catch { /* no-op */ }
    source.onended = () => {
      try { source.disconnect(); } catch { /* no-op */ }
      try { gain?.disconnect(); } catch { /* no-op */ }
      try { analyser?.disconnect(); } catch { /* no-op */ }
    };
    callbacks.onDoor03SuccessPlaying?.(false);
  }

  function getDoor03SuccessLevel() {
    if (!door03SuccessAnalyser || !door03SuccessData || !door03SuccessSource) return 0;
    door03SuccessAnalyser.getByteTimeDomainData(door03SuccessData);
    let energy = 0;
    for (const sample of door03SuccessData) {
      const centered = (sample - 128) / 128;
      energy += centered * centered;
    }
    return Math.min(1, Math.sqrt(energy / door03SuccessData.length) * 4);
  }

  function playDoor04Reference(entityId = "door04-reference-console", { restart = false } = {}) {
    if(door04Sequence)return false;
    if (!context || context.state !== "running" || !masterGain) return false;
    const buffer = buffers.get("door04ReferenceMix");
    if (!buffer) return false;
    if (door04ReferenceSource && !restart) return true;
    const offset = restart ? 0 : door04ReferenceOffset;
    stopPreview();
    stopDoor04Voice();
    stopDoor04Test();
    stopDoor04Reference();

    door04ReferenceGain = context.createGain();
    door04ReferenceGain.gain.value = 0.48;
    door04ReferenceGain.connect(masterGain);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(door04ReferenceGain);
    door04ReferenceSource = source;
    door04ReferenceOffset = offset;
    door04ReferenceStartedAt = context.currentTime;
    callbacks.onDoor04PreviewState?.({
      kind: "reference", entityId, playing: true, completed: false,
    });
    source.onended = () => {
      try { source?.disconnect(); } catch { /* no-op */ }
      if (door04ReferenceSource !== source) return;
      door04ReferenceSource = null;
      door04ReferenceOffset = 0;
      try { door04ReferenceGain?.disconnect(); } catch { /* no-op */ }
      door04ReferenceGain = null;
      callbacks.onDoor04PreviewState?.({
        kind: "reference", entityId, playing: false, completed: true, reason: "natural-end",
      });
    };
    source.start(0, offset);
    return true;
  }

  function stopDoor04Reference(paused = false) {
    const source = door04ReferenceSource;
    const hadPosition = door04ReferenceOffset > 0;
    door04ReferenceOffset = paused && source
      ? Math.min(source.buffer.duration, door04ReferenceOffset + Math.max(0, context.currentTime - door04ReferenceStartedAt))
      : paused ? door04ReferenceOffset : 0;
    if (!source && !hadPosition) return;
    door04ReferenceSource = null;
    const gain = door04ReferenceGain;
    door04ReferenceGain = null;
    try { source?.stop(); } catch { /* already ended */ }
    try { source?.disconnect(); } catch { /* no-op */ }
    try { gain?.disconnect(); } catch { /* no-op */ }
    callbacks.onDoor04PreviewState?.({
      kind: "reference",
      entityId: "door04-reference-console",
      playing: false,
      completed: false,
      reason: paused ? "paused" : "stopped",
    });
  }

  function pauseDoor04Reference() { stopDoor04Reference(true); }

  function playDoor04Voice(audioKey, entityId, maxDuration = 15) {
    if(door04Sequence)return false;
    if (!context || context.state !== "running" || !masterGain) return false;
    const buffer = buffers.get(audioKey);
    if (!buffer) return false;
    stopPreview();
    pauseDoor04Reference();
    stopDoor04Test();
    stopDoor04Voice();

    door04VoiceGain = context.createGain();
    door04VoiceGain.gain.value = 0.54;
    door04VoiceGain.connect(masterGain);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(door04VoiceGain);
    door04VoiceSource = source;
    callbacks.onDoor04PreviewState?.({ kind: "voice", entityId, playing: true });
    source.onended = () => {
      try { source.disconnect(); } catch { /* no-op */ }
      if (door04VoiceSource !== source) return;
      door04VoiceSource = null;
      try { door04VoiceGain?.disconnect(); } catch { /* no-op */ }
      door04VoiceGain = null;
      callbacks.onDoor04PreviewState?.({ kind: "voice", entityId, playing: false });
    };
    source.start(0, 0, Math.min(buffer.duration, maxDuration));
    return true;
  }

  function stopDoor04Voice() {
    const source = door04VoiceSource;
    if (!source) return;
    door04VoiceSource = null;
    const gain = door04VoiceGain;
    door04VoiceGain = null;
    try { source.stop(); } catch { /* already ended */ }
    try { source.disconnect(); } catch { /* no-op */ }
    try { gain?.disconnect(); } catch { /* no-op */ }
    callbacks.onDoor04PreviewState?.({ kind: "voice", entityId: null, playing: false });
  }

  async function startDoor04Test(audioKeys) {
    // Cancel both scheduled sources and an older pending preparation before restarting.
    stopDoor04Test();
    const ticket=++door04SequenceTicket;
    door04Sequence={status:'preparing',ticket};
    try {
      if (!await resume()) throw Error('無法啟動聲音，請再次按下從頭播放。');
      if(ticket!==door04SequenceTicket)return null;
      // Preload the entire ordered set. Retry missing/failed assets before scheduling anything.
      await Promise.all(audioKeys.map(async key=>{
        if(buffers.has(key))return;
        const url=DOOR04_AUDIO_MANIFEST[key];if(!url)throw Error('音匣缺少音訊對應。');
        const response=await fetch(url);if(!response.ok)throw Error('音匣音訊下載失敗。');
        const buffer=await context.decodeAudioData(await response.arrayBuffer());buffers.set(key,buffer);
      }));
      if(ticket!==door04SequenceTicket)return null;
      const ordered=audioKeys.map(key=>buffers.get(key));
      const plan=door04TestPlan(ordered.map(b=>b?.duration));
      if(plan.error)throw Error('音匣音訊不完整，請重新播放以重試準備。');
      stopPreview();stopDoor04Reference();stopDoor04Voice();stopDoor04Success(0);
      const startAt=context.currentTime+0.08;
      door04TestMasterGain=context.createGain();door04TestMasterGain.gain.value=0.54;door04TestMasterGain.connect(masterGain);
      door04Sequence={...plan,ticket,startAt,endAt:startAt+plan.duration,status:'playing',ended:false};
      // Build every node before scheduling; every start shares one AudioContext timeline.
      door04TestSources=ordered.map(buffer=>{
        const source=context.createBufferSource();source.buffer=buffer;source.loop=false;
        const analyser=context.createAnalyser();analyser.fftSize=256;
        source.connect(analyser);analyser.connect(door04TestMasterGain);
        door04TestAnalysers.push(analyser);door04TestData.push(new Uint8Array(analyser.fftSize));
        return source;
      });
      door04TestSources.at(-1).onended=()=>{
        if(ticket!==door04SequenceTicket || !door04Sequence)return;
        door04Sequence.ended=true;
      };
      door04TestSources.forEach((source,index)=>source.start(startAt+plan.offsets[index]));
      callbacks.onDoor04TestState?.({playing:true,...plan,startAt});
      return door04Sequence;
    } catch(error) {
      if(ticket!==door04SequenceTicket)return null;
      stopDoor04Test();throw error;
    }
  }

  function getDoor04TestProgress() {
    if(!door04Sequence)return null;
    const q=door04Sequence;
    if(q.status==='preparing')return {status:'preparing',elapsed:0,progress:0,index:0,completed:false};
    const elapsed=Math.max(0,Math.min(q.duration,context.currentTime-q.startAt));
    const index=context.currentTime<q.startAt?0:Math.min(q.entryCount,1+q.offsets.slice(1).filter(t=>elapsed>=t).length);
    return {...q,elapsed,index,progress:elapsed/q.duration,completed:q.ended && context.currentTime>=q.endAt};
  }

  function stopDoor04Test() {
    door04SequenceTicket++;
    door04Sequence=null;
    if (!door04TestSources.length && !door04TestMasterGain) return;
    const sources = door04TestSources;
    const gains = door04TestGains;
    const analysers = door04TestAnalysers;
    const master = door04TestMasterGain;
    door04TestSources = [];
    door04TestGains = [];
    door04TestAnalysers = [];
    door04TestData = [];
    door04TestMasterGain = null;
    for (const source of sources) {
      source.onended=null;
      try { source.stop(); } catch { /* already ended */ }
      try { source.disconnect(); } catch { /* no-op */ }
    }
    for (const gain of gains) {
      try { gain.disconnect(); } catch { /* no-op */ }
    }
    for (const analyser of analysers) {
      try { analyser.disconnect(); } catch { /* no-op */ }
    }
    try { master?.disconnect(); } catch { /* no-op */ }
    callbacks.onDoor04TestState?.({ playing: false });
  }

  function getDoor04StemLevels() {
    return door04TestAnalysers.map((analyser, index) => {
      const data = door04TestData[index];
      if (!data) return 0;
      analyser.getByteTimeDomainData(data);
      let energy = 0;
      for (const sample of data) {
        const centered = (sample - 128) / 128;
        energy += centered * centered;
      }
      return Math.min(1, Math.sqrt(energy / data.length) * 4);
    });
  }

  function playDoor04Success() {
    if (!context || context.state !== "running" || !masterGain || door04SuccessSource) {
      return false;
    }
    const buffer = buffers.get("door04ReferenceMix");
    if (!buffer) return false;
    stopPreview();
    stopDoor04Reference();
    stopDoor04Voice();
    stopDoor04Test();
    const now = context.currentTime;
    door04SuccessGain = context.createGain();
    door04SuccessGain.gain.setValueAtTime(0.0001, now);
    door04SuccessGain.gain.exponentialRampToValueAtTime(0.42, now + 0.4);
    door04SuccessGain.connect(masterGain);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(door04SuccessGain);
    door04SuccessSource = source;
    callbacks.onDoor04SuccessPlaying?.(true);
    source.onended = () => {
      try { source.disconnect(); } catch { /* no-op */ }
      if (door04SuccessSource !== source) return;
      door04SuccessSource = null;
      try { door04SuccessGain?.disconnect(); } catch { /* no-op */ }
      door04SuccessGain = null;
      callbacks.onDoor04SuccessPlaying?.(false);
    };
    source.start(now);
    return true;
  }

  function stopDoor04Success(duration = 0.2) {
    const source = door04SuccessSource;
    if (!source || !context) return;
    door04SuccessSource = null;
    const gain = door04SuccessGain;
    door04SuccessGain = null;
    const now = context.currentTime;
    if (gain && duration > 0) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }
    try { source.stop(now + Math.max(0, duration) + 0.02); } catch { /* no-op */ }
    source.onended = () => {
      try { source.disconnect(); } catch { /* no-op */ }
      try { gain?.disconnect(); } catch { /* no-op */ }
    };
    callbacks.onDoor04SuccessPlaying?.(false);
  }

  function stopDoor04Audio() {
    stopDoor04Reference();
    stopDoor04Voice();
    stopDoor04Test();
    stopDoor04Success(0.12);
  }

  function playDoor05Reference(audioKey, phaseId) {
    if (!context || context.state !== "running" || !masterGain) return false;
    const buffer = buffers.get(audioKey);
    if (!buffer) return false;
    stopPreview();
    stopDoor04Audio();
    stopDoor05Test();
    stopDoor05Reference();

    const startAt = context.currentTime + 0.03;
    door05ReferenceGain = context.createGain();
    door05ReferenceAnalyser = context.createAnalyser();
    door05ReferenceAnalyser.fftSize = 256;
    door05ReferenceData = new Uint8Array(door05ReferenceAnalyser.fftSize);
    door05ReferenceGain.gain.value = 0.5;
    door05ReferenceGain.connect(door05ReferenceAnalyser);
    door05ReferenceAnalyser.connect(masterGain);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(door05ReferenceGain);
    door05ReferenceSource = source;
    door05ReferencePlayback = { phaseId, startAt, duration: buffer.duration };
    door05ReferenceDiagnostics = { audioKey, startAt, duration: buffer.duration, sampleRate: buffer.sampleRate, lastElapsed: null, endedElapsed: null };
    callbacks.onDoor05ReferenceState?.({ playing: true, phaseId });
    source.onended = () => {
      try { source.disconnect(); } catch { /* no-op */ }
      if (door05ReferenceSource !== source) return;
      door05ReferenceDiagnostics.endedElapsed = context.currentTime - startAt;
      cleanupDoor05Reference();
      callbacks.onDoor05ReferenceState?.({ playing: false, phaseId });
    };
    source.start(startAt);
    return { startAt, duration: buffer.duration };
  }

  function stopDoor05Reference() {
    const source = door05ReferenceSource;
    const phaseId = door05ReferencePlayback?.phaseId ?? null;
    if (!source && !door05ReferenceGain) return;
    door05ReferenceSource = null;
    try { source?.stop(); } catch { /* already ended */ }
    try { source?.disconnect(); } catch { /* no-op */ }
    cleanupDoor05Reference();
    callbacks.onDoor05ReferenceState?.({ playing: false, phaseId });
  }

  function cleanupDoor05Reference() {
    door05ReferenceSource = null;
    try { door05ReferenceGain?.disconnect(); } catch { /* no-op */ }
    try { door05ReferenceAnalyser?.disconnect(); } catch { /* no-op */ }
    door05ReferenceGain = null;
    door05ReferenceAnalyser = null;
    door05ReferenceData = null;
    door05ReferencePlayback = null;
  }

  function getDoor05ReferenceTime() {
    if (!context || !door05ReferencePlayback) return null;
    const elapsed = context.currentTime - door05ReferencePlayback.startAt;
    door05ReferenceDiagnostics.lastElapsed = elapsed;
    return elapsed;
  }

  function getDoor05ReferenceLevel() {
    return analyserLevel(door05ReferenceAnalyser, door05ReferenceData, door05ReferenceSource);
  }

  function startDoor05Test(audioKey, requestedDuration = 5.4) {
    if (!context || context.state !== "running" || !masterGain || door05TestNodes.length) {
      return false;
    }
    const buffer = buffers.get(audioKey);
    if (!buffer) return false;
    const plan = door05PlaybackPlan(buffer.duration, requestedDuration);
    if (plan.error) return plan;
    stopPreview();
    stopDoor05Reference();
    stopDoor05Success(0);

    const leadIn = 0.15;
    const duration = requestedDuration;
    const startAt = context.currentTime + leadIn;
    const evaluationAt = startAt + duration + 0.12;
    const looped = plan.looped;
    door05TestGain = context.createGain();
    door05TestGain.gain.value = 0.5;
    door05TestGain.connect(masterGain);
    door05TestPlayback = {
      startAt,
      duration,
      evaluationAt,
      audioKey,
      bufferDuration: buffer.duration,
      looped,
      sourceEndedEarly: false,
    };
    door05Diagnostics = {
      audioKey,
      bufferDuration: buffer.duration,
      testStartAt: startAt,
      expectedBarDuration: 2.7,
      expectedTestDuration: duration,
      evaluationAt,
      looped,
      sourceOnendedAt: null,
    };
    const source = context.createBufferSource();
    source.buffer = buffer;
    if (looped) {
      source.loop = true;
      source.loopStart = 0;
      source.loopEnd = 2.7;
    }
    source.connect(door05TestGain);
    source.onended = () => {
      const endedAt = context?.currentTime ?? null;
      if (door05Diagnostics) door05Diagnostics.sourceOnendedAt = endedAt;
      if (
        door05TestPlayback
        && Number.isFinite(endedAt)
        && endedAt < startAt + duration - 0.04
      ) {
        door05TestPlayback.sourceEndedEarly = true;
        callbacks.onDoor05TestWarning?.({
          audioKey,
          endedAt,
          expectedStopAt: startAt + duration,
        });
      }
      try { source.disconnect(); } catch { /* no-op */ }
    };
    source.start(startAt, 0);
    source.stop(startAt + duration);
    door05TestNodes = [{ source }];
    callbacks.onDoor05TestState?.({
      playing: true,
      startAt,
      duration,
      evaluationAt,
      leadIn,
      audioKey,
      bufferDuration: buffer.duration,
      looped,
    });
    return {
      startAt,
      duration,
      evaluationAt,
      leadIn,
      audioKey,
      bufferDuration: buffer.duration,
      looped,
    };
  }

  function getDoor05TestReadiness(audioKey) {
    const contextRunning = context?.state === "running";
    const bufferReady = buffers.has(audioKey);
    return {
      ready: Boolean(contextRunning && masterGain && bufferReady),
      contextRunning,
      bufferReady,
      contextState: context?.state ?? "unavailable",
    };
  }

  function stopDoor05Test() {
    if (!door05TestNodes.length && !door05TestGain) return;
    const nodes = door05TestNodes;
    const gain = door05TestGain;
    door05TestNodes = [];
    door05TestGain = null;
    door05TestPlayback = null;
    for (const node of nodes) {
      try { node.source.stop(); } catch { /* already ended */ }
      try { node.source.disconnect(); } catch { /* no-op */ }
    }
    try { gain?.disconnect(); } catch { /* no-op */ }
    callbacks.onDoor05TestState?.({ playing: false });
  }

  function getDoor05TestTime() {
    return getDoor05TestClock()?.elapsed ?? null;
  }

  function getDoor05TestClock() {
    if (!context || !door05TestPlayback) return null;
    const audibleClock = door05AudibleClock(context);
    if (!audibleClock) return null;
    return {
      ...audibleClock,
      startAt: door05TestPlayback.startAt,
      elapsed: audibleClock.audibleContextTime - door05TestPlayback.startAt,
      contextState: context.state,
      baseLatency: Number.isFinite(context.baseLatency) ? context.baseLatency : null,
      outputLatency: Number.isFinite(context.outputLatency) ? context.outputLatency : null,
    };
  }

  function getDoor05Diagnostics() {
    const clock = getDoor05TestClock();
    if (!door05Diagnostics) {
      return {
        reference: door05ReferenceDiagnostics ? { ...door05ReferenceDiagnostics } : null,
        decodeFallbacks: { ...door05DecodeFallbacks },
        contextState: context?.state ?? "unavailable",
        baseLatency: Number.isFinite(context?.baseLatency) ? context.baseLatency : null,
        outputLatency: Number.isFinite(context?.outputLatency) ? context.outputLatency : null,
        outputTimestampSupported: typeof context?.getOutputTimestamp === "function",
        visualSyncOffsetMs: door05VisualSyncOffsetMs,
        bufferDurations: Object.fromEntries(
          ["door05Foundation", "door05Drive", "door05Sprint"].map((key) => [
            key,
            buffers.get(key)?.duration ?? null,
          ]),
        ),
      };
    }
    return {
      ...door05Diagnostics,
      decodeFallbacks: { ...door05DecodeFallbacks },      reference: door05ReferenceDiagnostics ? { ...door05ReferenceDiagnostics } : null,
      contextState: context?.state ?? "unavailable",
      baseLatency: Number.isFinite(context?.baseLatency) ? context.baseLatency : null,
      outputLatency: Number.isFinite(context?.outputLatency) ? context.outputLatency : null,
      outputTimestampSupported: typeof context?.getOutputTimestamp === "function",
      clockSource: clock?.source ?? "unavailable",
      audibleContextTime: clock?.audibleContextTime ?? null,
      actualElapsed: clock?.elapsed ?? null,
      visualSyncOffsetMs: door05VisualSyncOffsetMs,
      sourceEndedEarly: door05TestPlayback?.sourceEndedEarly ?? false,
      bufferDurations: Object.fromEntries(
        ["door05Foundation", "door05Drive", "door05Sprint"].map((key) => [
          key,
          buffers.get(key)?.duration ?? null,
        ]),
      ),
    };
  }

  function playDoor05Success() {
    if (!context || context.state !== "running" || !masterGain || door05SuccessSource) {
      return false;
    }
    const buffer = buffers.get("door05RhythmComplete");
    if (!buffer) return false;
    stopPreview();
    stopDoor05Reference();
    stopDoor05Test();
    const now = context.currentTime;
    door05SuccessGain = context.createGain();
    door05SuccessAnalyser = context.createAnalyser();
    door05SuccessAnalyser.fftSize = 256;
    door05SuccessData = new Uint8Array(door05SuccessAnalyser.fftSize);
    door05SuccessGain.gain.setValueAtTime(0.0001, now);
    door05SuccessGain.gain.exponentialRampToValueAtTime(0.46, now + 0.35);
    door05SuccessGain.connect(door05SuccessAnalyser);
    door05SuccessAnalyser.connect(masterGain);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(door05SuccessGain);
    door05SuccessSource = source;
    callbacks.onDoor05SuccessPlaying?.(true);
    source.onended = () => {
      try { source.disconnect(); } catch { /* no-op */ }
      if (door05SuccessSource !== source) return;
      cleanupDoor05Success();
      callbacks.onDoor05SuccessPlaying?.(false);
    };
    source.start(now);
    return true;
  }

  function stopDoor05Success(duration = 0.2) {
    const source = door05SuccessSource;
    if (!source || !context) return;
    door05SuccessSource = null;
    const gain = door05SuccessGain;
    const analyser = door05SuccessAnalyser;
    const now = context.currentTime;
    if (gain && duration > 0) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }
    try { source.stop(now + Math.max(0, duration) + 0.02); } catch { /* no-op */ }
    source.onended = () => {
      try { source.disconnect(); } catch { /* no-op */ }
      try { gain?.disconnect(); } catch { /* no-op */ }
      try { analyser?.disconnect(); } catch { /* no-op */ }
    };
    door05SuccessGain = null;
    door05SuccessAnalyser = null;
    door05SuccessData = null;
    callbacks.onDoor05SuccessPlaying?.(false);
  }

  function cleanupDoor05Success() {
    door05SuccessSource = null;
    try { door05SuccessGain?.disconnect(); } catch { /* no-op */ }
    try { door05SuccessAnalyser?.disconnect(); } catch { /* no-op */ }
    door05SuccessGain = null;
    door05SuccessAnalyser = null;
    door05SuccessData = null;
  }

  function getDoor05SuccessLevel() {
    return analyserLevel(door05SuccessAnalyser, door05SuccessData, door05SuccessSource);
  }

  function stopDoor05Audio() {
    stopDoor05Reference();
    stopDoor05Test();
    stopDoor05Success(0.12);
  }

  function playDoor06Preview(audioKey, entityId, kind) {
    if (!context || context.state !== "running" || !masterGain) return false;
    const buffer = buffers.get(audioKey);
    if (!buffer) return false;
    stopPreview();
    stopDoor05Audio();
    stopDoor06Preview();

    door06PreviewGain = context.createGain();
    door06PreviewAnalyser = context.createAnalyser();
    door06PreviewAnalyser.fftSize = 256;
    door06PreviewData = new Uint8Array(door06PreviewAnalyser.fftSize);
    door06PreviewGain.gain.value = 0.48;
    door06PreviewGain.connect(door06PreviewAnalyser);
    door06PreviewAnalyser.connect(masterGain);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(door06PreviewGain);
    door06PreviewSource = source;
    door06Preview = { entityId, kind };
    callbacks.onDoor06PreviewState?.({ entityId, kind, playing: true, completed: false });
    source.onended = () => {
      try { source.disconnect(); } catch { /* no-op */ }
      if (door06PreviewSource !== source) return;
      cleanupDoor06Preview();
      callbacks.onDoor06PreviewState?.({
        entityId,
        kind,
        playing: false,
        completed: true,
        reason: "natural-end",
      });
    };
    source.start();
    return true;
  }

  function stopDoor06Preview() {
    const source = door06PreviewSource;
    const previous = door06Preview;
    if (!source && !door06PreviewGain) return;
    door06PreviewSource = null;
    try { source?.stop(); } catch { /* already ended */ }
    try { source?.disconnect(); } catch { /* no-op */ }
    cleanupDoor06Preview();
    if (previous) callbacks.onDoor06PreviewState?.({
      ...previous,
      playing: false,
      completed: false,
      reason: "stopped",
    });
  }

  function cleanupDoor06Preview() {
    door06PreviewSource = null;
    door06Preview = null;
    try { door06PreviewGain?.disconnect(); } catch { /* no-op */ }
    try { door06PreviewAnalyser?.disconnect(); } catch { /* no-op */ }
    door06PreviewGain = null;
    door06PreviewAnalyser = null;
    door06PreviewData = null;
  }

  function getDoor06PreviewLevel() {
    return analyserLevel(door06PreviewAnalyser, door06PreviewData, door06PreviewSource);
  }

  function playDoor06Success() {
    if (!context || context.state !== "running" || !masterGain || door06SuccessSource) {
      return false;
    }
    const buffer = buffers.get("door06Complete");
    if (!buffer) return false;
    stopDoor06Preview();
    stopDoor05Audio();
    const now = context.currentTime;
    door06SuccessGain = context.createGain();
    door06SuccessAnalyser = context.createAnalyser();
    door06SuccessAnalyser.fftSize = 256;
    door06SuccessData = new Uint8Array(door06SuccessAnalyser.fftSize);
    door06SuccessGain.gain.setValueAtTime(0.0001, now);
    door06SuccessGain.gain.exponentialRampToValueAtTime(0.42, now + 0.4);
    door06SuccessGain.connect(door06SuccessAnalyser);
    door06SuccessAnalyser.connect(masterGain);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(door06SuccessGain);
    door06SuccessSource = source;
    callbacks.onDoor06SuccessPlaying?.(true);
    source.onended = () => {
      try { source.disconnect(); } catch { /* no-op */ }
      if (door06SuccessSource !== source) return;
      cleanupDoor06Success();
      callbacks.onDoor06SuccessPlaying?.(false);
    };
    source.start(now);
    return true;
  }

  function stopDoor06Success(duration = 0.25) {
    const source = door06SuccessSource;
    if (!source || !context) return;
    door06SuccessSource = null;
    const gain = door06SuccessGain;
    const analyser = door06SuccessAnalyser;
    const now = context.currentTime;
    if (gain && duration > 0) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }
    try { source.stop(now + Math.max(0, duration) + 0.02); } catch { /* no-op */ }
    source.onended = () => {
      try { source.disconnect(); } catch { /* no-op */ }
      try { gain?.disconnect(); } catch { /* no-op */ }
      try { analyser?.disconnect(); } catch { /* no-op */ }
    };
    door06SuccessGain = null;
    door06SuccessAnalyser = null;
    door06SuccessData = null;
    callbacks.onDoor06SuccessPlaying?.(false);
  }

  function cleanupDoor06Success() {
    door06SuccessSource = null;
    try { door06SuccessGain?.disconnect(); } catch { /* no-op */ }
    try { door06SuccessAnalyser?.disconnect(); } catch { /* no-op */ }
    door06SuccessGain = null;
    door06SuccessAnalyser = null;
    door06SuccessData = null;
  }

  function getDoor06SuccessLevel() {
    return analyserLevel(door06SuccessAnalyser, door06SuccessData, door06SuccessSource);
  }

  function stopDoor06Audio() {
    stopDoor06Preview();
    stopDoor06Success(0.12);
  }

  async function playEndingFullTrack() {
    cancelFade();
    fullTrack.pause();
    try { fullTrack.currentTime = 0; } catch { /* metadata may still be loading */ }
    fullTrack.volume = 0.72;
    fullTrackOwner = "ending";
    try {
      await fullTrack.play();
      publishFull("Ready");
      return true;
    } catch {
      if (fullTrackOwner === "ending") fullTrackOwner = null;
      publishFull("Ready");
      return false;
    }
  }

  function publishAssetStates() {
    const groups = [
      ["onFragmentAssetsState", DOOR01_AUDIO_MANIFEST],
      ["onDoor02AssetsState", DOOR02_AUDIO_MANIFEST],
      ["onSuccessLoopState", SUCCESS_LOOP_MANIFEST],
      ["onDoor03AssetsState", DOOR03_AUDIO_MANIFEST],
      ["onDoor04AssetsState", DOOR04_AUDIO_MANIFEST],
      ["onDoor05AssetsState", DOOR05_AUDIO_MANIFEST],
      ["onDoor06AssetsState", DOOR06_AUDIO_MANIFEST],
    ];
    for (const [callbackName, manifest] of groups) {
      const loaded = Object.keys(manifest).filter((key) => buffers.has(key)).length;
      const total = Object.keys(manifest).length;
      publishGroup(callbackName, loaded === total ? "Ready" : loaded > 0 ? "Partial" : "Loading", manifest);
    }
  }

  function analyserLevel(analyser, data, source) {
    if (!analyser || !data || !source) return 0;
    analyser.getByteTimeDomainData(data);
    let energy = 0;
    for (const sample of data) {
      const centered = (sample - 128) / 128;
      energy += centered * centered;
    }
    return Math.min(1, Math.sqrt(energy / data.length) * 4);
  }

  function stopAll() {
    stopPreview();
    stopSuccessLoops(0.05);
    stopDoor03Loop(0);
    stopDoor03Success(0.05);
    stopDoor04Audio();
    stopDoor05Audio();
    stopDoor06Audio();
    cancelFade();
    resetFullTrack();
  }

  return {
    resume, suspendForCharacter: () => context?.suspend?.() ?? Promise.resolve(), preloadFragments: preloadAssets, preloadAssets,
    playFullTrack, pauseFullTrack, toggleFullTrack, fadeOutFullTrack,
    playRoom01Theme, stopRoom01Theme, isRoom01ThemePlaying,
    playPreview, playFragment, playRejectedCue, getPreviewLevel,
    startSuccessLoops, stopSuccessLoops, stopPreview, stopAll,
    playDoor03StageLoop, stopDoor03Loop, getDoor03LoopDiagnostics,
    playDoor03Success, stopDoor03Success, getDoor03SuccessLevel,
    playDoor04Reference, pauseDoor04Reference, playDoor04Voice, startDoor04Test,
    stopDoor04Test, getDoor04TestProgress, playDoor04Success, stopDoor04Success,
    stopDoor04Audio, getDoor04StemLevels,
    playDoor05Reference, stopDoor05Reference, getDoor05ReferenceTime,
    getDoor05ReferenceLevel, startDoor05Test, stopDoor05Test,
    getDoor05TestReadiness, getDoor05TestTime, getDoor05TestClock,
    getDoor05Diagnostics, playDoor05Success, stopDoor05Success,
    getDoor05SuccessLevel, stopDoor05Audio,
    playDoor06Preview, stopDoor06Preview, getDoor06PreviewLevel,
    playDoor06Success, stopDoor06Success, getDoor06SuccessLevel,
    stopDoor06Audio, playEndingFullTrack, publishAssetStates,
  };
}
