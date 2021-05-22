export type QueueItem = {
  uid: string;
  id: number;
  sid: number;
  title: string;
};
export type ReadQueue = QueueItem[];

export type ExtensionOptions = {
  customCss: boolean;
  removeAfterReading: boolean;
  showQueueOnStart: boolean;
}

export const DEFAULT_EXTENSION_OPTIONS = {
  // default values match the defaults from popup.js
  customCss: false,
  removeAfterReading: true,
  showQueueOnStart: false
};