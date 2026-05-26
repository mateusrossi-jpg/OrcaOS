import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import '../test/mockAccountPlanRepository'; // MUST BE IMPORTED BEFORE SERVICE
import { accountPlanService } from './accountPlanService';
import { mockAccountPlanRepository } from '../test/mockAccountPlanRepository';

describe('accountPlanService', () => {
  beforeEach(async () => {
    await mockAccountPlanRepository.clear();
  });

  afterEach(async () => {
    await mockAccountPlanRepository.clear();
  });

  it('starts as a free guest account', async () => {
    const account = await accountPlanService.getAccount();

    expect(account.status).toBe('guest');
    expect(account.installationId).toMatch(/^install-/);
    expect(account.plan).toBe('free');
    expect(account.planStatus).toBe('free');
  });

  it('creates a local account without changing the current plan', async () => {
    await accountPlanService.signInLocalAccount('Profissional', 'profissional@example.com');
    const account = await accountPlanService.getAccount();

    expect(account.status).toBe('local');
    expect(account.displayName).toBe('Profissional');
    expect(account.email).toBe('profissional@example.com');
    expect(account.installationId).toMatch(/^install-/);
    expect(account.plan).toBe('free');
  });

  it('registers an account with email', async () => {
    await accountPlanService.signInEmailAccount('profissional@example.com', 'Profissional');
    const account = await accountPlanService.getAccount();

    expect(account.status).toBe('email');
    expect(account.userId).toBe('email:profissional@example.com');
    expect(account.email).toBe('profissional@example.com');
    expect(account.displayName).toBe('Profissional');
    expect(account.installationId).toMatch(/^install-/);
  });

  it('keeps the same installation id when linking email, Google and signing out', async () => {
    const guest = await accountPlanService.getAccount();
    
    await accountPlanService.signInEmailAccount('profissional@example.com', 'Profissional');
    const emailAccount = await accountPlanService.getAccount();
    
    await accountPlanService.signInGoogleAccount({ sub: '123', name: 'Conta Google', email: 'profissional@example.com' });
    const googleAccount = await accountPlanService.getAccount();
    
    await accountPlanService.signOutLocalAccount();
    const signedOut = await accountPlanService.getAccount();

    expect(emailAccount.installationId).toBe(guest.installationId);
    expect(googleAccount.installationId).toBe(guest.installationId);
    expect(signedOut.installationId).toBe(guest.installationId);
  });

  it('stores a Google account without changing the current plan', async () => {
    await accountPlanService.signInGoogleAccount({ sub: '123', name: 'Profissional Técnico', email: 'profissional@example.com' });
    const account = await accountPlanService.getAccount();

    expect(account.status).toBe('google');
    expect(account.userId).toBe('google:123');
    expect(account.displayName).toBe('Profissional Técnico');
    expect(account.email).toBe('profissional@example.com');
    expect(account.plan).toBe('free');
  });

  it('links Google identity to the registered email when they match', async () => {
    await accountPlanService.signInEmailAccount('profissional@example.com', 'Profissional');
    await accountPlanService.signInGoogleAccount({ sub: '123', name: 'Conta Google', email: 'profissional@example.com' });
    const account = await accountPlanService.getAccount();

    expect(account.status).toBe('google');
    expect(account.userId).toBe('google:123');
    expect(account.email).toBe('profissional@example.com');
    expect(account.displayName).toBe('Conta Google');
  });

  it('can switch the local test plan to pro and back to free', async () => {
    await accountPlanService.setLocalUserPlan('pro');
    
    let account = await accountPlanService.getAccount();
    expect(account.plan).toBe('pro');
    expect(account.planSource).toBe('local-test');
    expect(account.planStatus).toBe('active');

    await accountPlanService.setLocalUserPlan('free');
    
    account = await accountPlanService.getAccount();
    expect(account.plan).toBe('free');
    expect(account.planSource).toBe('free');
    expect(account.planStatus).toBe('free');
  });

  it('signs out to a free guest account', async () => {
    await accountPlanService.signInLocalAccount();
    await accountPlanService.setLocalUserPlan('pro');

    await accountPlanService.signOutLocalAccount();
    const account = await accountPlanService.getAccount();

    expect(account.status).toBe('guest');
    expect(account.plan).toBe('free');
  });
});
