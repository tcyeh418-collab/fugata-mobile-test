import { cancelDoor06Selection, confirmDoor06Selection } from './door06.js';

export function createMemoryConfirmation(getState, audio, input, canvas) {
  const dialog = document.createElement('dialog');
  dialog.className = 'memory-confirmation';
  dialog.tabIndex = -1;
  dialog.setAttribute('aria-keyshortcuts', 'Space Escape');
  dialog.setAttribute('aria-labelledby', 'memory-confirmation-title');
  dialog.setAttribute('aria-describedby', 'memory-confirmation-copy');
  dialog.innerHTML = '<h2 id="memory-confirmation-title">確認送回核心？</h2><p id="memory-confirmation-copy"></p><div><button type="button" data-cancel autofocus>返回比較</button><button type="button" data-confirm>確認送出</button></div>';
  document.body.append(dialog);
  const copy = dialog.querySelector('p');
  function finish(confirm) {
    const state = getState();
    if (state.door06.status !== 'confirming') return;
    if (confirm) { void audio.resume(); confirmDoor06Selection(state, audio); }
    else cancelDoor06Selection(state);
    input.reset();
    if (state.door06.status !== 'confirming') {
      dialog.close(); canvas.focus({ preventScroll: true });
    }
  }
  dialog.querySelector('[data-confirm]').onclick = () => finish(true);
  dialog.querySelector('[data-cancel]').onclick = () => finish(false);
  dialog.addEventListener('cancel', event => { event.preventDefault(); finish(false); });
  dialog.addEventListener('keydown', event => {
    if (event.code === 'Space' && !event.repeat && event.target === dialog) {
      event.preventDefault(); finish(true);
    }
  });
  return { render(state) {
    const visible = state.phase === 'game' && state.gameProgress.currentRoom === 6 && state.door06.status === 'confirming';
    if (!visible) { if (dialog.open) dialog.close(); return; }
    const selected = state.door06Memories.find(memory => memory.id === state.door06.selectedMemoryId);
    copy.textContent = `將「${selected?.displayLabel ?? '記憶片段'}」送回核心進行比對？`;
    if (!dialog.open) { input.reset(); dialog.showModal(); dialog.focus(); }
  }};
}
