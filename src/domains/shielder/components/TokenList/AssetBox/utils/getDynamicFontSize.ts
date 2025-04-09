export default (textLength: number, minSize: number, maxSize:number, step: number) => {
  const newSize = maxSize - (textLength * step);

  return Math.max(minSize, newSize);
};
