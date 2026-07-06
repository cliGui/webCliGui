export enum Screen {
  TABS = 'TABS',
  FOLDER = 'FOLDER',
}

export enum TabKey {
  CreateTask = 'createTask',
  Status = 'status',
}

export interface ScreenSelectionIf {
  screen: Screen;
  selectedTabKey: TabKey;

  setScreen: (screen: Screen) => void;
  setSelectedTabKey: (tabKey: TabKey) => void;
  screenSelectionReset: () => void;
}
