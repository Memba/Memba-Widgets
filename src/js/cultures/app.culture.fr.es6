/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/**
 * Application resources
 */
// import data from './data.fr.es6';
import dialogs from './dialogs.fr.es6';
import editors from './editors.fr.es6';
import libraries from './libraries.fr.es6';
import tools from './tools.fr.es6';
import webapp from '../../../webapp/locales/fr.json';

/**
 * Kendo UI resources
 */
import '../vendor/kendo/cultures/kendo.culture.fr-FR';
import '../vendor/kendo/messages/kendo.messages.fr-FR';
import './widgets.fr.es6';

window.kendo.culture('fr-FR');

/**
 * Default export
 */
export default {
    // data
    dialogs,
    editors,
    libraries,
    tools,
    webapp
};
