declare module "electron-forge-maker-nsis" {
  import { MakerBase } from "@electron-forge/maker-base";

  // These are the actual electron-builder NSIS options
  // Reference: https://www.electron.build/configuration/nsis
  export interface MakerNSISConfig {
    /**
     * One-click installation (no installation wizard).
     * @default true
     */
    oneClick?: boolean;

    /**
     * Whether to install per-machine (requires admin) or per-user.
     * @default false
     */
    perMachine?: boolean;

    /**
     * Allow requesting for elevation. If false, user will have to restart installer with elevated permissions.
     * @default true
     */
    allowElevation?: boolean;

    /**
     * Whether to allow user to change installation directory.
     * @default false if oneClick is true
     */
    allowToChangeInstallationDirectory?: boolean;

    /**
     * The path to installer icon, relative to the build resources or to the project directory.
     */
    installerIcon?: string;

    /**
     * The path to uninstaller icon, relative to the build resources or to the project directory.
     */
    uninstallerIcon?: string;

    /**
     * installerHeader — MUI_HEADERIMAGE, relative to the build resources or to the project directory.
     * @default build/installerHeader.bmp
     */
    installerHeader?: string;

    /**
     * installerSidebar — MUI_WELCOMEFINISHPAGE_BITMAP, relative to the build resources or to the project directory.
     * @default build/installerSidebar.bmp
     */
    installerSidebar?: string;

    /**
     * installerHeaderIcon — MUI_HEADERIMAGE_RIGHT, relative to the build resources or to the project directory.
     */
    installerHeaderIcon?: string;

    /**
     * The path to NSIS include script to customize installer.
     */
    include?: string;

    /**
     * The NSIS script content to customize installer.
     */
    script?: string;

    /**
     * The path to EULA license file.
     */
    license?: string;

    /**
     * GUID to identify the application.
     */
    guid?: string;

    /**
     * If warningsAsErrors is true, treat warnings as errors.
     * @default true
     */
    warningsAsErrors?: boolean;

    /**
     * The compression level.
     * @default "normal"
     */
    compression?: "store" | "fast" | "normal" | "maximum";

    /**
     * Run application after finish.
     * @default true
     */
    runAfterFinish?: boolean;

    /**
     * Create Desktop shortcut.
     * @default true
     */
    createDesktopShortcut?: boolean;

    /**
     * Create Start Menu shortcut.
     * @default true
     */
    createStartMenuShortcut?: boolean;

    /**
     * Name of the Start Menu folder.
     */
    menuCategory?: boolean | string;

    /**
     * Shortcut name.
     * @default ${productName}
     */
    shortcutName?: string;

    /**
     * Whether to delete app data on uninstall.
     * @default false
     */
    deleteAppDataOnUninstall?: boolean;

    /**
     * The uninstall display name in the control panel.
     * @default ${productName} ${version}
     */
    uninstallDisplayName?: string;

    /**
     * Whether to pack the elevate executable (required for electron-updater if per-machine).
     * @default true
     */
    packElevateHelper?: boolean;

    /**
     * Whether to create a web installer.
     */
    differentialPackage?: boolean;

    /**
     * Whether to display language selector dialog.
     * @default false
     */
    multiLanguageInstaller?: boolean;

    /**
     * LCID Dec, defaults to 1033 (English - United States).
     */
    language?: string;

    /**
     * The artifact file name template.
     */
    artifactName?: string;

    /**
     * Whether to create a portable app.
     */
    portable?: boolean;

    /**
     * Custom NSIS defines.
     */
    defines?: Record<string, any>;

    /**
     * Unicode mode.
     * @default true
     */
    unicode?: boolean;
  }

  export default class MakerNSIS extends MakerBase<MakerNSISConfig> {
    constructor(config?: MakerNSISConfig, platforms?: string[]);

    name: string;
    defaultPlatforms: string[];

    isSupportedOnCurrentPlatform(): Promise<boolean>;
  }
}
