import defaultSettings from './constants-default';
// eslint-disable-next-line node/no-unpublished-import
import customSettings from './constants-custom';

// eslint-disable-next-line import/no-mutable-exports
let settings = defaultSettings;
settings = { ...settings, ...customSettings }; // Plays better with autocompletion

export default settings;
