# sshdp

I write this package because I want to deploy my release build easily, without shell script. It is written with new standard and focus on simplicity. There is a lack of features and only ESM module is supported.

If you need CommonJS or more features, see [ssh-release-deploy](https://github.com/la-haute-societe/ssh-deploy-release).

## 📦 Install

Just use your prefered package manager, I recommend [ni](https://github.com/antfu/ni):

```bash
npm i -D sshdp
```

## 📖 Usage

Create a config file, say  `sshdp.conf.ts` (or `js`):

```ts
// provide intellisense
import { defineConfig } from 'sshdp'

export default defineConfig({
  host: 'hostname',
  password: 'yourpassword',
  // or use privateKey instead
  // keyFile: '',
  deployPath: '/path/to/www',
  releasesFolder: '.releases', // relative to the parent dir of deployPath
})
```

then run:

```bash
npm run sshdp dist -c sshdp.conf.ts
```

or add it to your package.json:

```json
{
  "scripts": {
    "deploy": "sshdp dist -c sshdp.conf.ts"
  }
}
```

and run:

```bash
npm run deploy
```

This should deploy you build folder under `releasesFolder` and create a symlink at `deployPath` to it.

## ⚙️ Config options

See [config.ts](https://github.com/pbnoyz/sshdp/blob/main/src/config.ts)

## 📄 License

[MIT](https://github.com/pbnoyz/sshdp/blob/main/LICENSE)
