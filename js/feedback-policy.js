// One presentation policy for canvas, desktop DOM and touch UI.
export function hintsEnabled(state) { return state.ui.hintsVisible === true; }

export function isGameplayNarration(sequenceId = '') {
  return sequenceId === 'completion' || /^wrong-/.test(sequenceId)
    || /^door0[2-6]-(?:education-|wrong-|completion$|reference-completion$|pair-completion$|trio-completion$|foundation-completion$|drive-completion$|sprint-completion$|stage-transition$)/.test(sequenceId);
}

export function currentRoomAudioStatus(state) {
  const room = state.gameProgress.currentRoom;
  let statuses;
  if (room === 1) statuses = [state.audio.fragmentAssetsStatus];
  else if (room === 6 && state.door06.stage === 'relays') {
    const keys = ['fragmentAssetsStatus', 'door02AssetsStatus', 'door03AssetsStatus', 'door04AssetsStatus', 'door05AssetsStatus'];
    statuses = [state.audio[keys[Math.min(4, state.door06.activeRelayIndex)]]];
  } else statuses = [state.audio[`door0${room}AssetsStatus`]];
  if (statuses.some(status => status === 'Error' || status === 'Partial')) return 'Error';
  return statuses.every(status => status === 'Ready') ? 'Ready' : 'Loading';
}

export function feedbackMessage(state) {
  if (state.ui.saveError) return { kind: 'save-error', lines: [state.ui.saveError], alpha: 1 };
  if (state.door06.status === 'confirming') return null;
  const message = state.ui.message;
  if (message && (message.room ?? state.gameProgress.currentRoom) === state.gameProgress.currentRoom
    && ['rejected', 'blocked', 'audio', 'save-error'].includes(message.kind)) {
    // A single actionable line; explanations live in player-opened help.
    return { ...message, lines: [message.lines[0]] };
  }
  if (currentRoomAudioStatus(state) === 'Error') {
    return { kind: 'audio', lines: ['本關音訊載入不完整，請重新整理重試。'], alpha: 1 };
  }
  return null;
}
