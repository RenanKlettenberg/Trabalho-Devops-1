export default {
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
        '!src/tests/**',
    ],
    coveragePathIgnorePatterns: ['/node_modules/'],
};
