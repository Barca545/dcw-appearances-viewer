interface SemVer {
  major: number;
  minor: number;
  patch: number;
}

export function parseVersion(version: string): SemVer {
  const INVALID_VERSION_FORMAT = "version format isn't valid (must be `MAJOR.MINOR.PATCH`)";
  const vparts = version.split(".");
  if (vparts.length != 3) throw new Error(INVALID_VERSION_FORMAT);
  else {
    try {
      return {
        major: parseInt(vparts[0]),
        minor: parseInt(vparts[1]),
        patch: parseInt(vparts[2]),
      };
    } catch {
      throw new Error(INVALID_VERSION_FORMAT);
    }
  }
}

/**Returns `true` if `a` is greater than `b`.*/
export function isVersionGreater(a: SemVer, b: SemVer): boolean {
  return a.major >= b.major || a.minor >= b.minor || a.patch > b.patch;
}
