import socket

# Try different AWS regions for Supabase pooler
regions = [
    "aws-0-us-east-1",
    "aws-0-us-west-1",
    "aws-0-eu-central-1",
    "aws-0-ap-south-1",
    "aws-0-ap-southeast-1",
    "aws-0-ap-northeast-1",
]

print("Testing which pooler region responds:")
for region in regions:
    host = f"{region}.pooler.supabase.com"
    try:
        import psycopg2
        conn = psycopg2.connect(
            host=host,
            port=5432,
            dbname="postgres",
            user="postgres.uvhjkvpanesncneirgvg",
            password="MedPliotAI2025",
            connect_timeout=5,
            sslmode="require",
        )
        print(f"SUCCESS: {region}")
        conn.close()
        break
    except Exception as e:
        err = str(e).strip().split("\n")[0]
        print(f"FAIL {region}: {err}")
