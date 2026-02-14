# MySQL Setup Guide for Social Media App

## Current Status
✅ MySQL 9.3 is installed on your system  
❌ MySQL service is stopped  
❌ MySQL is not in your system PATH  

## Step-by-Step Setup

### Step 1: Start MySQL Service (Requires Admin)

**Option A: Using Services (Recommended)**
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find "MySQL93" in the list
4. Right-click and select "Start"
5. (Optional) Right-click → Properties → Set "Startup type" to "Automatic"

**Option B: Using Command Prompt as Administrator**
1. Right-click Start menu
2. Select "Windows Terminal (Admin)" or "Command Prompt (Admin)"
3. Run: `net start MySQL93`

### Step 2: Find MySQL Command Line

MySQL is likely installed at one of these locations:
- `C:\Program Files\MySQL\MySQL Server 9.3\bin\mysql.exe`
- `C:\Program Files (x86)\MySQL\MySQL Server 9.3\bin\mysql.exe`

### Step 3: Connect to MySQL

Open a new terminal and try:

```bash
# If in PATH
mysql -u root -p

# Or use full path (adjust if needed)
"C:\Program Files\MySQL\MySQL Server 9.3\bin\mysql.exe" -u root -p
```

Enter your MySQL root password when prompted.

### Step 4: Create Database

Once connected to MySQL, run:

```sql
CREATE DATABASE social_media_db;
USE social_media_db;
```

### Step 5: Import Schema

**Option A: From MySQL Command Line**

```sql
SOURCE C:/Users/hamza/.gemini/antigravity/scratch/SOCIAL-MEDIA-APP/backend/src/schema.sql;
```

**Option B: From Terminal**

```bash
"C:\Program Files\MySQL\MySQL Server 9.3\bin\mysql.exe" -u root -p social_media_db < backend/src/schema.sql
```

### Step 6: Verify Tables

```sql
USE social_media_db;
SHOW TABLES;
```

You should see:
- comments
- followers
- likes
- posts
- users

### Step 7: Update Backend Configuration

Edit `backend/.env` and set your MySQL password:

```env
DB_PASSWORD=your_actual_mysql_password
```

---

## Quick Test After Setup

Once MySQL is running and database is created:

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

Then open http://localhost:5173

---

## Common Issues

**"Access Denied"**: Your MySQL password is incorrect
- Reset root password using MySQL installer or mysqladmin

**"Can't connect to MySQL server"**: Service is not running
- Start the MySQL93 service as shown in Step 1

**"Database doesn't exist"**: Schema not imported
- Run the CREATE DATABASE and SOURCE commands from Step 4-5

---

## Alternative: Use MySQL Workbench (Visual Tool)

If you have MySQL Workbench installed:
1. Open MySQL Workbench
2. Connect to local MySQL instance
3. Run the contents of `backend/src/schema.sql` in a new query tab
4. Execute to create all tables

---

**Need Help?** Let me know which step you're stuck on!
