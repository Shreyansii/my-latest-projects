self.onmessage = function (e) {
  const text = e.data.trim();
  const wordCount = text === "" ? 0 : text.split(/\s+/).length;
  const charCount = text.length;
  self.postMessage({ wordCount, charCount });
};
