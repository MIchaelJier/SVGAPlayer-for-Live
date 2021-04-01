// rollup.config.js
import { liveServer } from 'rollup-plugin-live-server'
import typescript from 'rollup-plugin-typescript2'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import babel from '@rollup/plugin-babel'

const extensions = ['.js', '.jsx', '.ts', '.tsx']

const plugins = [
  terser({
    compress: {
      ecma: 2015,
      pure_getters: true,
    },
  }),
]

export default {
  input: 'lib/index.ts',
  output: [
    {
      name: 'SVGAPlayer',
      file: 'dist/SVGAPlayer.min.js',
      format: 'iife', // umd cjs es iife
      exports: 'auto',
      // sourcemap: true,
      plugins,
    },
    {
      name: 'SVGAPlayer',
      file: 'dist/SVGAPlayer.cjs.js',
      format: 'cjs',
      plugins,
    },
    {
      name: 'SVGAPlayer',
      file: 'dist/SVGAPlayer.esm.js',
      format: 'esm',
      plugins,
    },
    {
      name: 'SVGAPlayer',
      file: 'dist/SVGAPlayer.umd.js',
      format: 'umd',
      plugins,
    },
  ],
  plugins: [
    resolve(),
    commonjs({
      include: 'node_modules/**',
    }),
    typescript({
      tsconfig: 'tsconfig.json',
    }),
    babel({
      exclude: 'node_modules/**',
      extensions,
    }),
    // liveServer({
    //   port: 8090,
    //   host: '0.0.0.0',
    //   root: 'example',
    //   file: 'index.html',
    //   mount: [['/dist/wsHeartbeat.min.js', './dist/wsHeartbeat.min.js']],
    //   open: false,
    //   wait: 500,
    // }),
  ],
}
