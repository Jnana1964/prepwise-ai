import { Op } from 'sequelize';
import { Company } from '../models/index.js';

export async function searchCompanies(req, res) {
  const q = (req.query.q || '').trim();
  const where = q ? { name: { [Op.like]: `%${q}%` } } : {};
  const companies = await Company.findAll({ where, order: [['name', 'ASC']], limit: 20 });
  res.json({
    companies: companies.map((c) => ({
      id: c.id,
      name: c.name,
      industry: c.industry,
      logoInitial: c.logoInitial,
      assessmentPattern: c.assessmentPattern
    }))
  });
}
