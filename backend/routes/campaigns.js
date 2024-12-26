const router = require('express').Router();
const Campaign = require('../models/Campaign');
const auth = require('../middleware/auth');

// Create a new campaign
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, budget, startDate, endDate, status } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const campaign = new Campaign({
      name,
      description,
      budget: parseFloat(budget),
      startDate: start,
      endDate: end,
      status,
      userId: req.userId // From auth middleware
    });

    const savedCampaign = await campaign.save();
    res.status(201).json(savedCampaign);
  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all campaigns for a user
router.get('/', auth, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    console.error('Campaign fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific campaign
router.get('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a campaign
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, budget, startDate, endDate, status } = req.body;
    
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Update fields
    campaign.name = name || campaign.name;
    campaign.description = description || campaign.description;
    campaign.budget = budget || campaign.budget;
    campaign.startDate = startDate || campaign.startDate;
    campaign.endDate = endDate || campaign.endDate;
    campaign.status = status || campaign.status;

    const updatedCampaign = await campaign.save();
    res.json(updatedCampaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a campaign
router.delete('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 