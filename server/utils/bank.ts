import {
  getBankCustomer,
  setBankCustomerId,
  type BankCustomerRow,
} from './db'
import { bridgeRequest, type KycLink } from './bridge'

export interface BankStatus {
  customerType: string
  kycStatus: string
  tosStatus: string
  kycLink: string
  tosLink: string
  customerId: string
  approved: boolean
}

/** Asks Bridge for the latest verification state of a saved customer. */
export async function refreshBankStatus(
  row: BankCustomerRow,
): Promise<BankStatus> {
  const link = await bridgeRequest<KycLink>(
    `/kyc_links/${encodeURIComponent(row.kyc_link_id)}`,
  )
  const customerId = link.customer_id || row.customer_id || ''
  if (customerId && customerId !== row.customer_id) {
    await setBankCustomerId(row.user_id, customerId)
  }
  const kycStatus = link.kyc_status || 'not_started'
  const tosStatus = link.tos_status || 'pending'
  return {
    customerType: row.customer_type,
    kycStatus,
    tosStatus,
    kycLink: link.kyc_link || '',
    tosLink: link.tos_link || '',
    customerId,
    approved: kycStatus === 'approved' && tosStatus === 'approved' && !!customerId,
  }
}

export async function requireApprovedCustomer(
  userId: string,
): Promise<{ row: BankCustomerRow; status: BankStatus }> {
  const row = await getBankCustomer(userId)
  if (!row) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Verify your identity first',
    })
  }
  const status = await refreshBankStatus(row)
  if (!status.approved) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Your verification is not approved yet',
    })
  }
  return { row, status }
}
