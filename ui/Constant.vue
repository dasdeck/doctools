<template>
    <div>
        <h1>{{data.name}}</h1>
        <p>
            {{data.description}}
        </p>
    </div>
</template>

<script>

/**
 * document layout for constants
 */
export default {
    props: {
        /**
         * the descriptor jsodc for this constant
         */
        data: Object
    }
}
</script>

