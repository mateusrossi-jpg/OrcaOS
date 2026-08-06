import { customerRepository } from '../repositories/CustomerRepository';
import type { Customer } from '../database/schema';
import { processOutbox } from '../database/syncEngine';
import { db } from '../database/db'; // Will be removed when all modules migrate

export class CustomerService {
  async getAllCustomers(): Promise<Customer[]> {
    return customerRepository.getAll();
  }

  async getCustomersListVM(): Promise<Customer[]> {
    // For now, sorting happens via Dexie or in memory if Dexie lacks index,
    // but we abstract it here so the UI doesn't know.
    const customers = await customerRepository.getAll();
    return customers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  async saveCustomer(data: {
    id?: string;
    name: string;
    phone: string;

    is_vip: boolean;
    total_ltv: number;
    created_at?: string;
  }): Promise<void> {
    if (data.id) {
      await customerRepository.update(data.id, {
        name: data.name,
        phone: data.phone,

        is_vip: data.is_vip,
        total_ltv: data.total_ltv
      });
    } else {
      await customerRepository.create({
        name: data.name,
        phone: data.phone,

        is_vip: data.is_vip,
        total_ltv: data.total_ltv,
        created_at: data.created_at || new Date().toISOString()
      });
    }
    processOutbox().catch(() => {});
  }

  // FastService needs this
  async findOrCreateByName(name: string, phone: string, address: string): Promise<Customer> {
    const customers = await customerRepository.getAll();
    let customer = customers.find(c => c.name.toLowerCase() === name.trim().toLowerCase());

    if (!customer) {
      customer = await customerRepository.create({
        name: name.trim(),
        phone: phone.trim(),
        is_vip: false,
        total_ltv: 0,
        created_at: new Date().toISOString()
      });
      processOutbox().catch(() => {});
    } else if (phone || address) {
      let updated = false;
      const updates: any = {};
      if (phone && !customer.phone) { updates.phone = phone; updated = true; }

      if (updated) {
        await customerRepository.update(customer.id, updates);
        customer = { ...customer, ...updates };
        processOutbox().catch(() => {});
      }
    }

    return customer!;
  }
}

export const customerService = new CustomerService();
