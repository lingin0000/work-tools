const isTauri = () => {
  return Boolean(
    typeof window !== "undefined" &&
      window !== undefined &&
      // @ts-ignore
      window.__TAURI_IPC__ !== undefined
  );
};

export default isTauri;