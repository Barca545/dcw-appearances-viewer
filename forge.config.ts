import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { PublisherGitHubConfig } from "@electron-forge/publisher-github";
import dotenv from "dotenv";

dotenv.config();

const githubPublisherConfig: PublisherGitHubConfig = {
  repository: {
    name: "publication_date_sort",
    owner: "Barca545",
  },
  authToken: process.env.GITHUB_TOKEN,
  draft: true,
  force: false,
  generateReleaseNotes: true,
  prerelease: true,
  octokitOptions: {},
  tagPrefix: "v",
};

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: "dcdb-appearance-viewer",
    appBundleId: "DCDB-Appearance-Viewer",
    executableName: "DCDB Appearance Viewer",
    extraResource: ["./resources/appMessages.json", "./resources/settings.json"],
    icon: "assets/dcdc_appearance_viewer_icon.ico",
    overwrite: true,
  },
  rebuildConfig: {},
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: githubPublisherConfig,
    },
  ],
  makers: [
    new MakerSquirrel({
      // loadingGif:
      // remoteReleases:
      // remoteToken:
      setupExe: "DCDB Appearance Viewer Install.exe",
      skipUpdateIcon: true,
    }),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main/main.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "src/preload/preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      // [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
