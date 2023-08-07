export const isFirefox = (): boolean => {
  return window.navigator.userAgent.match("Firefox") !== null;
};

export const isChrome = (): boolean => {
  return window.navigator.userAgent.match("Chrome") !== null;
};

export const isEdge = (): boolean => {
  return window.navigator.userAgent.match(/Edge\/(\d+).(\d+)$/) !== null;
};
