import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/CreateCampaign.css';

function CreateCampaign() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: '',
    status: 'draft', // default status
    targetUrl: '' // Add this field
  });
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' }
  ];

  const validateField = (name, value) => {
    const errors = {};

    switch (name) {
      case 'name':
        if (value.trim().length < 3) {
          errors.name = 'Campaign name must be at least 3 characters long';
        }
        break;

      case 'budget':
        if (isNaN(value) || parseFloat(value) <= 0) {
          errors.budget = 'Budget must be a positive number';
        }
        break;

      case 'startDate':
        const startDate = new Date(value);
        if (startDate < new Date().setHours(0, 0, 0, 0)) {
          errors.startDate = 'Start date cannot be in the past';
        }
        break;

      case 'endDate':
        const endDate = new Date(value);
        const start = new Date(formData.startDate);
        if (endDate <= start) {
          errors.endDate = 'End date must be after start date';
        }
        break;

      default:
        break;
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (touched[name]) {
      const fieldErrors = validateField(name, value);
      setError(prev => ({
        ...prev,
        [name]: fieldErrors[name]
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    const fieldErrors = validateField(name, value);
    setError(prev => ({
      ...prev,
      [name]: fieldErrors[name]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});

    // Validate all fields
    let formErrors = {};
    Object.keys(formData).forEach(key => {
      const fieldErrors = validateField(key, formData[key]);
      if (Object.keys(fieldErrors).length > 0) {
        formErrors = { ...formErrors, ...fieldErrors };
      }
    });

    if (Object.keys(formErrors).length > 0) {
      setError(formErrors);
      return;
    }

    // Log the form data being sent
    console.log('Submitting campaign data:', formData);

    try {
      const response = await axios.post(
        'http://localhost:5001/api/campaigns',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Log the response
      console.log('Campaign created successfully:', response.data);
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating campaign:', error.response?.data || error);
      setError({
        submit: error.response?.data?.message || 'Error creating campaign'
      });
    }
  };

  return (
    <div className="create-campaign-container">
      <div className="create-campaign-box">
        <h2>Create New Campaign</h2>
        {error.submit && <div className="error-message">{error.submit}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Campaign Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.name && error.name ? 'error-input' : ''}
              required
            />
            {touched.name && error.name && 
              <div className="field-error">{error.name}</div>
            }
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="budget">Budget ($)</label>
            <input
              id="budget"
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              onBlur={handleBlur}
              step="0.01"
              min="0"
              className={touched.budget && error.budget ? 'error-input' : ''}
              required
            />
            {touched.budget && error.budget && 
              <div className="field-error">{error.budget}</div>
            }
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.startDate && error.startDate ? 'error-input' : ''}
              required
            />
            {touched.startDate && error.startDate && 
              <div className="field-error">{error.startDate}</div>
            }
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.endDate && error.endDate ? 'error-input' : ''}
              required
            />
            {touched.endDate && error.endDate && 
              <div className="field-error">{error.endDate}</div>
            }
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="targetUrl">Target URL</label>
            <input
              type="url"
              className="form-control"
              id="targetUrl"
              name="targetUrl"
              value={formData.targetUrl}
              onChange={handleChange}
              required
              placeholder="https://example.com"
            />
          </div>

          <div className="button-group">
            <button type="submit" className="submit-button">
              Create Campaign
            </button>
            <button 
              type="button" 
              className="cancel-button" 
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCampaign; 