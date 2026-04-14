import {defineConfig, loadEnv} from 'vite';
import { metaQuestAdbPortForwardingPlugin } from './scripts/meta-quest-adb-port-forwarding.plugin.ts';

export default ({ mode }:{mode:string}) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    const metaQuestAdbPath = env.VITE_META_QUEST_ADB_PATH;
    return defineConfig({
        plugins: [
            metaQuestAdbPortForwardingPlugin({
                adbPath: metaQuestAdbPath,
                openOnStart:true
            }),
        ],
        server:  {
            port: 4623,
            host: '0.0.0.0',
        },
    });
};