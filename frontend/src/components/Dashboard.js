import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { canCreateCampaign } from '../utils/roleCheck';
import '../styles/Dashboard.css';
import React from 'react';

function Dashboard() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    owner: '',
    status: '',
    showMyCampaigns: false
  });
  const [username, setUsername] = useState('');
  const [bitlyToken, setBitlyToken] = useState('');
  const [copiedLinkId, setCopiedLinkId] = useState(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('userRole');
    const storedUsername = localStorage.getItem('username');
    
    if (!token) {
      navigate('/login');
    } else {
      setUserRole(storedRole);
      setUsername(storedUsername);
      fetchCampaigns();
    }
  }, [navigate]);

  useEffect(() => {
    filterCampaigns();
  }, [campaigns, filters]);

  const filterCampaigns = () => {
    let filtered = [...campaigns];

    // Filter by owner name
    if (filters.owner) {
      filtered = filtered.filter(campaign => 
        campaign.createdBy?.name.toLowerCase().includes(filters.owner.toLowerCase())
      );
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(campaign => {
        const campaignDate = new Date(campaign.startDate);
        const today = new Date();
        
        switch (filters.status) {
          case 'active':
            return campaign.status === 'active';
          case 'upcoming':
            return campaignDate > today;
          case 'completed':
            return campaign.status === 'completed';
          default:
            return true;
        }
      });
    }

    // Filter my campaigns using username
    if (filters.showMyCampaigns) {
      filtered = filtered.filter(campaign => 
        campaign.createdBy?.name === username
      );
    }

    setFilteredCampaigns(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        'http://localhost:5001/api/campaigns',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCampaigns(response.data);
      setFilteredCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const handleCreateCampaign = () => {
    navigate('/create-campaign');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      draft: 'status-draft',
      active: 'status-active',
      paused: 'status-paused',
      completed: 'status-completed'
    };
    return `status-badge ${statusClasses[status] || ''}`;
  };

  const handleGenerateLink = async (campaign) => {
    try {
      const response = await axios.post(
        `http://localhost:5001/api/campaigns/${campaign._id}/generate-bitly`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        }
      );
      
      // Refresh campaigns to show new link
      fetchCampaigns();
    } catch (error) {
      console.error('Error generating tracking link:', error);
      setError('Failed to generate tracking link');
    }
  };

  const copyToClipboard = async (text, linkId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLinkId(linkId);
      setTimeout(() => setCopiedLinkId(null), 2000); // Reset "Copied!" message after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Campaign Dashboard</h1>
        <div className="header-buttons">
          {canCreateCampaign(userRole) && (
            <button onClick={handleCreateCampaign} className="create-button">
              Create Campaign
            </button>
          )}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="filter-controls">
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
        </select>


        {userRole === 'business_owner' && (
          <label className="my-campaigns-filter">
            <input
              type="checkbox"
              name="showMyCampaigns"
              checked={filters.showMyCampaigns}
              onChange={handleFilterChange}
            />
            <span>My Campaigns Only</span>
          </label>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading...</div>}
      
      <div className="dashboard-content">
        <div className="campaigns-grid">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign._id} className="campaign-card">
              <div className="campaign-header">
                <h3>{campaign.name}</h3>
                <span className={getStatusClass(campaign.status)}>
                  {campaign.status}
                </span>
              </div>
              <div className="campaign-creator">
                {campaign.createdBy ? (
                  <p>
                    <strong>Created by:</strong> {campaign.createdBy.name}
                    <span className="creator-role">({campaign.createdBy.role})</span>
                  </p>
                ) : (
                  <p><strong>Created by:</strong> Unknown</p>
                )}
              </div>
              <p className="campaign-description">{campaign.description}</p>
              <div className="campaign-details">
                <p><strong>Budget:</strong> ${campaign.budget}</p>
                <p><strong>Start Date:</strong> {formatDate(campaign.startDate)}</p>
                <p><strong>End Date:</strong> {formatDate(campaign.endDate)}</p>
              </div>
              
              {userRole === 'influencer' && (
                <div className="campaign-actions">
                  {!campaign.trackingLinks?.some(link => link.influencerId === userId) ? (
                    <button 
                      onClick={() => handleGenerateLink(campaign)}
                      className="generate-link-button"
                    >
                      Generate Tracking Link
                    </button>
                  ) : (
                    <div className="tracking-link">
                      <p>Your tracking link:</p>
                      <div className="link-container">
                        <input 
                          type="text" 
                          value={campaign.trackingLinks.find(link => 
                            link.influencerId === userId
                          )?.shortLink || ''}
                          readOnly
                          className="link-input"
                        />
                        <button 
                          onClick={() => copyToClipboard(
                            campaign.trackingLinks.find(link => 
                              link.influencerId === userId
                            )?.shortLink,
                            campaign._id
                          )}
                          className="copy-button"
                        >
                          {copiedLinkId === campaign._id ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;