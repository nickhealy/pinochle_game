export enum Spacer {
  small = 5,
  medium = 10,
  large = 15,
}

export const createSpacer = (size: Spacer) => {
  const spacer = document.createElement("div");
  spacer.style.width = "100%";
  spacer.style.height = `${size}px`;
  return spacer;
};

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
  btn.style.width = "100%";
  btn.style.padding = "10px 20px";
  btn.style.borderRadius = "5px";
  btn.style.backgroundColor = "transparent";
  btn.style.border = "2px solid white";
  btn.style.color = "white";
  btn.style.cursor = "pointer";
  return btn;
};
