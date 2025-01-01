const router = require('express').Router();
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const auth = require('../middleware/auth');
const axios = require('axios');

// Create a new campaign
router.post('/', auth, async (req, res) => {
  try {
    // Log the entire request body to see what's being received
    console.log('Received campaign data:', req.body);
    
    const { name, description, budget, startDate, endDate, status, targetUrl } = req.body;
    
    // Log individual fields
    console.log('Target URL received:', targetUrl);

    // Validate targetUrl is present
    if (!targetUrl) {
      return res.status(400).json({ message: 'Target URL is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const campaignData = {
      name,
      description,
      budget: parseFloat(budget),
      startDate,
      endDate,
      status,
      targetUrl,
      createdBy: {
        userId: user._id,
        name: user.name,
        role: user.role
      }
    };

    // Log the final campaign data before saving
    console.log('Attempting to save campaign with data:', campaignData);

    const campaign = new Campaign(campaignData);
    const savedCampaign = await campaign.save();
    
    // Log the saved campaign
    console.log('Saved campaign:', savedCampaign);
    
    res.status(201).json(savedCampaign);
  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all campaigns
router.get('/', auth, async (req, res) => {
  try {
    const campaigns = await Campaign.find()
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

// Generate affiliate link for a campaign
router.post('/:campaignId/affiliate-link', auth, async (req, res) => {
  try {
    // Check if user is an influencer
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'influencer') {
      return res.status(403).json({ message: 'Only influencers can generate affiliate links' });
    }

    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Generate a unique affiliate link
    const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const affiliateLink = `http://ourdomain.com/ref/${uniqueCode}`;

    // Here you might want to store the affiliate link in your database
    // For now, we're just returning it
    
    res.json({ affiliateLink });
  } catch (error) {
    console.error('Error generating affiliate link:', error);
    res.status(500).json({ message: 'Error generating affiliate link' });
  }
});

// Save tracking link for a campaign
router.post('/:campaignId/tracking-link', auth, async (req, res) => {
  try {
    const { shortLink } = req.body;
    const influencerId = req.userId;

    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if influencer already has a tracking link for this campaign
    const existingLink = campaign.trackingLinks.find(
      link => link.influencerId.toString() === influencerId
    );

    if (existingLink) {
      existingLink.shortLink = shortLink;
      existingLink.createdAt = Date.now();
    } else {
      campaign.trackingLinks.push({
        shortLink,
        influencerId,
        createdAt: Date.now()
      });
    }

    await campaign.save();
    res.json({ message: 'Tracking link saved successfully', campaign });
  } catch (error) {
    console.error('Error saving tracking link:', error);
    res.status(500).json({ message: 'Error saving tracking link' });
  }
});

// Add this new endpoint
router.post('/:campaignId/generate-bitly', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (!campaign.targetUrl) {
      return res.status(400).json({ message: 'Campaign does not have a target URL' });
    }

    // Add logging to debug
    console.log('Attempting to shorten URL:', campaign.targetUrl);

    // Generate Bitly link
    const bitlyResponse = await axios.post(
      'https://api-ssl.bitly.com/v4/shorten',
      {
        group_guid: process.env.BITLY_GROUP_ID,
        domain: "bit.ly",
        long_url: campaign.targetUrl
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.BITLY_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const shortLink = bitlyResponse.data.link;
    
    // Save the link to the campaign
    campaign.trackingLinks.push({
      shortLink,
      influencerId: req.userId,
      createdAt: Date.now()
    });

    await campaign.save();
    res.json({ shortLink });
  } catch (error) {
    console.error('Error details:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Error generating tracking link',
      details: error.response?.data || error.message 
    });
  }
});

module.exports = router; 