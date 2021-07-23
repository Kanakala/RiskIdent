import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { Configuration } from 'webpack';
import { yamlParse } from 'yaml-cfn';
import * as walkSync from 'walk-sync';

/** Interface for AWS SAM Function */
interface ISamFunction {
  Type: string;
  Properties: {
    AssumeRolePolicyDocument?: JSON;
    AutoPublishAlias?: string;
    AutoPublishCodeSha256?: string;
    CodeUri?: string;
    Description?: string;
    Environment?: {
      Variables: {
        [key: string]: string;
      };
    };
    Events?: EventSource;
    FunctionName?: string;
    Handler: string;
    Layers?: { [Ref: string]: string }[];
    Runtime: string;
    Timeout?: number;
    Tracing?: string;
    VersionDescription?: string;
  };
}

// Where my function source lives
const handlerPath = './src/handlers';

const templates = walkSync(join(__dirname, 'cloudformation/handlers'));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AllEnteries: any[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
templates.forEach((fl: any) => {
  const { Globals, Resources } = yamlParse(readFileSync(join(__dirname, `cloudformation/handlers/${fl}`), 'utf-8'));
  const GlobalFunction = Globals?.Function ?? {};
  if (Resources) {
    const entries = Object.values(Resources)
      .filter((resource: ISamFunction) => resource.Type === 'AWS::Serverless::Function')
      .filter((resource: ISamFunction) => (resource.Properties?.Runtime ?? GlobalFunction.Runtime).startsWith('nodejs'))
      .map((resource: ISamFunction) => ({
        filename: resource.Properties.Handler.split('.')[0],
        entryPath: resource.Properties.CodeUri.split('/').join('/'),
        name: resource.Properties.CodeUri.split('/').pop(),
      }))
      .reduce(
        (resources, resource) =>
          Object.assign(resources, {
            [`${resource.filename}`]: `${handlerPath}/${resource.filename}.ts`,
          }),
        {},
      );

    AllEnteries.push(entries);
  }
});

const webpackEnteries = Object.assign({}, ...AllEnteries);

const config: Configuration = {
  entry: webpackEnteries,
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: resolve(__dirname, 'build'),
    sourceMapFilename: '[file].map',
  },
  mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader' },
      {
        type: 'javascript/auto',
        test: /data\.json$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: './[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.json'],
  },
  target: 'node',
  externals: ['aws-sdk'],
  optimization: {
    // We no not want to minimize our code.
    minimize: false,
  },
  performance: {
    // Turn off size warnings for entry points
    hints: false,
  },
};

export default config;
