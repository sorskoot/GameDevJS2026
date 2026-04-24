import {
    ActionManager,
    CreateAudioEngineAsync,
    CreateSoundAsync,
    Engine,
    ExecuteCodeAction,
    FreeCamera,
    HemisphericLight,
    type Mesh,
    MeshBuilder,
    PointLight,
    Texture,
    Vector3, WebXRDefaultExperience,
    WebXRMotionControllerManager, WebXRState,
} from '@babylonjs/core';

import {
    AnimationManager,
    AssetManager,
    GameScene,
    metadataRepository,
    ParticleManager,
    SorskootEntryTypes,
    UIManager,
    XRManager,
} from '@sorskoot/babylon-kit';
import {AnsweringMachineObject} from '../entities/AnsweringMachineObject.ts';

import {DoorObject} from '../entities/DoorObject.ts';
import {InspectObject} from '../entities/InspectObject.ts';
import {storyBeatsManager} from '../story-beats/StoryBeats.ts';

export class MainScene extends GameScene {
    private uiManager: UIManager;
    private assetManager: AssetManager;
    private particleManager: ParticleManager;
    private animationManager: AnimationManager;
    private webXRDefaultExperience: WebXRDefaultExperience;

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
        this.scene.onNewTextureAddedObservable.add(tex => {
            tex.updateSamplingMode(Texture.NEAREST_SAMPLINGMODE);
        });

        // TODO: Make the camera move with WASD too
        const camera = new FreeCamera(
            'mainCamera',
            new Vector3(0, 1.6, 0),
            this.scene,
        );
        camera.setTarget(new Vector3(0, 1.5, -1));
        camera.attachControl(true);
        camera.ellipsoid = new Vector3(0.25, 0.75, 0.25);

        camera.checkCollisions = true;
        this.scene.collisionsEnabled = true;
        camera.applyGravity = true;
        camera.minZ = 0.05;
        camera.speed = 0.25;
        camera.inertia = 0.75;

        const playerCollisionTrigger = MeshBuilder.CreateBox("player-trigger-collider", { size: 0.25 }, this.scene);
        playerCollisionTrigger.isVisible = false;
        playerCollisionTrigger.isPickable = false;
        playerCollisionTrigger.checkCollisions = false;

        const globalLight = new HemisphericLight(
            'mainLight',
            new Vector3(0, 1, 0),
            this.scene,
        );
        globalLight.intensity = 0.1;

        const triggerZone = MeshBuilder.CreateBox('triggerZone', {size: 3}, this.scene);
        triggerZone.position.set(0, 0.5, -5);

        triggerZone.actionManager = new ActionManager(this.scene);
        triggerZone.actionManager.registerAction(new ExecuteCodeAction({
            trigger:   ActionManager.OnIntersectionEnterTrigger,
            parameter: playerCollisionTrigger,
        }, () => {
            console.log('Enter');
        }));

        triggerZone.actionManager.registerAction(new ExecuteCodeAction({
            trigger:   ActionManager.OnIntersectionExitTrigger,
            parameter: playerCollisionTrigger,
        }, () => {
            console.log('Exit');
        }));

        triggerZone.isVisible = false; // Hide the trigger zone
        triggerZone.checkCollisions = false;

        const light = new PointLight(
            'pointLight',
            new Vector3(0, 0, 0),
            this.scene,
        );
        light.parent = camera;

        WebXRMotionControllerManager.UseOnlineRepository = false;

        const supported = await XRManager.isSupported();
        if (supported) {
            // TODO: Controls need finetuning (rotation is too fast and there's a hick-up when moving
            // TODO: Switch playerTrigger when entering or exiting XR
            this.webXRDefaultExperience = await this.initializeXR({
                movement: {mode: 'locomotion'},
            });

            this.webXRDefaultExperience.baseExperience.camera.applyGravity = true;
            this.webXRDefaultExperience.baseExperience.camera.checkCollisions = true;
            this.webXRDefaultExperience.baseExperience.camera.ellipsoid = new Vector3(0.25, 0.75, 0.25);
            this.webXRDefaultExperience.baseExperience.camera.minZ = 0.05;
            this.webXRDefaultExperience.baseExperience.camera.speed = 2;
        }

        const apartment = await this.assetManager.loadModel(
            'apartment',
            '/assets/models/',
            'Apartment.glb',
            this.scene,
        );

        const audioEngine = await CreateAudioEngineAsync();

        await this.processMetadata();

        this.scene.onBeforeRenderObservable.add(() => {
            if(this.xrManager.isInXR()){
                playerCollisionTrigger.position.copyFrom(this.webXRDefaultExperience.baseExperience.camera.globalPosition);
            }else {
                playerCollisionTrigger.position.copyFrom(camera.position);
            }
        });

        // Wait until audio engine is ready to play sounds.
        // await audioEngine.unlockAsync(); //TK: Is this call really needed?
        apartment.addToScene();
    }

    /**
     * Run through the metaDataRepository and handle settings
     * @private
     */
    private async processMetadata(): Promise<void> {
        for (const node of metadataRepository) {
            // enable collisions
            if (
                node.data.generic?.collision &&
                node.mesh &&
                'checkCollisions' in node.mesh
            ) {
                (node.mesh as any).checkCollisions = true;
                console.log(`collision for ${node.name}`);
            }
        }

        const doors = metadataRepository.getByType(SorskootEntryTypes.Door);
        let doorIndex = 0;
        for (const door of doors) {
            if (!door.mesh) continue;

            const doorObj = new DoorObject(
                `door_${doorIndex}`,
                this.scene,
                door.mesh,
                this.animationManager,
                {
                    reversed: door.data.door?.reversed,
                    locked:   true, // all doors are locked at the start
                },
            );
            this.addGameObject(`door_${doorIndex}`, doorObj);
            this.interactionManager.enableInteraction(doorObj);
            doorIndex++;
        }

        const inspectables = metadataRepository.getByType(SorskootEntryTypes.Inspectable);
        for (const inspectable of inspectables) {
            if (!inspectable.mesh) {
                continue;
            }
            const inspectableObj = new InspectObject(inspectable.name, this.scene, inspectable.mesh)

            this.addGameObject(`inspectable_${inspectable.id}`, inspectableObj);
            this.interactionManager.enableInteraction(inspectableObj);

        }

        // Set up Answering Machine
        const beep = await CreateSoundAsync('beep', '/assets/sfx/beep.mp3');
        const answeringMachine = metadataRepository.getById('AnsweringMachine');
        const answeringMachineObj = new AnsweringMachineObject(
            this.scene,
            answeringMachine!.mesh! as Mesh,
            beep,
            storyBeatsManager.events,
        );
        this.addGameObject(`AnsweringMachine`, answeringMachineObj);
        this.interactionManager.enableInteraction(answeringMachineObj);
    }
}
