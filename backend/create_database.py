import pymysql
import sys

def create_database_and_user():
    """Create the travellens database and user"""
    
    print("🗄️ Creating MySQL Database and User")
    print("=" * 50)
    
    # First try to connect as root without database to create it
    try:
        # Connect to MySQL server (without specifying database)
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='',  # Try empty password first
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        
        # Create database
        print("📝 Creating 'travellens' database...")
        cursor.execute("CREATE DATABASE IF NOT EXISTS travellens CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print("✅ Database created or already exists")
        
        # Create user
        print("👤 Creating 'travellens_user'...")
        cursor.execute("CREATE USER IF NOT EXISTS 'travellens_user'@'localhost' IDENTIFIED BY 'travel123'")
        print("✅ User created or already exists")
        
        # Grant privileges
        print("🔐 Granting privileges...")
        cursor.execute("GRANT ALL PRIVILEGES ON travellens.* TO 'travellens_user'@'localhost'")
        cursor.execute("FLUSH PRIVILEGES")
        print("✅ Privileges granted")
        
        connection.close()
        
        print("\n🎉 SUCCESS! Database and user setup complete!")
        print("\n📋 Use these credentials:")
        print("   User: travellens_user")
        print("   Password: travel123")
        print("   Database: travellens")
        print("\n📝 Update your .env file:")
        print("   DATABASE_URL=mysql+pymysql://travellens_user:travel123@localhost/travellens")
        
    except pymysql.Error as e:
        print(f"❌ Error: {e}")
        print("\n🔧 MANUAL SETUP REQUIRED:")
        print("1. Open MySQL Workbench or Command Line")
        print("2. Run these commands:")
        print("   CREATE DATABASE IF NOT EXISTS travellens CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        print("   CREATE USER IF NOT EXISTS 'travellens_user'@'localhost' IDENTIFIED BY 'travel123';")
        print("   GRANT ALL PRIVILEGES ON travellens.* TO 'travellens_user'@'localhost';")
        print("   FLUSH PRIVILEGES;")

if __name__ == '__main__':
    create_database_and_user()
