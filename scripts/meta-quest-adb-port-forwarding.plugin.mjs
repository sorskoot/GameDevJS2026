import { spawn } from 'node:child_process';

/**
 * @param {string | undefined} deviceSerial
 * @param {...string} args
 */
function buildAdbArgs(deviceSerial, ...args) {
    return deviceSerial ? ['-s', deviceSerial, ...args] : args;
}

/**
 * @param {string} adbPath
 * @param {string[]} args
 */
function runAdb(adbPath, args) {
    return new Promise((resolve, reject) => {
        const child = spawn(adbPath, args, {
            shell: false,
            windowsHide: true,
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (chunk) => {
            stdout += chunk.toString();
        });

        child.stderr.on('data', (chunk) => {
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

/**
 * @param {import('node:http').Server | undefined | null} httpServer
 * @param {number | undefined} configuredPort
 */
function getListeningPort(httpServer, configuredPort) {
    const address = httpServer?.address?.();

    if (address && typeof address === 'object') {
        return address.port;
    }

    return configuredPort;
}

/**
 * @param {{ adbPath?: string; deviceSerial?: string }} [options]
 * @returns {import('vite').Plugin}
 */
export function metaQuestAdbPortForwardingPlugin(options = {}) {
    const { adbPath, deviceSerial } = options;

    let configuredPort;
    let forwardedPort;
    let reverseApplied = false;

    return {
        name: 'meta-quest-adb-port-forwarding',
        apply: 'serve',
        configResolved: (config) => {
            configuredPort = config.server.port;
        },
        configureServer: (server) => {
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
                    await runAdb(adbPath, buildAdbArgs(deviceSerial, 'reverse', `tcp:${port}`, `tcp:${port}`));
                    reverseApplied = true;
                    logger.info(`[meta-quest-adb] Forwarded Meta Quest localhost:${port} to this computer with ADB.`);
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    logger.warn(`[meta-quest-adb] Unable to enable Meta Quest port forwarding for port ${port}.\n${message}`);
                }
            };

            const removeReverse = async () => {
                if (!reverseApplied || !adbPath || !forwardedPort) {
                    return;
                }

                try {
                    await runAdb(adbPath, buildAdbArgs(deviceSerial, 'reverse', '--remove', `tcp:${forwardedPort}`));
                    logger.info(`[meta-quest-adb] Removed Meta Quest ADB reverse for port ${forwardedPort}.`);
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

