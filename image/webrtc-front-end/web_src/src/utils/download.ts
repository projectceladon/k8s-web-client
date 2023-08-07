

export const download = async (blob: any, file: string): Promise<void> => {
  const url = window.URL.createObjectURL(new Blob(["\uFEFF" + blob]));
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = url;
  link.setAttribute("download", file);
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href);
  document.body.removeChild(link);
};
