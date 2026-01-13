/*
 * Copyright (C) 2017 ZeXtras SRL
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

var license = [];
license.push("Copyright (C) " + ((new Date()).getFullYear()) + " ZeXtras SRL");
license.push("");
license.push("This program is free software; you can redistribute it and/or");
license.push("modify it under the terms of the GNU General Public License");
license.push("as published by the Free Software Foundation, version 2 of");
license.push("the License.");
license.push("");
license.push("This program is distributed in the hope that it will be useful,");
license.push("but WITHOUT ANY WARRANTY; without even the implied warranty of");
license.push("MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the");
license.push("GNU General Public License for more details.");
license.push("");
license.push("You should have received a copy of the GNU General Public License.");
license.push("If not, see <http://www.gnu.org/licenses/>.");

var cow = "function Cow() {}\nCow.prototype.moo = function() { console.log('Moo!'); };";

module.exports = {
  entry: {
    com_btactic_drive_open_hdlr: "./src/com_btactic_drive_open_hdlr.ts"
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
    // Banner required to avoid contamination caused by the YUI compressor.
    new BannerPlugin(
      {
        banner: cow,
        raw: true,
        entryOnly: false
      }
    ),
    new BannerPlugin(
      {
        banner: license.join('\n'),
        raw: false,
        entryOnly: false
      }
    )
  ]
};
