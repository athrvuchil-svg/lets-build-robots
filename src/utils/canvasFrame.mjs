/** Render one real canvas frame and report whether a 2D context exists. */
export function renderCanvasFrame(canvas, draw) {
  const context = canvas?.getContext?.('2d');
  if (!context) return false;
  draw(context);
  return true;
}
