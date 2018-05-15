-seperate module for big deps / runnners
-lodash es
-uikitonly once?
-utils seperate?

-mode serializations to single plugins

-change to markdown-it

-reactive uikit tabs
    -v-if

-vuepress export:
    -folder followmenu structure

-give each plugin reserved memeory
-prevent multiple analysis at once
    -busy flag?
-assign vue templates
    -sidebars
    -menus
    -types
    -etc.

-add server config to config?

-re-unify runtime builds to web/umd
-refactor out 'assets'

-nuxt!

-refactore
    -move adapters and bridges, so compiler loads only if relevant code changes
    -refactor out the example runners

-add arbitrary runners
    -demonstrate functions, etc.
    -run:test:MyTestedFunction
    -multi input test runners?
        -html
        -javscript

-make markdown render cachable
-extract examples inside the vuepress exporter / markdown only once

-default menu from config (recursive with functions)

-make asset wathcing part of each module
    -unwatch assets in runtime module
    -watch for add/remove in package


-analyse defaults from local code, instead of full script

-custom css => file or source

-config-mapper (for runtime , e.g. default values)

-type linker
    -check double types

-grouped log

-multiple components per file
    -seperate files and "content"

-improve/review plugin flow -> pipeline

-runtime
    -split runtime analyzer back to normal mappers
    - move all runtime stuff to runtime plugin
    - also the watch option
    -optional pass objects
    -request runtime form other plugins, runtime = true ...
    -onBeforeAnalyze => desc.runtime = true
        -how to solve this in uikit, when type is known only after map?

-TestMapper

-other languages

-async analysis
    -webpack profile
    -code coverage

-edit code inline

-move package methods up to tree

-move binary to cli package
-move server to server package

-component
    -directives
    -filters
    -etc.
