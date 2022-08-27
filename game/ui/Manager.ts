import "reflect-metadata";
import { Application } from "@pixi/app";
import { DisplayObject } from "@pixi/display";
import { inject, injectable } from "inversify";
import { Scene } from "./scenes/Scene";
import TYPES from "./types/main";
import Background from "./containers/background/Background";

@injectable()
export class Manager {
  // Safely store variables for our game
  protected background: Background;
  private currentScene: Scene | undefined;

  constructor(@inject<Background>(TYPES.Background) bg: Background) {
    // Create our pixi app
    this.background = bg;
  }

  public changeScene(newScene: Scene): void {
    // Remove and destroy old scene... if we had one..
    if (this.currentScene) {
      this.currentScene.destroy();
    }

    // Add the new one
    this.currentScene = newScene;
    this.currentScene.render();
  }

  //   private static update(framesPassed: number): void {
  //     if (this.currentScene) {
  //       this.currentScene.update(framesPassed);
  //     }
  //   }
}
