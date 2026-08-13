export interface NavigationHistory {
  paths: string[];
  index: number;
}

export function pushNavigationPath(
  history: NavigationHistory,
  path: string,
): NavigationHistory {
  if (history.paths[history.index] === path) {
    return history;
  }

  const paths = [...history.paths.slice(0, history.index + 1), path];
  return { paths, index: paths.length - 1 };
}
