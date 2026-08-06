import { db } from '../database/db';
import type { Customer } from '../database/schema';
import { createId } from '../../app/utils/idHelpers';

export class CustomerRepository {
  async getAll(): Promise<Customer[]> {
    return db.customers
      .orderBy('name')
      .toArray()
      .catch(() => db.customers.toArray()); // fallback
  }

  async getById(id: string): Promise<Customer | undefined> {
    return db.customers.get(id);
  }

  async create(payload: Omit<Customer, 'id'>): Promise<Customer> {
    const customer = {
      ...payload,
      id: createId('customer')
    } as Customer;

    await db.transaction('rw', [db.customers, db.sync_outbox], async () => {
      await db.customers.add(customer);
      await db.sync_outbox.add({
        uuid: customer.id,
        table_name: 'customers',
        operation: 'INSERT',
        payload: customer,
        created_at: Date.now(),
      });
    });

    return customer;
  }

  async update(id: string, payload: Partial<Omit<Customer, 'id'>>): Promise<void> {
    await db.transaction('rw', [db.customers, db.sync_outbox], async () => {
      await db.customers.update(id, payload);

      const updatedCustomer = await db.customers.get(id);
      if (updatedCustomer) {
        await db.sync_outbox.add({
          uuid: id,
          table_name: 'customers',
          operation: 'UPDATE',
          payload: updatedCustomer,
          created_at: Date.now(),
        });
      }
    });
  }
}

export const customerRepository = new CustomerRepository();
