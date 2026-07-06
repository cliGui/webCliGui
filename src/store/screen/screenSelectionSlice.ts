import { StateCreator } from 'zustand';
import { DataStoreIf } from '../dataStoreIf';
import { Screen, ScreenSelectionIf, TabKey } from './screenSelectionIf';

export const screenSelectionSlice: StateCreator<
  DataStoreIf,
  [['zustand/immer', never], ['zustand/devtools', never]],
  [],
  ScreenSelectionIf
> = (set) => ({
  screen: Screen.TABS,
  selectedTabKey: TabKey.CreateTask,

  setScreen: (screen: Screen) => set(state => { state.screenSelection.screen = screen }, false, 'setScreen'),
  setSelectedTabKey: (tabKey: TabKey) => set(state => { state.screenSelection.selectedTabKey = tabKey }, false, 'setSelectedTabKey'),
  screenSelectionReset: () => set(state => {
    state.screenSelection.screen = Screen.TABS;
    state.screenSelection.selectedTabKey = TabKey.CreateTask;
  }, false, 'screenSelectionReset'),
});
