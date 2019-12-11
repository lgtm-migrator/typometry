module.exports = {
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "awesome-typescript-loader"
        }
      },
      {
	test: /\.css$/,
	use: [ 'style-loader', 'css-loader' ]
      }
    ]
  },
  devtool: "source-map"
};
