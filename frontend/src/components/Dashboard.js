import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { canCreateCampaign } from '../utils/roleCheck';
import '../styles/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('userRole');
    console.log('Retrieved role from storage:', storedRole);

    if (!token) {
      navigate('/login');
    } else {
      setUserRole(storedRole);
      fetchCampaigns();
    }
  }, [navigate]);

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserRole(response.data.role);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/campaigns', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load campaigns');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
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
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="dashboard-content">
        <div className="campaigns-grid">
          {campaigns.map((campaign) => (
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;