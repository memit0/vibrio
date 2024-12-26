I am building a platform called Vibrio, which connects small businesses with influencers through a reward-based bounty system. Help me implement this project step by step. The platform includes the following features:

1. **Authentication System**:

   - Role-based authentication for two types of users: small businesses and influencers.
   - JWT-based authentication for secure session handling.
   - API endpoints for registering and logging in users.

2. **Campaign Management**:

   - API for small businesses to create, update, delete, and list campaigns.
   - Each campaign includes details like a title, description, start and end dates, reward amount, and performance metrics (views, sales, engagement).

3. **Affiliate Link Tracking**:

   - Generate unique affiliate links for influencers to track views, sales, and engagement for campaigns.

4. **Leaderboard System**:

   - Maintain a real-time leaderboard ranking influencers by campaign performance metrics.
   - Use Redis for caching leaderboard data for high performance.

5. **Payment Processing**:

   - Use Stripe to handle payouts to influencers based on their performance.

6. **Frontend**:

   - A React-based frontend with the following pages:
     - Login and Register pages for authentication.
     - Dashboard for small businesses to manage campaigns.
     - Leaderboard page for influencers to view rankings and rewards.

7. **Tech Stack**:
   - Backend: Node.js with Express.js.
   - Database: PostgreSQL for persistent data, Redis for caching leaderboard data.
   - Frontend: React.js with Material-UI or Tailwind CSS for styling.
   - Payment API: Stripe.
   - Hosting: AWS or Google Cloud.

Start by creating the backend server. Use Node.js and Express.js to set up the server with a PostgreSQL database.

Step 1: Create a basic server in `backend/app.js` with routes for authentication (`/api/auth/register` and `/api/auth/login`).  
Step 2: Configure a PostgreSQL database connection and set up Sequelize for ORM. Create models for users (with role-based fields for businesses and influencers).

Please write modular, reusable code and provide comments for clarity.

Once the authentication is complete, move to creating the campaign management API.

Guide me through the implementation of these features one by one in detail.
