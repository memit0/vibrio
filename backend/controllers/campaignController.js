const { Op } = require('sequelize');
const { Campaign } = require('../models');

const getCampaigns = async (req, res) => {
  try {
    const { 
      search,
      status,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const whereClause = {};
    
    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    if (status) {
      whereClause.status = status;
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt[Op.lte] = new Date(dateTo);
      }
    }

    const campaigns = await Campaign.findAll({
      where: whereClause,
      order: [[sortBy, sortOrder]]
    });

    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Error fetching campaigns' });
  }
};

module.exports = {
  getCampaigns
};