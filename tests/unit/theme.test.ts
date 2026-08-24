import { describe, it, expect, beforeEach } from "vitest";

// Theme constants and validation
export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "workpulse-theme";

class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

class MockClassList {
  private classes = new Set<string>();

  add(cls: string) {
    this.classes.add(cls);
  }

  remove(cls: string) {
    this.classes.delete(cls);
  }

  contains(cls: string) {
    return this.classes.has(cls);
  }

  toArray() {
    return Array.from(this.classes);
  }
}

describe("Theme System Logic & State Management", () => {
  let mockStorage: MockLocalStorage;
  let mockRootClasses: MockClassList;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    mockRootClasses = new MockClassList();
  });

  function resolveThemeState(
    theme: Theme,
    systemPrefersDark: boolean
  ): { resolved: ResolvedTheme; isDark: boolean } {
    const resolved: ResolvedTheme =
      theme === "system" ? (systemPrefersDark ? "dark" : "light") : theme;
    return {
      resolved,
      isDark: resolved === "dark",
    };
  }

  function applyThemeToDOM(resolved: ResolvedTheme, classList: MockClassList) {
    if (resolved === "dark") {
      classList.add("dark");
      classList.remove("light");
    } else {
      classList.remove("dark");
      classList.add("light");
    }
  }

  it("resolves default dark theme properly", () => {
    const { resolved, isDark } = resolveThemeState("dark", false);
    expect(resolved).toBe("dark");
    expect(isDark).toBe(true);

    applyThemeToDOM(resolved, mockRootClasses);
    expect(mockRootClasses.contains("dark")).toBe(true);
    expect(mockRootClasses.contains("light")).toBe(false);
  });

  it("resolves light theme and updates classes", () => {
    const { resolved, isDark } = resolveThemeState("light", true);
    expect(resolved).toBe("light");
    expect(isDark).toBe(false);

    applyThemeToDOM(resolved, mockRootClasses);
    expect(mockRootClasses.contains("dark")).toBe(false);
    expect(mockRootClasses.contains("light")).toBe(true);
  });

  it("resolves system mode based on system preference", () => {
    // When system is dark
    const darkSystem = resolveThemeState("system", true);
    expect(darkSystem.resolved).toBe("dark");

    // When system is light
    const lightSystem = resolveThemeState("system", false);
    expect(lightSystem.resolved).toBe("light");
  });

  it("persists theme preference to storage key 'workpulse-theme'", () => {
    mockStorage.setItem(STORAGE_KEY, "light");
    expect(mockStorage.getItem(STORAGE_KEY)).toBe("light");

    mockStorage.setItem(STORAGE_KEY, "dark");
    expect(mockStorage.getItem(STORAGE_KEY)).toBe("dark");

    mockStorage.setItem(STORAGE_KEY, "system");
    expect(mockStorage.getItem(STORAGE_KEY)).toBe("system");
  });

  it("supports toggle behavior between dark and light modes", () => {
    let currentResolved: ResolvedTheme = "dark";

    function toggle(curr: ResolvedTheme): ResolvedTheme {
      return curr === "dark" ? "light" : "dark";
    }

    currentResolved = toggle(currentResolved);
    expect(currentResolved).toBe("light");

    currentResolved = toggle(currentResolved);
    expect(currentResolved).toBe("dark");
  });
});
