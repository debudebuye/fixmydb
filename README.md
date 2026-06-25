# FixMyDB V1 - Open Source AI Database Schema Reviewer

FixMyDB V1

## Overview

**FixMyDB** helps developers review, optimize, normalize, and improve database schemas in seconds. Built as an AI-powered Database Architect and Schema Reviewer, it saves developers time by automatically analyzing database schemas and providing actionable recommendations.

**No subscriptions. No paid plans. 100% Open Source.**

## Features

### V1 Features

1. **Multiple Schema Input Methods**
   - Paste SQL code directly
   - Upload SQL files (.sql, .json, .txt)
   - Visual Schema Builder (coming soon)

2. **Unique Zero-Config Analysis**
   - Six automatic analysis modules run on every schema
   - No setup, no plugins, no config files
   - One-pass schema review with immediate, cross-module insights

3. **Schema Analysis Engine**
   - Database Health Score (0-100)
   - Detect missing keys, duplicates, and naming issues
   - Identify scalability concerns

2. **Schema Analysis Engine**
   - Database Health Score (0-100)
   - Detect missing keys, duplicates, and naming issues
   - Identify scalability concerns

3. **Normalization Review**
   - Analyze 1NF, 2NF, 3NF compliance
   - Suggest improved schemas
   - Explain every recommendation

4. **Index Recommendation Engine**
   - Recommend indexes based on schema structure
   - Explain reasoning and expected benefits

5. **Relationship Analysis**
   - Detect missing foreign keys
   - Identify circular dependencies
   - Analyze relationship integrity

6. **ER Diagram Generator**
   - Interactive visual diagrams
   - Zoom, pan, auto-layout
   - Display tables, columns, keys, relationships

7. **SQL Generator**
   - Generate optimized SQL
   - Support PostgreSQL and MySQL
   - Copy-to-clipboard functionality

8. **Results Dashboard**
   - Tabbed interface: Overview, Normalization, Indexes, Relationships, ER Diagram, SQL Output

## Tech Stack

- **Frontend**: React.js + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (optional)
- **AI**: OpenAI API (optional)
- **Visualization**: React Flow for ER diagrams
- **Code Editor**: Monaco Editor

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL (optional, for advanced features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/debudebuye/fixmydb.git
cd fixmydb
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Set up environment variables:
```bash
# backend/.env
PORT=5000
OPENAI_API_KEY=your_openai_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/fixmydb
NODE_ENV=development
```

5. Start the development servers:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

6. Open http://localhost:5173 in your browser

## Usage

1. **Paste SQL** or **Upload a file** containing your database schema
2. Click **Analyze Schema**
3. Review the results:
   - Database Health Score
   - Normalization recommendations
   - Index suggestions
   - Relationship analysis
   - ER Diagram
   - Optimized SQL output
4. Copy the improved SQL and apply to your database

## Example

```sql
-- Input Schema
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255),
  name VARCHAR(255)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  total DECIMAL(10,2)
);
```

**FixMyDB will detect:**
- Missing foreign key constraint between orders.user_id and users.id
- Missing index on users.email
- Potential normalization improvements

## Target Users

- Backend Developers
- Database Engineers
- MERN Stack Developers
- Full Stack Developers
- Freelancers
- Startup Founders
- Students
- Senior Engineers
- Technical Leads

## Future Versions (Not in V1)

- Direct database connection
- Schema comparison
- Migration generation
- Team collaboration
- AI chat assistant
- Query performance analysis
- Multi-database support
- Plugin ecosystem

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- GitHub Issues: [Report bugs or request features](https://github.com/debudebuye/fixmydb/issues)
- Discussions: [Join the community](https://github.com/debudebuye/fixmydb/discussions)

## Acknowledgments

Inspired by ESLint for code and Postman for APIs - but for database architecture.

---

**Built for the open source community**
