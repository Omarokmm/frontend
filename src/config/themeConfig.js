export const THEME_PRESETS = [
  {
    id: "slate",
    name: "Classic Slate",
    primary: "#0284c7",
    fontColor: "#1e293b",
    layoutBg: "#f1f5f9",
    navbarBg: "#ffffff",
    navbarFontColor: "#1e293b",
    sidebarBg: "#ffffff",
    sidebarFontColor: "#334155",
    cardBg: "#ffffff",
    cardBorder: "#cbd5e1",
    cardTitleBg: "#e2e8f0",
    tableHeaderBg: "#f1f5f9",
    tableHeaderColor: "#1e293b",
    tableBg: "#ffffff",
    tableTextColor: "#1e293b",
    tableBorderColor: "#e2e8f0"
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    primary: "#2563eb",
    fontColor: "#0f172a",
    layoutBg: "#e0f2fe",
    navbarBg: "#ffffff",
    navbarFontColor: "#0f172a",
    sidebarBg: "#f0f9ff",
    sidebarFontColor: "#0369a1",
    cardBg: "#ffffff",
    cardBorder: "#bae6fd",
    cardTitleBg: "#bae6fd",
    tableHeaderBg: "#e0f2fe",
    tableHeaderColor: "#0369a1",
    tableBg: "#ffffff",
    tableTextColor: "#0f172a",
    tableBorderColor: "#bae6fd"
  },
  {
    id: "emerald",
    name: "Emerald Mint",
    primary: "#059669",
    fontColor: "#064e3b",
    layoutBg: "#ecfdf5",
    navbarBg: "#ffffff",
    navbarFontColor: "#064e3b",
    sidebarBg: "#f0fdf4",
    sidebarFontColor: "#15803d",
    cardBg: "#ffffff",
    cardBorder: "#bbf7d0",
    cardTitleBg: "#d1fae5",
    tableHeaderBg: "#ecfdf5",
    tableHeaderColor: "#065f46",
    tableBg: "#ffffff",
    tableTextColor: "#064e3b",
    tableBorderColor: "#bbf7d0"
  },
  {
    id: "dark",
    name: "Dark Luxe",
    primary: "#38bdf8",
    fontColor: "#ffffff",
    layoutBg: "#0b1329",
    navbarBg: "#0f172a",
    navbarFontColor: "#ffffff",
    sidebarBg: "#0f172a",
    sidebarFontColor: "#ffffff",
    cardBg: "#1e293b",
    cardBorder: "#334155",
    cardTitleBg: "#334155",
    tableHeaderBg: "#1e293b",
    tableHeaderColor: "#38bdf8",
    tableBg: "#0f172a",
    tableTextColor: "#ffffff",
    tableBorderColor: "#334155"
  },
  {
    id: "sunset",
    name: "Warm Sunset",
    primary: "#d97706",
    fontColor: "#451a03",
    layoutBg: "#fef3c7",
    navbarBg: "#ffffff",
    navbarFontColor: "#451a03",
    sidebarBg: "#fffbeb",
    sidebarFontColor: "#b45309",
    cardBg: "#ffffff",
    cardBorder: "#fde68a",
    cardTitleBg: "#fde68a",
    tableHeaderBg: "#fef3c7",
    tableHeaderColor: "#78350f",
    tableBg: "#ffffff",
    tableTextColor: "#451a03",
    tableBorderColor: "#fde68a"
  },
  {
    id: "violet",
    name: "Royal Violet",
    primary: "#7c3aed",
    fontColor: "#2e1065",
    layoutBg: "#f5f3ff",
    navbarBg: "#ffffff",
    navbarFontColor: "#2e1065",
    sidebarBg: "#faf5ff",
    sidebarFontColor: "#6b21a8",
    cardBg: "#ffffff",
    cardBorder: "#ddd6fe",
    cardTitleBg: "#ede9fe",
    tableHeaderBg: "#f5f3ff",
    tableHeaderColor: "#581c87",
    tableBg: "#ffffff",
    tableTextColor: "#2e1065",
    tableBorderColor: "#ddd6fe"
  }
];

export const applyGlobalTheme = (theme) => {
  if (!theme) return;
  const root = document.documentElement;

  // Global layout system variables
  root.style.setProperty("--layout-bg", theme.layoutBg);
  root.style.setProperty("--layout-font-color", theme.fontColor);
  root.style.setProperty("--layout-navbar-bg", theme.navbarBg);
  root.style.setProperty("--navbar-font-color", theme.navbarFontColor || theme.fontColor);
  root.style.setProperty("--layout-sidebar-bg", theme.sidebarBg || theme.navbarBg);
  root.style.setProperty("--sidebar-font-color", theme.sidebarFontColor || theme.fontColor);
  root.style.setProperty("--layout-card-bg", theme.cardBg);
  root.style.setProperty("--layout-card-border", theme.cardBorder);
  root.style.setProperty("--layout-card-title-bg", theme.cardTitleBg || theme.cardBorder);
  root.style.setProperty("--primary-color", theme.primary);

  // Table system variables
  root.style.setProperty("--table-header-bg", theme.tableHeaderBg || theme.cardTitleBg || "#f1f5f9");
  root.style.setProperty("--table-header-color", theme.tableHeaderColor || theme.fontColor);
  root.style.setProperty("--table-bg", theme.tableBg || theme.cardBg || "#ffffff");
  root.style.setProperty("--table-text-color", theme.tableTextColor || theme.fontColor);
  root.style.setProperty("--table-border-color", theme.tableBorderColor || theme.cardBorder || "#e2e8f0");

  // Overview bar variables
  root.style.setProperty("--ov-panel-bg", theme.cardBg);
  root.style.setProperty("--ov-panel-border", theme.cardBorder);
  root.style.setProperty("--ov-card-bg", theme.layoutBg === "#ffffff" ? "#f8fafc" : theme.layoutBg);
  root.style.setProperty("--ov-card-border", theme.cardBorder);
  root.style.setProperty("--ov-label-color", theme.fontColor);
  root.style.setProperty("--ov-text-color", theme.fontColor);
  root.style.setProperty("--ov-primary", theme.primary);

  try {
    localStorage.setItem("app_theme_palette", JSON.stringify(theme));
  } catch (err) {
    console.error("Failed to save theme in localStorage:", err);
  }

  // Notify any active listeners across the app
  window.dispatchEvent(new CustomEvent("appThemeChanged", { detail: theme }));
};

export const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem("app_theme_palette");
    if (saved) {
      const parsed = JSON.parse(saved);
      applyGlobalTheme(parsed);
      return parsed;
    }
  } catch (err) {
    console.error("Failed to read theme from localStorage:", err);
  }
  applyGlobalTheme(THEME_PRESETS[0]);
  return THEME_PRESETS[0];
};
