import type { Plugin } from 'vite';

export interface MetaQuestAdbPortForwardingOptions {
    adbPath?: string;
    deviceSerial?: string;
}

export function metaQuestAdbPortForwardingPlugin(
    options?: MetaQuestAdbPortForwardingOptions,
): Plugin;

