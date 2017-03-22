/*
 * Copyright (C) 2017 ZeXtras S.r.l.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, version 2 of
 * the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License.
 * If not, see <http://www.gnu.org/licenses/>.
 */

var webpack = require("webpack");
var BannerPlugin = webpack.BannerPlugin;
var path = require("path");

var license =
    "Copyright (C) " + (new Date()).getYear() + " ZeXtras S.r.l.\n" +
    "\n" +
    "This program is free software; you can redistribute it and/or\n" +
    "modify it under the terms of the GNU General Public License\n" +
    "as published by the Free Software Foundation, version 2 of\n" +
    "the License.\n" +
    "\n" +
    "This program is distributed in the hope that it will be useful,\n" +
    "but WITHOUT ANY WARRANTY; without even the implied warranty of\n" +
    "MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n" +
    "GNU General Public License for more details.\n" +
    "\n" +
    "You should have received a copy of the GNU General Public License.\n" +
    "If not, see <http://www.gnu.org/licenses/>.\n"
  ;

module.exports = {
  entry: {
    com_zextras_drive_open_hdlr: "./src/com_zextras_drive_open_hdlr.ts"
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: '[name].js'
  },
  resolve: {
    extensions: [".js", ".ts"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [
          path.resolve(__dirname, "src/zimbra")
        ],
        loader: "awesome-typescript-loader"
      }
    ]
  },
  plugins: [
    new BannerPlugin(
      {
        banner: license,
        raw: false,
        entryOnly: false
      }
    )
  ]
};
