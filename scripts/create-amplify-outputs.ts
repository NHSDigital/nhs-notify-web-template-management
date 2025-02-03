import path from 'node:path';
import { BackendConfigHelper, type BackendConfig } from 'nhs-notify-web-template-management-util-backend-config';

const inputType = process.argv[2];

let config: BackendConfig;

if (inputType === 'file') {
  config = BackendConfigHelper.fromTerraformOutputsFile(path.resolve(__dirname, '..', 'sandbox_tf_outputs.json'))

} else if (inputType === 'env') {
  config = BackendConfigHelper.fromEnv()
} else {
  throw new Error('Unexpected input type');
}

BackendConfigHelper.toAmplifyOutputs(config, path.resolve(__dirname, '..', 'frontend', 'amplify_outputs.json'))
