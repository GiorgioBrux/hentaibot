import merge from 'deepmerge-json';
import defaultSettings from './constants-default.js';
import customSettings from './constants-custom.js';

// eslint-disable-next-line import/no-mutable-exports
let settings = defaultSettings;
settings = merge(settings, customSettings); // Plays better with autocompletion

export default settings;
