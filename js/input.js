const MOVEMENT_CODES = new Set([
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
  "KeyW", "KeyA", "KeyS", "KeyD",
]);

export function createInput(canvas, onInteraction = () => {}) {
  let queuedAction=null;
  const pressed = new Set();
  const tapped = new Set();
  let listenRequested = false;
  let enterRequested = false;
  let spaceRequested = false;
  let cancelRequested = false;

  function onKeyDown(event) {
    if (document.activeElement !== canvas) return;

    if (MOVEMENT_CODES.has(event.code)) {
      event.preventDefault();
      onInteraction();
      pressed.add(event.code);
      if (!event.repeat) tapped.add(event.code);
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      onInteraction();
      if (!event.repeat) spaceRequested = true;
      return;
    }

    if (event.code === "KeyE") {
      event.preventDefault();
      onInteraction();
      if (!event.repeat) listenRequested = true;
      return;
    }

    if (event.code === "Enter") {
      event.preventDefault();
      onInteraction();
      if (!event.repeat) enterRequested = true;
      return;
    }

    if (event.code === "Escape") {
      // In immersive mode the first Escape belongs to the browser and exits
      // fullscreen. Once back in the normal layout, Escape resumes its usual
      // in-game cancel/return action.
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        clear();
        return;
      }
      event.preventDefault();
      onInteraction();
      if (!event.repeat) cancelRequested = true;
    }
  }

  function onKeyUp(event) {
    pressed.delete(event.code);
  }

  function clear() {
    queuedAction=null;
    pressed.clear();
    tapped.clear();
    listenRequested = enterRequested = spaceRequested = cancelRequested = false;
  }

  function onPointerDown() {
    canvas.focus();
    onInteraction();
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", clear);
  canvas.addEventListener("pointerdown", onPointerDown);

  // Pointer controls use the same request/pressed-key path as physical keys.
  const touch = document.createElement('div');
  touch.className='game-touch-controls';touch.setAttribute('aria-label','觸控遊戲操作');
  const bindings=[['ArrowUp','↑'],['ArrowLeft','←'],['ArrowDown','↓'],['ArrowRight','→'],['KeyE','E 聆聽'],['Enter','拿取／確認'],['Space','測試'],['Escape','取消／歸還']];
  for(const [code,label] of bindings){
    const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.control=code;
    button.addEventListener('pointerdown',event=>{event.preventDefault();canvas.focus();button.setPointerCapture(event.pointerId);onKeyDown({code,repeat:false,preventDefault(){}});});
    const release=()=>pressed.delete(code);button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
    touch.append(button);
  }
  canvas.after(touch);

  return {
    queueAction(targetId,code){queuedAction={targetId,code};onInteraction();},
    consumeAction(){const a=queuedAction;queuedAction=null;return a;},
    direction() {
      const down = (...codes) => codes.some((code) => pressed.has(code) || tapped.has(code));
      const direction = {
        x: Number(down("ArrowRight", "KeyD")) - Number(down("ArrowLeft", "KeyA")),
        y: Number(down("ArrowDown", "KeyS")) - Number(down("ArrowUp", "KeyW")),
      };
      tapped.clear();
    listenRequested = enterRequested = spaceRequested = cancelRequested = false;
      return direction;
    },
    consumeListen() {
      const value = listenRequested;
      listenRequested = false;
      return value;
    },
    consumeEnter() {
      const value = enterRequested;
      enterRequested = false;
      return value;
    },
    consumeSpace() {
      const value = spaceRequested;
      spaceRequested = false;
      return value;
    },
    consumeCancel() {
      const value = cancelRequested;
      cancelRequested = false;
      return value;
    },
    reset() { clear(); listenRequested = false; enterRequested = false; spaceRequested = false; cancelRequested = false; },
    clearRequests() {
      listenRequested = false;
      enterRequested = false;
      spaceRequested = false;
      cancelRequested = false;
    },
    destroy() {
      touch.remove();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clear);
      canvas.removeEventListener("pointerdown", onPointerDown);
    },
  };
}
