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

export const createCenteredFullScreenContainer = () => {
  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  return container;
};

export const createInnerContainer = () => {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.flexDirection = "column";
  container.style.width = "35%";
  container.style.position = "relative";
  return container;
};

export const createButton = (text: string) => {
  const btn = document.createElement("button");
  btn.innerText = text;
  btn.style.width = "45%";
  btn.style.padding = "10px 20px";
  btn.style.borderRadius = "5px";
  btn.style.backgroundColor = "transparent";
  btn.style.border = "2px solid white";
  btn.style.color = "white";
  btn.style.cursor = "pointer";
  return btn;
};

export const createInlineBackButton = () => {
  const container = document.createElement("div");
  container.style.width = "100%";

  const backBtn = document.createElement("i");
  backBtn.classList.add("fa-solid", "fa-arrow-left", "fa-xl");
  backBtn.style.color = "white";
  backBtn.style.cursor = "pointer";
  backBtn.style.marginLeft = "5px";
  backBtn.style.opacity = ".5";
  backBtn.addEventListener("mouseenter", () => {
    backBtn.style.opacity = "1";
  });
  backBtn.addEventListener("mouseleave", () => {
    backBtn.style.opacity = ".5";
  });
  backBtn.addEventListener("click", () => {
    backBtn.style.opacity = ".5"; // hack because this view stays in memory once we go back
  });

  container.appendChild(backBtn);
  return container;
};
