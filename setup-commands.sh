# 1. Clone and setup
git clone <your-repo>
cd marketing-saas
npm install

# 2. Setup Supabase
npx supabase init
npx supabase start
npx supabase db push

# 3. Setup environment
cp .env.example .env.local
# Fill in your environment variables

# 4. Run development server
npm run dev

# 5. Setup database (run once)
npm run db:seed

# 6. Run tests
npm test

# 7. Build for production
npm run build
npm start