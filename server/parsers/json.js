module.exports = str => {
  try {
    const data = JSON.parse(str);
    return (typeof data === 'object') ? data : null;
  } catch (e) {
    return null;
  }
}