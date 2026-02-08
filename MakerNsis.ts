import { MakerBase, MakerOptions } from "@electron-forge/maker-base";
import { ForgeArch, ForgePlatform } from "@electron-forge/shared-types";
import { build, Platform, Arch, NsisOptions, Configuration } from "app-builder-lib";
import path from "path";
import fs from "fs";

// WARNING: only create a build/installer.nsi once I have an actual script otherwise it will prevent building

export default class MakerNSIS extends MakerBase<NsisOptions> {
  name = "nsis";
  defaultPlatforms: ForgePlatform[] = ["win32"];

  isSupportedOnCurrentPlatform(): boolean {
    return process.platform === "win32";
  }

  async make({ dir, makeDir, appName, packageJSON, targetArch }: MakerOptions): Promise<string[]> {
    const outDir = path.resolve(makeDir, "nsis", targetArch);
    await this.ensureDirectory(outDir);

    console.log(`Building NSIS installer:`);
    console.log(`  Input (packaged app): ${dir}`);
    console.log(`  Output (installer):   ${outDir}`);

    const builderConfig: Configuration = {
      // FIXME: I think I want this to come from the
      appId: packageJSON.name,
      productName: appName,
      // FIXME: Errors because it needs to be 256x256
      // icon: "assets/dcdc_appearance_viewer_icon.ico",
      directories: {
        output: outDir,
      },
      win: {
        target: "nsis",
        // MUST BE THE SAME AS IN FORGE'S CONFIG
        executableName: "DCDB Appearance Viewer",
      },
      nsis: this.config,
    };

    console.log(JSON.stringify(builderConfig, null, 2));
    console.log(`Targets: ${Platform.WINDOWS.createTarget("nsis", this.mapArch(targetArch)).values.toString()}`);

    try {
      const artifacts = await build({
        targets: Platform.WINDOWS.createTarget("nsis", this.mapArch(targetArch)),
        config: builderConfig,
        prepackaged: dir,
      });

      // Filter out any directories, keep only files
      // TODO: Why this
      const files = artifacts.filter((artifact) => {
        const isFile = fs.statSync(artifact).isFile();
        console.log(`  ${isFile ? "✓" : "✗"} ${path.basename(artifact)} ${isFile ? "(file)" : "(directory)"}`);
        return isFile;
      });

      // Verify latest.yml was created
      // TODO: Should error if this is not created
      const latestYml = path.join(outDir, "latest.yml");
      if (fs.existsSync(latestYml)) {
        console.log(`✓ Generated latest.yml for electron-updater`);
        const content = fs.readFileSync(latestYml, { encoding: "utf8" });
        console.log(`  Content:\n${content}`);
      }

      return files;
    } catch (error) {
      // console.error("Build failed with error:");
      // console.error(error);
      if (error instanceof Error) {
        // console.error("Stack trace:", error.stack);
      }
      throw error;
    }
  }

  private mapArch(targetArch: ForgeArch): Arch {
    switch (targetArch) {
      case "ia32":
        return Arch.ia32;
      case "x64":
        return Arch.x64;
      case "armv7l":
        return Arch.armv7l;
      case "arm64":
        return Arch.arm64;
      default:
        return Arch.universal;
    }
    // mips64el is omitted because it seems to only be relevant for linux
  }
}

export { MakerNSIS };
