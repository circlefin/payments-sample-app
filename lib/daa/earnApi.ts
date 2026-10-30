import { daaInstance, nullIfEmpty } from './client'
import { hasDeviceKey, signOwnerRequest } from './deviceSigner'

export interface EarnSource {
  id: string
  type: string
}

export interface EarnDepositPayload {
  idempotencyKey: string
  source: EarnSource
  vaultAddress: string
  amount: string
}

export interface EarnWithdrawalPayload {
  idempotencyKey: string
  source: EarnSource
  vaultAddress: string
  amount: string
}

export interface EarnClaimPayload {
  idempotencyKey: string
  source: EarnSource
}

export interface EarnQuotePayload {
  source: EarnSource
  vaultAddress: string
  amount: string
}

export interface EarnSourceOnlyPayload {
  source: EarnSource
}

const EARN_PATH = '/v1/accounts/earn'

/** Returns the shared DAA axios instance */
function getInstance() {
  return daaInstance
}

/**
 * Posts an Owner-authorized write. With a device key loaded the body is signed
 * and sent as the exact string that was hashed; otherwise it is sent unsigned.
 */
async function postOwnerAuthorized(
  route: string,
  discriminator: string,
  payload: { idempotencyKey: string },
) {
  const path = `${EARN_PATH}/${route}`
  if (!hasDeviceKey()) {
    return daaInstance.post(path, payload)
  }
  const signed = await signOwnerRequest('POST', path, discriminator, payload)
  return daaInstance.post(path, signed.body, {
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Authorization': signed.deviceAuthorization,
    },
    transformRequest: [(data) => data],
  })
}

function listParams(
  accountId: string,
  status: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string,
) {
  return {
    accountId: nullIfEmpty(accountId),
    status: nullIfEmpty(status),
    from: nullIfEmpty(from),
    to: nullIfEmpty(to),
    pageBefore: nullIfEmpty(pageBefore),
    pageAfter: nullIfEmpty(pageAfter),
    pageSize: nullIfEmpty(pageSize),
  }
}

/**
 * Get Vaults
 */
function getVaults(
  minApy: string,
  minTvl: string,
  sortBy: string,
  pageSize: string,
  page: string,
) {
  const params = {
    minApy: nullIfEmpty(minApy),
    minTvl: nullIfEmpty(minTvl),
    sortBy: nullIfEmpty(sortBy),
    pageSize: nullIfEmpty(pageSize),
    page: nullIfEmpty(page),
  }
  return daaInstance.get(`${EARN_PATH}/vaults`, { params })
}

/**
 * Get Positions
 */
function getPositions(payload: EarnSourceOnlyPayload) {
  return daaInstance.post(`${EARN_PATH}/positions`, payload)
}

/**
 * Deposit quote
 */
function getDepositQuote(payload: EarnQuotePayload) {
  return daaInstance.post(`${EARN_PATH}/deposits/quote`, payload)
}

/**
 * Create Deposit
 */
function createDeposit(payload: EarnDepositPayload) {
  return postOwnerAuthorized('deposits', 'earn_deposit', payload)
}

/**
 * Get Deposits
 */
function getDeposits(
  accountId: string,
  status: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string,
) {
  const params = listParams(
    accountId,
    status,
    from,
    to,
    pageBefore,
    pageAfter,
    pageSize,
  )
  return daaInstance.get(`${EARN_PATH}/deposits`, { params })
}

/**
 * Get Deposit by id
 */
function getDepositById(depositId: string) {
  return daaInstance.get(`${EARN_PATH}/deposits/${depositId}`)
}

/**
 * Withdrawal quote
 */
function getWithdrawalQuote(payload: EarnQuotePayload) {
  return daaInstance.post(`${EARN_PATH}/withdrawals/quote`, payload)
}

/**
 * Create Withdrawal
 */
function createWithdrawal(payload: EarnWithdrawalPayload) {
  return postOwnerAuthorized('withdrawals', 'earn_withdrawal', payload)
}

/**
 * Get Withdrawals
 */
function getWithdrawals(
  accountId: string,
  status: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string,
) {
  const params = listParams(
    accountId,
    status,
    from,
    to,
    pageBefore,
    pageAfter,
    pageSize,
  )
  return daaInstance.get(`${EARN_PATH}/withdrawals`, { params })
}

/**
 * Get Withdrawal by id
 */
function getWithdrawalById(withdrawalId: string) {
  return daaInstance.get(`${EARN_PATH}/withdrawals/${withdrawalId}`)
}

/**
 * Reward claim quote
 */
function getClaimQuote(payload: EarnSourceOnlyPayload) {
  return daaInstance.post(`${EARN_PATH}/rewards/claims/quote`, payload)
}

/**
 * Create reward Claim
 */
function createClaim(payload: EarnClaimPayload) {
  return postOwnerAuthorized('rewards/claims', 'earn_claim', payload)
}

/**
 * Get reward Claims
 */
function getClaims(
  accountId: string,
  status: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string,
) {
  const params = listParams(
    accountId,
    status,
    from,
    to,
    pageBefore,
    pageAfter,
    pageSize,
  )
  return daaInstance.get(`${EARN_PATH}/rewards/claims`, { params })
}

/**
 * Get reward Claim by id
 */
function getClaimById(claimId: string) {
  return daaInstance.get(`${EARN_PATH}/rewards/claims/${claimId}`)
}

export default {
  getInstance,
  getVaults,
  getPositions,
  getDepositQuote,
  createDeposit,
  getDeposits,
  getDepositById,
  getWithdrawalQuote,
  createWithdrawal,
  getWithdrawals,
  getWithdrawalById,
  getClaimQuote,
  createClaim,
  getClaims,
  getClaimById,
}
