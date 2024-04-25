import { defineConfig } from '@flatjs/forge';

export default defineConfig({
  input: 'src/index.ts',
  dts: {
    compilationOptions: {
      followSymlinks: true,
      preferredConfigPath: './tsconfig.json',
    },
  },
  output: {
    format: 'esm',
  },
});
