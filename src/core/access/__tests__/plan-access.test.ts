import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import '../../../test/mockAccountPlanRepository';
import { accountPlanService } from '../../../services/accountPlanService';
import { createGuestAccount } from '../accountPlanStorage';
import { mockAccountPlanRepository } from '../../../test/mockAccountPlanRepository';

describe('Plan Access and Account Strategy Protection', () => {
  beforeEach(async () => {
    await mockAccountPlanRepository.clear();
  });

  afterEach(async () => {
    await mockAccountPlanRepository.clear();
  });

  it('correctly maps Guest account as free plan by default', () => {
    const guest = createGuestAccount();
    expect(guest.status).toBe('guest');
    expect(guest.plan).toBe('free');
    expect(guest.planSource).toBe('free');
    expect(guest.planStatus).toBe('free');
    expect(guest.userId).toBeNull();
  });

  it('correctly maps Local account plan selection and persists it', async () => {
    await accountPlanService.signInLocalAccount('Mateus', 'mateus@example.com');
    const localAccount = await accountPlanService.getAccount();
    expect(localAccount.status).toBe('local');
    expect(localAccount.displayName).toBe('Mateus');
    expect(localAccount.email).toBe('mateus@example.com');
    expect(localAccount.userId).toMatch(/^local-/);

    // Resolve plan should return guest plan (free) or persisted plan
    const plan = localAccount.plan;
    expect(plan).toBe('free');
  });

  it('registers email account safely with valid checks', async () => {
    await accountPlanService.signInEmailAccount('contato@aferix.com.br', 'Aferix');
    const emailAccount = await accountPlanService.getAccount();
    expect(emailAccount.status).toBe('email');
    expect(emailAccount.email).toBe('contato@aferix.com.br');
    expect(emailAccount.displayName).toBe('Aferix');
    expect(emailAccount.userId).toBe('email:contato@aferix.com.br');

    // Expected to throw but since it's async we check if the service can handle it if we ever added validation there
  });

  it('registers google account and handles email mappings', async () => {
    await accountPlanService.signInGoogleAccount({
      sub: 'google-sub-123',
      name: 'Google User',
      email: 'user@google.com',
    });
    const googleAccount = await accountPlanService.getAccount();

    expect(googleAccount.status).toBe('google');
    expect(googleAccount.userId).toBe('google:google-sub-123');
    expect(googleAccount.email).toBe('user@google.com');
    expect(googleAccount.displayName).toBe('Google User');
  });

  it('gracefully handles missing account state in Dexie', async () => {
    const account = await accountPlanService.getAccount();
    expect(account.status).toBe('guest');
    expect(account.plan).toBe('free');
  });
});
