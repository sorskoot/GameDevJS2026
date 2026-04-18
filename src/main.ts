import { Game } from "@sorskoot/babylon-kit";
import { MainScene } from "./scenes/MainScene";
import { StoryBeat, storyBeatsManager } from "./story-beats/StoryBeats";
import { CustomBeat, IntroBeat } from "./story-beats/CustomBeat";

async function init(): Promise<void> {
    const game = new Game("gameCanvas");

    storyBeatsManager.registerBeats((context) => [
        new IntroBeat(context),
        new StoryBeat("step1", context),
        new CustomBeat(context),
        new StoryBeat("ending", context),
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
