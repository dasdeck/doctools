## {{{name}}}

`{{{signature}}}`

{{{desctription}}}

{{_.forEach(tables, (rows, name) => { }}
### {{{name}}}

{{_.forEach(rows, (row, index) => { }}
{{{ row.join('|') }}}
{{ if (index === 0) { }} {{{ Array(row.length).fill('---').join('|') }}} {{ } }}

{{ if (returns) { }}
### returns

`Promise`

A promise that resolves with the given payload on success and rejects on failure

{{ } }}

{{ _.forEach(examples, example => { }}
{{{example}}}{{ } }}

### tests

{{ _.forEach(tests, renderTest) }}