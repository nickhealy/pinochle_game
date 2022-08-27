export const createCenteredContainer = () => {
  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  return container;
};

export const createButton = (text: string) => {
  const btn = document.createElement("button");
  btn.innerText = text;
  return btn;
};
