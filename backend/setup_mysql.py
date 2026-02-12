import pymysql
import sys

def test_mysql_connection():
    """Test MySQL connection and provide setup guidance"""
    
    print("🔍 MySQL Connection Test")
    print("=" * 40)
    
    # Test common MySQL configurations
    configs = [
        {
            'name': 'Default root (no password)',
            'host': 'localhost',
            'user': 'root',
            'password': 'jerlin',
            'database': 'travellens'
        },
        {
            'name': 'Root with common password',
            'host': 'localhost', 
            'user': 'root',
            'password': 'password',
            'database': 'travellens'
        },
        {
            'name': 'Root with MySQL default',
            'host': 'localhost',
            'user': 'root', 
            'password': 'root',
            'database': 'travellens'
        },
        {
            'name': 'Custom user',
            'host': 'localhost',
            'user': 'travellens_user',
            'password': 'travel123',
            'database': 'travellens'
        }
    ]
    
    for i, config in enumerate(configs, 1):
        print(f"\n📋 Testing {config['name']}...")
        try:
            connection = pymysql.connect(
                host=config['host'],
                user=config['user'],
                password=config['password'],
                database=config['database'],
                charset='utf8mb4'
            )
            print(f"✅ SUCCESS: {config['name']} works!")
            print(f"   Connection string: mysql+pymysql://{config['user']}:{config['password']}@{config['host']}/{config['database']}")
            connection.close()
            return config
        except Exception as e:
            print(f"❌ FAILED: {e}")
    
    print(f"\n🎯 RECOMMENDATION:")
    print("1. Use the working configuration above")
    print("2. Update your .env file with the correct DATABASE_URL")
    print("3. If none work, create a new MySQL user:")
    print("   CREATE USER 'travellens_user'@'localhost' IDENTIFIED BY 'travel123';")
    print("   GRANT ALL PRIVILEGES ON travellens.* TO 'travellens_user'@'localhost';")
    print("   FLUSH PRIVILEGES;")
    
    return None

if __name__ == '__main__':
    test_mysql_connection()
