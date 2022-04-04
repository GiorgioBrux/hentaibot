import merge from 'deepmerge-json';
import defaultSettings from './constants-default.js';

let customSettings;
try {
    // eslint-disable-next-line import/no-unresolved
    customSettings = await import('./constants-custom.js');
} catch (e) {
    throw new Error('Custom config missing or not a valid .js file.');
}

// eslint-disable-next-line import/no-mutable-exports
let settings = defaultSettings;
settings = merge(settings, customSettings); // Plays better with autocompletion

export default settings;
