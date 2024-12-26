import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { isValidEmail, validatePassword } from '../utils/validation';
import '../styles/Auth.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'influencer', label: 'Influencer' },
    { value: 'business_owner', label: 'Business Owner' }
  ];

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters long';
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        if (!isValidEmail(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        const passwordValidation = validatePassword(value);
        if (!passwordValidation.isValid) {
          newErrors.password = passwordValidation.errors;
        } else {
          delete newErrors.password;
        }
        break;

      case 'role':
        if (!value) {
          newErrors.role = 'Please select a role';
        } else {
          delete newErrors.role;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    let isValid = true;
    Object.keys(formData).forEach(key => {
      if (!validateField(key, formData[key])) {
        isValid = false;
      }
    });

    if (!isValid) {
      return;
    }

    try {
      await axios.post('http://localhost:5001/api/auth/register', formData);
      navigate('/login');
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.response?.data?.message || 'Registration failed'
      }));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Register</h2>
        {errors.submit && <div className="error-message">{errors.submit}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.name && errors.name ? 'error-input' : ''}
              required
            />
            {touched.name && errors.name && 
              <div className="field-error">{errors.name}</div>
            }
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.email && errors.email ? 'error-input' : ''}
              required
            />
            {touched.email && errors.email && 
              <div className="field-error">{errors.email}</div>
            }
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.password && errors.password ? 'error-input' : ''}
              required
            />
            {touched.password && errors.password && 
              <div className="field-error">
                {Array.isArray(errors.password) 
                  ? errors.password.map((err, index) => (
                      <div key={index}>{err}</div>
                    ))
                  : errors.password
                }
              </div>
            }
          </div>

          <div className="form-group">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`role-select ${touched.role && errors.role ? 'error-input' : ''}`}
              required
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            {touched.role && errors.role && 
              <div className="field-error">{errors.role}</div>
            }
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={Object.keys(errors).length > 0}
          >
            Register
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;