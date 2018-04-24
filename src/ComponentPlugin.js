
const _ = require('lodash');
const Runtime = require('./RuntimeAnalyzer');

const {findPropDefaults} = require('./util');

let base; //= 'module.exports';

/**
 * @file
 * the componentmapper offers functions to map a regular jsdoc file into a meaningfull json structure
 * it can also enrich the jsdoc structure with valuable runtime informations
 */

function findMembers(data, name) {

    const props = {};

    data.forEach(el => {

        const longAdd = base + '.' + name;
        if (['member', 'function', 'event'].includes(el.kind)&& el.memberof && el.memberof === longAdd) {
            el.simpleName = el.name;
            props[el.name] = el;
        }

    });
    return props;
}

function findProps(data, runtime) {
    const res = findMembers(data, 'props');

    //
    if (runtime) {
        findPropDefaults(res, runtime);
    }

    return res;

}

function findData(data) {
    const res = {};
    data.forEach(el => {
        if (!el.undocumented && el.kind === 'member' && el.scope === 'global') {
            res[el.name] = el;
        }
    });

    return res;
}

function findEvents(data) {

    const emit = {};
    data.forEach(el => {
        if (el.kind === 'event') {
            emit[el.name] = el;
        }
    });
    return emit;
}

function findMethods(data) {
    const res = findMembers(data, 'methods');
    // const parser = require('./Module');
    _.forEach(res, func => {
        // const fun = parser.analyseFunction(func, name);
        func.signature = func.signature && func.signature.split('.methods.').pop();
        res[func.name] = func;

    });
    return res;
}

const Plugin = require('./Plugin');

module.exports = class ComponentPlugin extends Plugin {

    onMap(desc) {
        this.map(desc);
    }

    getRuntimeService(desc) {
        if (!this.runtimeService) {
            this.runtimeService = new Runtime(desc.package.getRootPackage());
            if (desc.config.watch) {
                this.runtimeService.watch();
                this.runtimeService.on('change', () => {
                    desc.package.getRootPackage().emit('change');
                });
            }
        }
        return this.runtimeService;
    }

    /**
     * helper function to load the runtime for a component or module
     * @param {*} config
     * @param {*} desc
     */
    onAnalyze(desc) {

        const {config} = desc;

        if (config.runtime) {

            if (_.isString(config.runtime)) {

                const serv = this.getRuntimeService(desc);
                return serv.getRuntime(desc.resource).then(runtime => {
                    this.runtime = runtime;
                });

                // return this.webpackFile(config, desc.path);

            } else {
                const runtime = _.get(config.runtime, `${desc.type}.${desc.name}`) || _.get(config.runtime, desc.name);
                return Promise.resolve(runtime || {});
            }
        }

        if (config.crudeImport) {
            try {
                return Promise.resolve(this.crudeImport(desc.script));
            } catch (e) {
                console.warn('could not import runtime for: ' + desc.name);
                console.warn(e);
            }
        }

        return Promise.resolve({});

    }

    map({data: desc}) {

        if (!desc) debugger;

        const {documented: entries, runtime, types: {function: funcs}} = desc;

        base = 'module.exports';
        desc.all.forEach(entry => {
            if ((entry.type && entry.type.names.includes(desc.type)) && entry.kind === 'constant') {
                base = entry.longname;
            }
        });

        [
            {props: findProps},
            {data: findData},
            'computed',
            {methods: findMethods},
            'events',
            {emit: findEvents},
            {trigger: data => data.filter(el => el.kind === 'trigger')},
            {components: (data, runtime) => ['test']}
        ].forEach(type => {

            const simple = typeof type === 'string';

            const name = simple ? type : Object.keys(type)[0];

            const members = simple ? findMembers(entries, name, runtime) : type[name](entries, runtime);
            if (_.size(members)) {
                desc[name] = members;

                //remove functions form the general function list
                _.forEach(members, member => {
                    _.remove(funcs, func => func === member);
                });
            }

        });

        entries.forEach(data => {
            if (data.longname === base) {
                desc.description = data.description;
            }
        });

        return desc;
    }

};