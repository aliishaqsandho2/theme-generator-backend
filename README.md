# Theme Generator Backend

## Setup Instructions
1. **Install MySQL**:
   - Ensure MySQL Community Server is installed.
   - Verify the `theme_generator` database exists:
     ```sql
     CREATE DATABASE theme_generator;
     ```
   - Update `.env` with your MySQL credentials:
     ```
     DATABASE_URL="mysql://root:Maasaa229%2427@localhost:3306/theme_generator"
     ```

2. **Install Node.js**:
   - Ensure Node.js (v16 or later) is installed.

3. **Install Dependencies**:
   ```bash
   npm install