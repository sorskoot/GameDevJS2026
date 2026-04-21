import {StoryBeat, type StoryBeatContext} from './StoryBeats';

export class Beat1 extends StoryBeat {
    constructor(context: StoryBeatContext) {
        super('Beat1', context);
    }

    public override onStart(): void {
        console.log('Intro beat started');

        this.listen('answering-machine.used', () => {
            this.context.events.emit({
                type:      'message.started',
                messageId: 'intro-message',
            });
        });

        this.listen('message.finished', (event) => {
            if (event.messageId !== 'intro-message') return;

            this.state.unlockedDoors.add('kitchen');
            this.next();
        });
    }
}

export class Beat2 extends StoryBeat {
    constructor(context: StoryBeatContext) {
        super('Beat2', context);
    }

    public override onStart(): void {
        console.log('Beat2 started');
    }
}

export class Beat3 extends StoryBeat {
    constructor(context: StoryBeatContext) {
        super('Beat3', context);
    }

    public override onStart(): void {
        console.log('Beat3 started');
    }
}

export class Beat4 extends StoryBeat {
    constructor(context: StoryBeatContext) {
        super('Beat4', context);
    }

    public override onStart(): void {
        console.log('Beat4 started');
    }
}

export class Beat5 extends StoryBeat {
    constructor(context: StoryBeatContext) {
        super('Beat5', context);
    }

    public override onStart(): void {
        console.log('Beat5 started');
    }
}

export class Beat6 extends StoryBeat {
    constructor(context: StoryBeatContext) {
        super('Beat6', context);
    }

    public override onStart(): void {
        console.log('Beat6 started');
    }
}