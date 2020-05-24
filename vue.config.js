const ImageminPlugin = require('imagemin-webpack-plugin').default

module.exports = {
    configureWebpack: {
        plugins: [
            // Make sure that the plugin is after any plugins that add images
            new ImageminPlugin({
                disable: process.env.NODE_ENV !== 'production', // Disable during development
                pngquant: {
                    quality: '95-100'
                }
            })
        ]
    }
}