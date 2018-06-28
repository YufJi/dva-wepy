const path = require('path')
var prod = process.env.NODE_ENV === 'production'

module.exports = {
  wpyExt: '.wpy',
  eslint: true,
  cliLogs: !prod,
  build: {
    web: {
      htmlTemplate: path.join('src', 'index.template.html'),
      htmlOutput: path.join('web', 'index.html'),
      jsOutput: path.join('web', 'index.js')
    }
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src')
    },
    aliasFields: ['wepy'],
    modules: ['node_modules']
  },
  compilers: {
    less: {
      compress: true
    },
    babel: {
      sourceMap: true,
      presets: [
        'env'
      ],
      plugins: [
        'transform-class-properties',
        'transform-decorators-legacy',
        'transform-object-rest-spread',
        'transform-export-extensions',
        'syntax-export-extensions'
      ]
    }
  },
  plugins: {
    autoprefixer: {
      filter: /\.less$/,
      config: {
        browsers: [
          'Android >= 4.0',
          'ios >= 6',
          'Safari >= 6',
          'Chrome >= 12',
          'ChromeAndroid >= 4.0'
        ]
      }
    },
    imagemin: {
      filter: /\.(jpg|png|jpeg)$/,
      config: {
        jpg: {
          quality: 80
        },
        png: {
          quality: 80
        }
      }
    },
    replace: [
      {
        filter: /\.js$/,
        config: {
          find: /process.env.NODE_ENV/g,
          replace: prod ? "'production'" : "'development'"
        }
      }
    ]
  },
  appConfig: {
    noPromiseAPI: []
  }
}

if (prod) {
  // 压缩less
  module.exports.compilers['less'] = {'compress': true}

  // 压缩js
  module.exports.plugins = {
    replace: [
      {
        filter: /\.js$/,
        config: {
          find: /process.env.NODE_ENV/g,
          replace: prod ? "'production'" : "'development'"
        }
      }
    ],
    uglifyjs: {
      filter: /\.js$/,
      config: {
      }
    },
    imagemin: {
      filter: /\.(jpg|png|jpeg)$/,
      config: {
        jpg: {
          quality: 80
        },
        png: {
          quality: 80
        }
      }
    }
  }
}
