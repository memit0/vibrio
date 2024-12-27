export const canCreateCampaign = (role) => {
  console.log('Checking role:', role); // Debug log
  const allowedRoles = ['admin', 'business_owner'];
  const hasPermission = allowedRoles.includes(role);
  console.log('Has permission:', hasPermission); // Debug log
  return hasPermission;
}; 