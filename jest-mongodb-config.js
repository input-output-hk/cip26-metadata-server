module.exports = {
    mongodbMemoryServerOptions: {
        binary: {
            version: '4.2.1',
            skipMD5: true,
        },
        instance: {
            dbName: 'dapp',
        },
        autoStart: false,
    },
};