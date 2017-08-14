const Loki = require('lokijs');
const LokiFsStructuredAdapter = require('lokijs/src/loki-fs-structured-adapter');

module.exports = async dbUrl => new Promise((resolve) => {
  const db = new Loki(dbUrl, {
    adapter: new LokiFsStructuredAdapter(),
    autoload: true,
    autosave: true,
    autosaveInterval: 1000,
    autoloadCallback: () => resolve(db),
  });
});
