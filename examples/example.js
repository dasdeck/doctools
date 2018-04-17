const parser = require('../src/parser');
const _ = require('lodash');

const all = parser.parse(__dirname);

debugger;

const options = {
    interpolate: /{{{([\s\S]+?)}}}/g,
    evaluate: /{{([\s\S]+?)}}/g,
    imports: {}
};

const tableRender = _.template(`
### {{{name}}}
{{ rows.splice(1, 0, Array(rows[0].length).fill('---')) }}
{{ _.forEach(rows, row => { }}{{{ row.join('|') }}}
{{ }); }}
`, options);

options.imports.renderTable = tableRender;

options.imports.renderFunction = _.template(
`## {{{el.longname}}}

\`{{{signature}}}\`

{{{el.description}}}

{{_.forEach(tables, (rows, name) => { }}
{{{ renderTable({rows, name}) }}}{{ }); }}

{{ _.forEach(el.returns, ret => { }}
### returns

\`{{{ ret.type.names.join('|') }}}\`

{{{ret.description}}}

{{ }); }}

{{ _.forEach(el.examples, example => { }}
{{{example}}}{{ }); }}

`, options);

const moduleRenderer = _.template(
`## {{{name}}} {{ if (coverage) { }}({{{coverage}}}){{ } }}

{{{description}}}

***

{{_.forEach(functions, func => { }}{{{ renderFunction(func) }}}
{{ }); }}`, options);

options.imports.renderModule = module => {
    if (module.functions.length) {
        const res = moduleRenderer(module);
        return res;
    } else {
        return '';
    }
};

const renderPachage = _.template(
`# uikit-utils

# api

***

{{_.forEach(module, module => { }}{{{ renderModule(module) }}}
{{ }); }}`, options);

const res = renderPachage(all);

debugger;