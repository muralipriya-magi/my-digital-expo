const themeFallbacks = [
  { match: ["tech", "technology", "digital", "ai"], image: "/theme-placeholders/technology.svg" },
  { match: ["food", "culinary", "restaurant"], image: "/theme-placeholders/food.svg" },
  { match: ["fashion", "style", "beauty"], image: "/theme-placeholders/fashion.svg" },
  { match: ["business", "corporate", "enterprise"], image: "/theme-placeholders/business.svg" },
  { match: ["education", "learning", "academic"], image: "/theme-placeholders/education.svg" },
  { match: ["startup", "innovation", "founder"], image: "/theme-placeholders/startup.svg" },
]

export function getThemeImage(themeName, themeImage) {
  if (themeImage) return themeImage

  const normalized = (themeName || "").toLowerCase()
  const fallback = themeFallbacks.find((item) => item.match.some((word) => normalized.includes(word)))

  return fallback?.image || "/theme-placeholders/default.svg"
}
