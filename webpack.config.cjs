const fs = require('node:fs');
const path = require('node:path');

/** Ensures dist/main.js is treated as CommonJS under root "type": "module". */
class WriteDistPackageJsonPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('WriteDistPackageJsonPlugin', () => {
      const outDir = compiler.options.output.path;
      fs.writeFileSync(
        path.join(outDir, 'package.json'),
        '{"type":"commonjs"}\n',
      );
    });
  }
}

/** Keep native / Prisma packages outside the webpack bundle. */
const NATIVE_EXTERNALS = [
  'argon2',
  'bcrypt',
  '@prisma/client',
  '.prisma/client',
  'bullmq',
  'ioredis',
];

module.exports = function (options) {
  const previousExternals = options.externals;

  return {
    ...options,
    externals: [
      ...(Array.isArray(previousExternals)
        ? previousExternals
        : previousExternals
          ? [previousExternals]
          : []),
      ({ request }, callback) => {
        if (
          request &&
          NATIVE_EXTERNALS.some(
            (name) => request === name || request.startsWith(`${name}/`),
          )
        ) {
          return callback(null, `commonjs ${request}`);
        }
        return callback();
      },
    ],
    plugins: [...(options.plugins ?? []), new WriteDistPackageJsonPlugin()],
  };
};
