const common = {
    port: 3000,
}

const environments = {
    dev: {
        ...common,
    },

    prod: {
        ...common,
    },
}

export const config = environments[process.env.NODE_ENV || 'dev']