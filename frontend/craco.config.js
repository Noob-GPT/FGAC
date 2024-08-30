const path = require('path');

module.exports = {
    webpack: {
        alias: {
            '@components': path.resolve(__dirname, 'src/components'),
            '@hooks': path.resolve(__dirname, 'src/hooks'),
            '@layout': path.resolve(__dirname, 'src/layout'),
            '@pages': path.resolve(__dirname, 'src/pages'),
            '@routes': path.resolve(__dirname, 'src/routes'),
        }
    }
};