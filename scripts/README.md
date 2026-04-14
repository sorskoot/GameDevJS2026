# Meta Quest ADB Port Forwarding (Vite plugin)

This directory contains a small Vite plugin that helps forward a local Vite dev server to a Meta (Oculus/Quest) headset using ADB reverse port forwarding.

## Purpose

- Automatically detect a connected Meta Quest headset and create an ADB reverse mapping so the headset can reach the host computer's Vite dev server at `http://localhost:<port>/`.
- Provide configuration to explicitly target a device or specify an `adb` binary path.

## Installation

No package install required — the plugin is a local TypeScript file. Import it from your `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import { metaQuestAdbPortForwardingPlugin } from './scripts/meta-quest-adb-port-forwarding.plugin'

export default defineConfig({
  plugins: [
    metaQuestAdbPortForwardingPlugin({ adbPath: 'C:/Android/platform-tools/adb.exe' })
  ]
})
```

## Configuration Options

- `adbPath?: string` — Optional absolute path to `adb`. If omitted the plugin will attempt to run `adb` from the environment PATH.
- `deviceSerial?: string` — Optional ADB serial of the target headset. If omitted the plugin will attempt to detect a Quest automatically.
 - `openOnStart?: boolean` — If true the plugin will attempt to open the dev server URL on the Quest after a successful port reverse. Default: `false`.

## Examples

vite.config.ts example with explicit adb path and device serial:

```ts
import { defineConfig } from 'vite'
import { metaQuestAdbPortForwardingPlugin } from './scripts/meta-quest-adb-port-forwarding.plugin'

export default defineConfig({
  plugins: [
    metaQuestAdbPortForwardingPlugin({
      adbPath: 'C:/Android/platform-tools/adb.exe',
      deviceSerial: '0123456789ABCDEF',
      openOnStart: true
    })
  ]
})
```

Example using PATH-resolved adb (no adbPath):

```ts
metaQuestAdbPortForwardingPlugin({ openOnStart: true })
```

## Windows path notes

When supplying `adbPath` on Windows:

- Use double backslashes `C:\\Android\\platform-tools\\adb.exe` or forward slashes `C:/Android/platform-tools/adb.exe`.
- Alternatively add the platform-tools folder to your PATH so the plugin can call `adb` without an absolute path.

## Troubleshooting

- "Failed to start ADB" — Make sure `adb` exists at `adbPath` or is available on PATH and that you can run `adb devices` from a terminal.
- "No authorized ADB devices detected" — Authorize the headset for USB debugging (accept the prompt on the Quest) and ensure `adb devices -l` shows the device in `device` state.
- Multiple devices connected — either unplug extra devices or set `deviceSerial` in your vite config to target a specific headset.

## Testing / Manual verification

1. Start your Vite dev server (npm run dev or vite).
2. Confirm Vite is listening on the port shown in the terminal (default 5173).
3. Connect your Quest, authorize ADB, and run `adb devices -l` — you should see the headset in `device` state.
4. With the plugin enabled, check the Vite logs: the plugin will print messages indicating whether a reverse mapping was applied and which serial was used.
5. On the headset open the browser and navigate to `http://localhost:<port>/` (the plugin may auto-open the URL on the headset if configured to do so via the plugin actions).

## Notes and future ideas

- The plugin currently attempts to detect Quest devices heuristically using device metadata and `getprop` — if detection is ambiguous, explicitly set `deviceSerial`.
- Could be extended to automatically discover `adb` on common SDK paths.

---

If you want additional sections (license, maintainer, examples for macOS/Linux), tell me which ones and I will add them.
