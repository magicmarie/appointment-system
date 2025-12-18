const { FlatCompat } = require('@eslint/eslintrc');
const compat = new FlatCompat({ baseDirectory: __dirname, recommendedConfig: true });

module.exports = [...compat.extends('./.eslintrc.cjs')];
