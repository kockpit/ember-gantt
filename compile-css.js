/*eslint no-undef: "error"*/
/*eslint-env node*/

var sass = require('node-sass'); // eslint-disable-line
var fs = require('fs');
var path = require('path');

var inputFile = path.join(__dirname, 'app', 'styles', 'ember-gantt.scss');
var outputFile = path.join(__dirname, 'vendor', 'ember-gantt.css');
var buf = fs.readFileSync(inputFile, "utf8");

// Compile main file
var result = sass.renderSync({
  data: buf,
  includePaths: ['app/styles']
});

fs.writeFileSync(outputFile, result.css);
