export function getTextWidth(text: string, font?: string): number | undefined {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context) {
    context.font = font || window.getComputedStyle(document.body).font;

    return context.measureText(text).width;
  }
}
