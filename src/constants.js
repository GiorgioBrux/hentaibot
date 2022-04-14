import merge from 'deepmerge-json';
import defaultSettings from './constants-default.js';

let customSettings;
try {
    customSettings = await import('./constants-custom.js');
} catch (e) {
    throw new Error('Custom config missing or not a valid .js file.');
}

// eslint-disable-next-line import/no-mutable-exports
let settings = defaultSettings;
settings = merge(settings, customSettings.default); // Plays better with autocompletion

export default settings;
