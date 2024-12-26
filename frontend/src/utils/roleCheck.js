export const canCreateCampaign = (role) => {
  const allowedRoles = ['admin', 'business_owner'];
  return allowedRoles.includes(role);
}; 