/**
 * meta-quest-adb-port-forwarding.plugin.ts
 *
 * Vite plugin to simplify forwarding a Vite dev server to a Meta (Oculus/Quest) headset
 * using ADB reverse port forwarding and to optionally open the dev URL on the device.
 *
 * Purpose
 * - Automatically detect a connected Quest headset and create an ADB reverse mapping so
 *   the headset can reach the host computer's Vite dev server at localhost:<port>.
 * - Provide helper warnings when multiple devices are connected and expose a
 *   small public API that can be configured from `vite.config.ts`.
 *
 * Compatibility
 * - Node.js + Vite (apply: 'serve')
 * - Tested on Windows, macOS, and Linux with adb available on PATH or configured via `adbPath`.
 *
 * Usage (quick)
 * - In your `vite.config.ts`:
 *
 *   import { defineConfig } from 'vite'
 *   import { metaQuestAdbPortForwardingPlugin } from './scripts/meta-quest-adb-port-forwarding.plugin'
 *
 *   export default defineConfig({
 *     plugins: [metaQuestAdbPortForwardingPlugin({ adbPath: 'C:/path/to/adb.exe' })]
 *   })
 *
 * Notes
 * - If `adbPath` is omitted, the plugin will try to run the `adb` binary from the environment PATH.
 * - On Windows prefer either a PATH entry or an absolute path with double backslashes (\\) or forward
 *   slashes. Example: `C:\\Android\\platform-tools\\adb.exe` or `C:/Android/platform-tools/adb.exe`.
 *
 * License: MIT (replace as appropriate)
 */
import { spawn } from 'node:child_process';
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';

/**
 * Options for the Meta Quest ADB port forwarding plugin.
 *
 * @property adbPath Optional absolute path to the `adb` binary. If omitted the plugin will
 * attempt to invoke `adb` from the environment PATH. On Windows provide either a PATH entry or
 * an absolute path using double backslashes (\\) or forward slashes.
 * @property deviceSerial Optional ADB device serial string to target a specific headset when
 * multiple devices are connected. If omitted the plugin will attempt to detect a Quest device
 * automatically using adb metadata and getprop probing.
 */
export interface MetaQuestAdbPortForwardingOptions {
    adbPath?: string;
    deviceSerial?: string;
    /**
     * If true, the plugin will attempt to open the dev server URL on the Quest after
     * the ADB reverse mapping has been applied. Default: false.
     */
    openOnStart?: boolean;
}

interface AdbResult {
    stdout: string;
    stderr: string;
}

interface AdbDevice {
    serial: string;
    state: string;
    details: string;
}

interface PluginLogger {
    info(message: string): void;
    warn(message: string): void;
}

function buildAdbArgs(deviceSerial: string | undefined, ...args: string[]) {
    return deviceSerial ? ['-s', deviceSerial, ...args] : args;
}

function runAdb(adbPath: string, args: string[]) {
    return new Promise<AdbResult>((resolve, reject) => {
        const child = spawn(adbPath, args, {
            shell: false,
            windowsHide: true,
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (chunk: Buffer | string) => {
            stdout += chunk.toString();
        });

        child.stderr.on('data', (chunk: Buffer | string) => {
            stderr += chunk.toString();
        });

        child.on('error', (error) => {
            reject(new Error(`Failed to start ADB at "${adbPath}": ${error.message}`));
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve({
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                });
                return;
            }

            const details = [stderr.trim(), stdout.trim()].filter(Boolean).join('\n');
            reject(new Error(`ADB exited with code ${code}.${details ? `\n${details}` : ''}`));
        });
    });
}

function parseAdbDevices(output: string) {
    return output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('List of devices attached'))
        .map((line) => {
            const match = /^(\S+)\s+(\S+)\s*(.*)$/.exec(line);
            if (!match) {
                return null;
            }

            const [, serial, state, details] = match;
            return {
                serial,
                state,
                details,
            } satisfies AdbDevice;
        })
        .filter((device): device is AdbDevice => device !== null);
}

function hasQuestHints(value: string) {
    const lower = value.toLowerCase();
    return lower.includes('quest') || lower.includes('oculus') || lower.includes('meta');
}

function findQuestByAdbMetadata(devices: AdbDevice[]) {
    return devices.filter((device) => hasQuestHints(device.details));
}

async function probeAdbProperty(adbPath: string, serial: string, propertyName: string) {
    try {
        const result = await runAdb(adbPath, ['-s', serial, 'shell', 'getprop', propertyName]);
        return result.stdout.trim();
    } catch {
        return '';
    }
}

async function findQuestByGetProp(adbPath: string, devices: AdbDevice[]) {
    const questDevices: AdbDevice[] = [];

    for (const device of devices) {
        const manufacturer = await probeAdbProperty(adbPath, device.serial, 'ro.product.manufacturer');
        const model = await probeAdbProperty(adbPath, device.serial, 'ro.product.model');
        const deviceName = await probeAdbProperty(adbPath, device.serial, 'ro.product.device');

        if (hasQuestHints(`${manufacturer} ${model} ${deviceName}`)) {
            questDevices.push(device);
        }
    }

    return questDevices;
}

function selectSingleSerial(candidates: AdbDevice[], logger: PluginLogger, reason: string) {
    if (candidates.length === 0) {
        return undefined;
    }

    if (candidates.length === 1) {
        return candidates[0].serial;
    }

    const [selected] = candidates;
    logger.warn(`[meta-quest-adb] ${reason}. Using ${selected.serial}. Set deviceSerial in vite.config.ts to target a specific headset.`);
    return selected.serial;
}

function toQuestLocalUrl(port: number) {
    return `http://localhost:${port}/`;
}

async function resolveTargetSerial(
    adbPath: string,
    configuredDeviceSerial: string | undefined,
    logger: PluginLogger,
) {
    if (configuredDeviceSerial) {
        return configuredDeviceSerial;
    }

    const devicesResult = await runAdb(adbPath, ['devices', '-l']);
    const connectedDevices = parseAdbDevices(devicesResult.stdout).filter((device) => device.state === 'device');

    if (connectedDevices.length === 0) {
        logger.warn('[meta-quest-adb] No authorized ADB devices detected. Connect and authorize your Quest, then restart Vite.');
        return undefined;
    }

    const metadataMatches = findQuestByAdbMetadata(connectedDevices);
    const metadataSelected = selectSingleSerial(metadataMatches, logger, 'Multiple Quest devices were detected from adb metadata');
    if (metadataSelected) {
        return metadataSelected;
    }

    const probedMatches = await findQuestByGetProp(adbPath, connectedDevices);
    const probedSelected = selectSingleSerial(probedMatches, logger, 'Multiple Quest devices were detected from adb getprop data');
    if (probedSelected) {
        return probedSelected;
    }

    if (connectedDevices.length === 1) {
        return connectedDevices[0].serial;
    }

    logger.warn(`[meta-quest-adb] Multiple ADB devices are connected (${connectedDevices.map((device) => device.serial).join(', ')}), but no Quest could be identified automatically. Set deviceSerial in vite.config.ts.`);
    return undefined;
}

type AddressableServer = {
    address(): { port: number } | string | null;
};

function getListeningPort(httpServer: AddressableServer | null | undefined, configuredPort: number | undefined) {
    const address = httpServer?.address();

    if (address && typeof address === 'object') {
        return address.port;
    }

    return configuredPort;
}

/**
 * Create the Vite plugin that forwards the dev server port to a Meta Quest device via ADB.
 *
 * Remarks:
 * - This plugin only applies in `serve` mode (development). It listens to the Vite dev server
 *   address to determine the port and then uses `adb reverse tcp:<port> tcp:<port>` so the
 *   headset can access `http://localhost:<port>/` on the host machine.
 * - The plugin will try to automatically detect a Quest headset when `deviceSerial` is not set.
 * - When the dev server closes the plugin attempts to remove the reverse mapping.
 *
 * Example (vite.config.ts):
 *
 * import { defineConfig } from 'vite'
 * import { metaQuestAdbPortForwardingPlugin } from './scripts/meta-quest-adb-port-forwarding.plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     metaQuestAdbPortForwardingPlugin({
 *       adbPath: 'C:/Android/platform-tools/adb.exe',
 *       // deviceSerial: '0123456789abcdef' // optional
 *     })
 *   ]
 * })
 *
 * @param options Optional configuration for adb path and explicit device serial.
 * @returns A Vite plugin object with apply: 'serve'.
 */
export function metaQuestAdbPortForwardingPlugin(
    options: MetaQuestAdbPortForwardingOptions = {},
): Plugin {
    const { adbPath, deviceSerial, openOnStart = false } = options;

    let configuredPort: number | undefined;
    let forwardedPort: number | undefined;
    let forwardedSerial: string | undefined;
    let reverseApplied = false;

    return {
        name: 'meta-quest-adb-port-forwarding',
        apply: 'serve',
        configResolved: (config: ResolvedConfig) => {
            configuredPort = config.server.port;
        },
        configureServer: (server: ViteDevServer) => {
            const logger = server.config.logger;

            const applyReverse = async () => {
                const port = getListeningPort(server.httpServer, configuredPort);

                if (!port) {
                    logger.warn('[meta-quest-adb] Could not determine the Vite dev server port.');
                    return;
                }

                forwardedPort = port;

                if (!adbPath) {
                    logger.warn(`[meta-quest-adb] Skipping ADB port forwarding for port ${port}: no adbPath was configured in vite.config.ts.`);
                    return;
                }

                try {
                    await runAdb(adbPath, ['start-server']);
                    const serial = await resolveTargetSerial(adbPath, deviceSerial, logger);

                    if (!serial) {
                        logger.warn('[meta-quest-adb] Skipping ADB reverse because no Quest target could be selected.');
                        return;
                    }

                    forwardedSerial = serial;
                    await runAdb(adbPath, buildAdbArgs(serial, 'reverse', `tcp:${port}`, `tcp:${port}`));
                    reverseApplied = true;
                    logger.info(`[meta-quest-adb] Forwarded Meta Quest localhost:${port} to this computer with ADB (${serial}).`);

                    if (openOnStart) {
                        try {
                            await (server as any).openOnQuest();
                        } catch (err) {
                            const message = err instanceof Error ? err.message : String(err);
                            logger.warn(`[meta-quest-adb] Failed to auto-open URL on Quest: ${message}`);
                        }
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    logger.warn(`[meta-quest-adb] Unable to enable Meta Quest port forwarding for port ${port}.\n${message}`);
                }
            };

            (server as any).openOnQuest = async () => {
                if (!adbPath) {
                    logger.warn('[meta-quest-adb] Cannot open on Quest: no adbPath was configured in vite.config.ts.');
                    return;
                }

                const port = forwardedPort ?? getListeningPort(server.httpServer, configuredPort);
                if (!port) {
                    logger.warn('[meta-quest-adb] Cannot open on Quest: could not determine the Vite dev server port.');
                    return;
                }

                const serial = forwardedSerial ?? await resolveTargetSerial(adbPath, deviceSerial, logger);
                if (!serial) {
                    logger.warn('[meta-quest-adb] Cannot open on Quest: no Quest target could be selected.');
                    return;
                }

                const url = toQuestLocalUrl(port);

                try {
                    await runAdb(adbPath, buildAdbArgs(serial, 'shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', url));
                    logger.info(`[meta-quest-adb] Opened ${url} on Quest (${serial}).`);
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    logger.warn(`[meta-quest-adb] Failed to open URL on Quest (${serial}).\n${message}`);
                }
            };

            const removeReverse = async () => {
                if (!reverseApplied || !adbPath || !forwardedPort || !forwardedSerial) {
                    return;
                }

                try {
                    await runAdb(adbPath, buildAdbArgs(forwardedSerial, 'reverse', '--remove', `tcp:${forwardedPort}`));
                    logger.info(`[meta-quest-adb] Removed Meta Quest ADB reverse for port ${forwardedPort} (${forwardedSerial}).`);
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    logger.warn(`[meta-quest-adb] Failed to remove Meta Quest port forwarding for port ${forwardedPort}.\n${message}`);
                }
            };

            if (!server.httpServer) {
                logger.warn('[meta-quest-adb] Vite did not expose an HTTP server; skipping ADB port forwarding.');
                return;
            }

            if (server.httpServer.listening) {
                void applyReverse();
            } else {
                server.httpServer.once('listening', () => {
                    void applyReverse();
                });
            }


            server.httpServer.once('close', () => {
                void removeReverse();
            });
        },
    };
}



