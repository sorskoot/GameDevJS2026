import {
    Engine,
    FreeCamera,
    HemisphericLight,
    Vector3,
    WebXRMotionControllerManager,
} from '@babylonjs/core';

import {AnimationManager, AssetManager, GameScene, ParticleManager, UIManager, XRManager} from '@sorskoot/babylon-kit';

export class MainScene extends GameScene {

    private uiManager: UIManager;
    private assetManager: AssetManager;
    private particleManager: ParticleManager;
    private animationManager: AnimationManager;

    constructor(
        engine: Engine,
        uiManager: UIManager,
        assetManager: AssetManager,
        particleManager: ParticleManager,
        animationManager: AnimationManager,
    ) {
        super(engine);
        this.uiManager = uiManager;
        this.assetManager = assetManager;
        this.particleManager = particleManager;
        this.animationManager = animationManager;
    }

    public async setup(): Promise<void> {
        // TODO: Make the camera move with WASD too
        const camera = new FreeCamera('mainCamera', new Vector3(0, 1.7, 0), this.scene);
        camera.setTarget(new Vector3(0, 1.7, -1));
        camera.attachControl(true);
        camera.ellipsoid = new Vector3(.25, .85, .25);
        camera.checkCollisions = true;
        this.scene.collisionsEnabled = true;
        camera.applyGravity = true;
        camera.minZ = 0.05;
        camera.speed = 0.25;
        camera.inertia =.75;

        new HemisphericLight('mainLight', new Vector3(0, 1, 0), this.scene);
        WebXRMotionControllerManager.UseOnlineRepository = false;

        const supported = await XRManager.isSupported();
        if (supported) {
            // TODO: Controls need finetuning (rotation is too fast and there's a hick-up when moving
            const xr = await this.initializeXR({movement: {mode: 'locomotion'}});
            xr.baseExperience.camera.applyGravity = true;
            xr.baseExperience.camera.checkCollisions = true;
            xr.baseExperience.camera.ellipsoid = new Vector3(.25, .85, .25);
            xr.baseExperience.camera.minZ = 0.05;
            xr.baseExperience.camera.speed = 2;



        }

        const apartment = await this.assetManager.loadModel(
            'apartment',
            '/assets/models/',
            'Apartment.glb',
            this.scene,
        );

        apartment.meshes[1].checkCollisions = true;
        apartment.addToScene();
    }
}