import pymysql

def test_connection():
    """Quick test of MySQL connection"""
    
    configs = [
        ('Empty password', ''),
        ('Password: password', 'password'),
        ('Password: root', 'root'),
        ('Password: 123', '123'),
        ('Password: mysql', 'mysql'),
    ]
    
    print("🔍 Testing MySQL connections...")
    
    for name, password in configs:
        try:
            conn = pymysql.connect(
                host='localhost',
                user='root',
                password=password,
                charset='utf8mb4'
            )
            print(f"✅ SUCCESS with password: '{password}'")
            conn.close()
            return password
        except Exception as e:
            print(f"❌ Failed with password '{password}': {e}")
    
    print("\n💡 If none worked, try:")
    print("1. Open MySQL Workbench")
    print("2. Go to Server > Users > root")
    print("3. Reset password to something simple")
    print("4. Or create new user as shown in create_database.py")

if __name__ == '__main__':
    test_connection()
