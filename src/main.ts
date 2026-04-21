import { Game } from "@sorskoot/babylon-kit";
import { MainScene } from "./scenes/MainScene";
import { storyBeatsManager } from "./story-beats/StoryBeats";
import { Beat1, Beat2, Beat3, Beat4, Beat5, Beat6 } from "./story-beats/CustomBeat";

async function init(): Promise<void> {
    const game = new Game("gameCanvas");

    storyBeatsManager.registerBeats((context) => [
        new Beat1(context),
        new Beat2(context),
        new Beat3(context),
        new Beat4(context),
        new Beat5(context),
        new Beat6(context),

    ]);

    const mainScene = new MainScene(
        game.getEngine(),
        game.uiManager,
        game.assetManager,
        game.particleManager,
        game.animationManager,
    );

    await game.sceneManager.addScene("main", mainScene);
    await game.sceneManager.switchTo("main");

    storyBeatsManager.start();
    game.start();
}
await init();
