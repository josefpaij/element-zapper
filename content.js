const unhideElement = (elem, prev) => {
  Object.keys(prev).forEach((styl) => {
    elem.style[styl] = prev[styl];
  });
};

const hideElement = (elem) => {
  const prevStyle = {
    opacity: elem.style.opacity || null,
    position: elem.style.position || null,
    pointerEvents: elem.style.pointerEvents || null,
  };
  elem.style.opacity = 0;
  elem.style.position = 'absolute';
  elem.style.pointerEvents = 'none';
  return prevStyle;
};

const undoer = document.createElement('input');
undoer.style.height = '0px';
undoer.style.padding = '0px';
undoer.style.border = 'none';
undoer.value = -1;
undoer.tabIndex = -1;
undoer.addEventListener('focus', (e) => {
  e.preventDefault();
  window.setTimeout(() => undoer.blur(), 0);
});

hideElement(undoer);

let duringInput = false;
let undoStack = [];
const pushNewUndoState = (element, prevStyles) => {
  // remove states past now, add our new state
  const nextStateId = parseInt(undoer.value) + 1;
  undoStack.splice(nextStateId, undoStack.length - nextStateId, [element, prevStyles]);

  duringInput = true;
  // focus and "type" the next number
  undoer.focus();
  document.execCommand('selectAll');
  document.execCommand('insertText', false, nextStateId);

  duringInput = false;
}

undoer.addEventListener('input', (ev) => {
  // nb. don't use 'change', it doesn't fire in all browsers
  if (!duringInput) {
    const [element, prevStyles] = undoStack[parseInt(undoer.value) + 1];
    unhideElement(element, prevStyles);
  }
});

document.body.appendChild(undoer);

document.addEventListener('click', (e) => {
  if (e.shiftKey && e.metaKey) {
    e.preventDefault();
    e.stopPropagation();

    // save scroll
    const scrollPositions = [window.scrollX, window.scrollY];

    // save the previous styles keeping the previous styles
    const prevStyles = hideElement(e.target)
    pushNewUndoState(e.target, prevStyles);

    window.scroll(...scrollPositions);
  }
});

console.log('%cCreated CMD + SHIFT + Click listener to hide elements under the mouse', 'padding: 1rem;background-color:rgba(100,219,0,0.3)');

