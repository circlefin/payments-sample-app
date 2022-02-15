import { getSSMParameters } from '@/lib/awsSSM'

const merchantIdentityCertificate: string = "/stg/platform/sampleapp/applepay/merchantIdentityCertificate/pem"
const merchantIdentityKey: string = "/stg/platform/sampleapp/applepay/merchantIdentityCertificate/pem"

async function getApplePayCertAndKey(retry: boolean): Promise<[string, string]> {
    let a = await getSSMParameters([merchantIdentityCertificate, merchantIdentityKey]);
    return [a[0], a[1]]
}

export { getApplePayCertAndKey }