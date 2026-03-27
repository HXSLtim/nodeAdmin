import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);
  private readonly pool: Pool | null;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL?.trim();
    if (!databaseUrl) {
      this.pool = null;
    } else {
      this.pool = new Pool({ connectionString: databaseUrl, max: 10 });
    }
  }

  async list() {
    if (!this.pool) return [];
    const result = await this.pool.query(
      'SELECT id, name, slug, logo, is_active, config_json, created_at, updated_at FROM tenants ORDER BY created_at'
    );
    return result.rows;
  }

  async findById(id: string) {
    if (!this.pool) throw new NotFoundException('Tenant not found');
    const result = await this.pool.query(
      'SELECT id, name, slug, logo, is_active, config_json, created_at, updated_at FROM tenants WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) throw new NotFoundException('Tenant not found');
    return result.rows[0];
  }

  async create(data: { name: string; slug: string; logo?: string; isActive?: boolean }) {
    if (!this.pool) throw new Error('Database not available');

    const existing = await this.pool.query('SELECT id FROM tenants WHERE slug = $1', [data.slug]);
    if (existing.rows.length > 0) throw new ConflictException('Tenant slug already exists');

    const id = randomUUID();
    await this.pool.query(
      'INSERT INTO tenants (id, name, slug, logo, is_active, config_json) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, data.name, data.slug, data.logo ?? null, data.isActive !== false, '{}']
    );
    return this.findById(id);
  }

  async update(id: string, data: { name?: string; logo?: string; isActive?: boolean }) {
    if (!this.pool) throw new Error('Database not available');

    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (data.name !== undefined) { sets.push(`name = $${++idx}`); params.push(data.name); }
    if (data.logo !== undefined) { sets.push(`logo = $${++idx}`); params.push(data.logo); }
    if (data.isActive !== undefined) { sets.push(`is_active = $${++idx}`); params.push(data.isActive); }

    if (sets.length === 0) return this.findById(id);

    sets.push(`updated_at = now()`);
    params.push(id);
    const result = await this.pool.query(
      `UPDATE tenants SET ${sets.join(', ')} WHERE id = $${idx + 1} RETURNING id`,
      params
    );
    if (result.rows.length === 0) throw new NotFoundException('Tenant not found');
    return this.findById(id);
  }

  async remove(id: string) {
    if (!this.pool) throw new Error('Database not available');
    if (id === 'default') throw new ConflictException('Cannot delete the default tenant');
    const result = await this.pool.query('DELETE FROM tenants WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) throw new NotFoundException('Tenant not found');
  }
}
