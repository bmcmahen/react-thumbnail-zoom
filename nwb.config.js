module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'ReactImageZoom',
      externals: {
        react: 'React'
      }
    }
  }
}
