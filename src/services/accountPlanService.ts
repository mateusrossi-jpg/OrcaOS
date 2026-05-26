import { accountPlanRepository } from '../repositories/dexieAccountPlanRepository';
import { createGuestAccount, AFERIX_ACCOUNT_CHANGED_EVENT, type AferixAccountState, type GoogleAccountProfile } from '../core/access/accountPlanStorage';
import type { UserPlan } from '../core/access/featureAccess';

export class AccountPlanService {
  async getAccount(): Promise<AferixAccountState> {
    const state = await accountPlanRepository.get();
    if (!state) {
      const guest = createGuestAccount();
      await accountPlanRepository.save(guest);
      return guest;
    }
    return state;
  }

  private emitChanged() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AFERIX_ACCOUNT_CHANGED_EVENT));
    }
  }

  async signInLocalAccount(displayName = 'Profissional local', email = ''): Promise<void> {
    const current = await this.getAccount();
    const next: AferixAccountState = {
      ...current,
      status: 'local',
      userId: current.userId ?? `local-${Date.now()}`,
      displayName: displayName.trim() || 'Profissional local',
      email: email.trim(),
      updatedAt: new Date().toISOString(),
    };
    await accountPlanRepository.save(next);
    this.emitChanged();
  }

  async signInEmailAccount(email: string, displayName = ''): Promise<void> {
    const current = await this.getAccount();
    const next: AferixAccountState = {
      ...current,
      status: 'email',
      userId: `email:${email}`,
      displayName: displayName.trim() || email,
      email: email,
      updatedAt: new Date().toISOString(),
    };
    await accountPlanRepository.save(next);
    this.emitChanged();
  }

  async signInGoogleAccount(profile: GoogleAccountProfile): Promise<void> {
    const current = await this.getAccount();
    const googleEmail = profile.email || '';
    const sameRegisteredEmail = Boolean(current.email && googleEmail && current.email === googleEmail);

    const next: AferixAccountState = {
      ...current,
      status: 'google',
      userId: `google:${profile.sub}`,
      displayName: profile.name?.trim() || (sameRegisteredEmail ? current.displayName : googleEmail) || 'Conta Google',
      email: googleEmail || current.email,
      updatedAt: new Date().toISOString(),
    };
    await accountPlanRepository.save(next);
    this.emitChanged();
  }

  async signOutLocalAccount(): Promise<void> {
    const current = await this.getAccount();
    const next = { ...createGuestAccount('free', 'free'), installationId: current.installationId };
    await accountPlanRepository.save(next);
    this.emitChanged();
  }

  async setLocalUserPlan(plan: UserPlan): Promise<void> {
    const current = await this.getAccount();
    const next: AferixAccountState = {
      ...current,
      plan,
      planSource: plan === 'pro' ? 'local-test' : 'free',
      planStatus: plan === 'pro' ? 'active' : 'free',
      planExpiresAt: null,
      updatedAt: new Date().toISOString(),
    };
    await accountPlanRepository.save(next);
    this.emitChanged();
  }

  async saveAccount(account: AferixAccountState): Promise<void> {
    await accountPlanRepository.save(account);
    this.emitChanged();
  }
}

export const accountPlanService = new AccountPlanService();
