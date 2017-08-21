/* eslint-env node */
'use strict';

const Funnel = require('broccoli-funnel');
const path = require('path');
const fs = require('fs');

const faPath = path.dirname(require.resolve('font-awesome/package.json'));

module.exports = {
  name: 'ember-cli-notifications',

  options: {},

  treeForVendor() {
    return new Funnel(faPath, {
      destDir: 'font-awesome',
      include: ['css/*', `fonts/*`]
    });
  },

  included(app) {
    const projectConfig = this.project.config(app.env);
    const config = projectConfig['ember-cli-notifications'];

    // see: https://github.com/ember-cli/ember-cli/issues/3718
    if (typeof app.import !== 'function' && app.app) {
      app = app.app;
    }

    this.app = app;

    this.assignCssVariables(config);

    // Don't import Font Awesome assets if specified in consuming app
    if (config.includeFontAwesome !== false) {
      this.importFontAwesome(app);
    }

    this._super.included.apply(this, arguments);
  },

  assignCssVariables(config) {
    this.options = Object.assign({}, this.options, {
      cssModules: {
        plugins: [
          require('postcss-cssnext')
        ],
        postcssOptions: {
          map: true
        },
        virtualModules: {
          'colour-variables': {
            '--error-colour': config.errorColour || '#e74c3c',
            '--info-colour': config.infoColour || '#3ea2ff',
            '--success-colour': config.successColour || '#64ce83',
            '--warn-colour': config.warnColour || '#ff7f48',
          }
        }
      }
    });
  },

  importFontAwesome(app) {
    const cssPath = 'vendor/font-awesome/css';
    const fontsPath = 'vendor/font-awesome/fonts';
    const absoluteFontsPath = path.join(faPath, 'fonts');
    const fontsToImport = fs.readdirSync(absoluteFontsPath);

    fontsToImport.forEach((fontFilename) => {
      app.import(
        path.join(fontsPath, fontFilename),
        { destDir: '/fonts' }
      );
    });
    app.import({
      development: path.join(cssPath, 'font-awesome.css'),
      production: path.join(cssPath, 'font-awesome.min.css')
    });
  }
};
