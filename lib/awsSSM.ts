import { SSM } from 'aws-sdk';
// AWS.config.update({ region: "us-west-1" });

const ssm: SSM = new SSM();

async function getSSMParameters(parameters: string[]): Promise<string[]> {
    return ssm
    .getParameters({
        Names: parameters,
    })
    .promise()
    .then(res => res.Parameters!.map(e => e.Value!))
    .catch(err => {
        throw new Error("TODO ERROR");
    });
}

export { getSSMParameters }
