import psycopg2
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
import bcrypt

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

# Database connection
def get_db():
    return psycopg2.connect(DATABASE_URL, sslmode='require')

# ================= EMAIL FUNCTION =================
def send_status_email(seller_name, seller_email, store_name, status):
    """Send approval/rejection email"""
    try:
        if status.lower() == "approved":
            subject = "🎉 Your Seller Account is Approved!"
            body = f"""
Hello {seller_name},

Congratulations! Your seller account has been APPROVED by our team.

You can now start adding products and selling on our platform.

Store Name: {store_name}

Login here: http://localhost:5173/seller-login

Best regards,
MyStore Team
"""
        else:  # Rejected
            subject = "❌ Seller Application Status Update"
            body = f"""
Hello {seller_name},

We regret to inform you that your seller application has been REJECTED.

If you believe this is a mistake or would like to reapply, please contact our support team.

Store Name: {store_name}

Best regards,
MyStore Team
"""
        
        msg = MIMEMultipart()
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = seller_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))

        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)
        
        print(f"📧 Email sent to {seller_email}! ✅")
        return True
        
    except Exception as e:
        print(f"❌ Email failed: {str(e)}")
        return False

# ================= READ/VIEW OPERATIONS =================
def view_all_sellers():
    """View all sellers"""
    conn = get_db()
    cursor = conn.cursor()
    
    print("\n" + "="*80)
    print("📋 ALL SELLERS")
    print("="*80)
    
    cursor.execute("""
        SELECT id, fullname, email, store_name, status, created_at 
        FROM Sellers 
        ORDER BY id DESC
    """)
    sellers = cursor.fetchall()
    
    if not sellers:
        print("❌ No sellers found!")
    else:
        for seller in sellers:
            status_emoji = "✅" if seller[4].lower() == "approved" else "🕒" if seller[4].lower() == "pending" else "❌"
            print(f"\nID: {seller[0]} | {status_emoji} Status: {seller[4]}")
            print(f"Name: {seller[1]}")
            print(f"Email: {seller[2]}")
            print(f"Store: {seller[3]}")
            print(f"Registered: {seller[5]}")
            print("-"*80)
    
    conn.close()
    return sellers

def view_pending_sellers():
    """View only pending sellers"""
    conn = get_db()
    cursor = conn.cursor()
    
    print("\n" + "="*80)
    print("🕒 PENDING SELLERS (Awaiting Approval)")
    print("="*80)
    
    cursor.execute("""
        SELECT id, fullname, email, store_name, created_at 
        FROM Sellers 
        WHERE status = 'Pending'
        ORDER BY created_at ASC
    """)
    sellers = cursor.fetchall()
    
    if not sellers:
        print("✅ No pending sellers!")
    else:
        for seller in sellers:
            print(f"\nID: {seller[0]}")
            print(f"Name: {seller[1]}")
            print(f"Email: {seller[2]}")
            print(f"Store: {seller[3]}")
            print(f"Waiting since: {seller[4]}")
            print("-"*80)
    
    conn.close()
    return sellers

def view_seller_details(seller_id):
    """View single seller details"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, fullname, email, store_name, store_description, status, created_at
        FROM Sellers
        WHERE id = %s
    """, (seller_id,))
    seller = cursor.fetchone()
    
    if not seller:
        print(f"❌ Seller ID {seller_id} not found!")
    else:
        print("\n" + "="*80)
        print(f"📋 SELLER DETAILS - ID: {seller[0]}")
        print("="*80)
        print(f"Name: {seller[1]}")
        print(f"Email: {seller[2]}")
        print(f"Store Name: {seller[3]}")
        print(f"Description: {seller[4]}")
        print(f"Status: {seller[5]}")
        print(f"Registered: {seller[6]}")
        print("="*80)
        
        # Show products count
        cursor.execute("SELECT COUNT(*) FROM Products WHERE seller_email = %s", (seller[2],))
        product_count = cursor.fetchone()[0]
        print(f"Total Products: {product_count}")
        print("="*80)
    
    conn.close()
    return seller

# ================= UPDATE OPERATIONS =================
def approve_seller(email):
    """Approve a seller"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT fullname, store_name, status FROM Sellers WHERE email = %s", (email,))
    seller = cursor.fetchone()
    
    if not seller:
        print(f"❌ Seller {email} not found!")
        conn.close()
        return False
    
    seller_name, store_name, current_status = seller
    
    if current_status.lower() == "approved":
        print(f"⚠️ Seller {email} is already approved!")
        conn.close()
        return False
    
    # Update status
    cursor.execute("UPDATE Sellers SET status = 'Approved' WHERE email = %s", (email,))
    conn.commit()
    
    print(f"\n✅ Seller {email} has been APPROVED in database!")
    
    # Send email
    print("📧 Sending approval email...")
    if send_status_email(seller_name, email, store_name, "Approved"):
        print("🎉 Done! Seller can now login and add products!")
    else:
        print("⚠️ Approved but email failed. Seller can still login.")
    
    conn.close()
    return True

def reject_seller(email):
    """Reject a seller"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT fullname, store_name, status FROM Sellers WHERE email = %s", (email,))
    seller = cursor.fetchone()
    
    if not seller:
        print(f"❌ Seller {email} not found!")
        conn.close()
        return False
    
    seller_name, store_name, current_status = seller
    
    if current_status.lower() == "rejected":
        print(f"⚠️ Seller {email} is already rejected!")
        conn.close()
        return False
    
    # Update status
    cursor.execute("UPDATE Sellers SET status = 'Rejected' WHERE email = %s", (email,))
    conn.commit()
    
    print(f"\n❌ Seller {email} has been REJECTED in database!")
    
    # Send email
    print("📧 Sending rejection email...")
    send_status_email(seller_name, email, store_name, "Rejected")
    
    conn.close()
    return True

def update_seller(seller_id):
    """Update seller information"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get current details
    cursor.execute("""
        SELECT fullname, email, store_name, store_description, status
        FROM Sellers WHERE id = %s
    """, (seller_id,))
    seller = cursor.fetchone()
    
    if not seller:
        print(f"❌ Seller ID {seller_id} not found!")
        conn.close()
        return False
    
    print(f"\n📝 CURRENT DETAILS:")
    print(f"Name: {seller[0]}")
    print(f"Email: {seller[1]}")
    print(f"Store: {seller[2]}")
    print(f"Description: {seller[3]}")
    print(f"Status: {seller[4]}")
    
    print("\n✏️ Enter new details (press Enter to keep current):")
    
    new_name = input(f"Name [{seller[0]}]: ").strip() or seller[0]
    new_store = input(f"Store Name [{seller[2]}]: ").strip() or seller[2]
    new_desc = input(f"Description [{seller[3]}]: ").strip() or seller[3]
    
    cursor.execute("""
        UPDATE Sellers 
        SET fullname = %s, store_name = %s, store_description = %s
        WHERE id = %s
    """, (new_name, new_store, new_desc, seller_id))
    
    conn.commit()
    print(f"\n✅ Seller ID {seller_id} updated successfully!")
    
    conn.close()
    return True

# ================= DELETE OPERATION =================
def delete_seller(seller_id):
    """Delete a seller and all their products"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get seller details
    cursor.execute("SELECT fullname, email FROM Sellers WHERE id = %s", (seller_id,))
    seller = cursor.fetchone()
    
    if not seller:
        print(f"❌ Seller ID {seller_id} not found!")
        conn.close()
        return False
    
    seller_name, seller_email = seller
    
    # Count products
    cursor.execute("SELECT COUNT(*) FROM Products WHERE seller_email = %s", (seller_email,))
    product_count = cursor.fetchone()[0]
    
    print(f"\n⚠️ WARNING: This will delete:")
    print(f"   - Seller: {seller_name} ({seller_email})")
    print(f"   - {product_count} product(s)")
    
    confirm = input("\nType 'DELETE' to confirm: ").strip()
    
    if confirm != "DELETE":
        print("❌ Deletion cancelled!")
        conn.close()
        return False
    
    # Delete products first (foreign key constraint)
    cursor.execute("DELETE FROM ProductActivityLog WHERE seller_email = %s", (seller_email,))
    cursor.execute("DELETE FROM Products WHERE seller_email = %s", (seller_email,))
    cursor.execute("DELETE FROM SellerStatusChanges WHERE seller_email = %s", (seller_email,))
    cursor.execute("DELETE FROM Sellers WHERE id = %s", (seller_id,))
    
    conn.commit()
    print(f"\n✅ Seller ID {seller_id} and all related data deleted!")
    
    conn.close()
    return True

# ================= CREATE OPERATION =================
def create_seller():
    """Manually create a seller (admin function)"""
    conn = get_db()
    cursor = conn.cursor()
    
    print("\n" + "="*80)
    print("➕ CREATE NEW SELLER")
    print("="*80)
    
    fullname = input("Full Name: ").strip()
    email = input("Email: ").strip()
    store_name = input("Store Name: ").strip()
    store_description = input("Store Description: ").strip()
    password = input("Password: ").strip()
    
    print("\nStatus:")
    print("1. Pending")
    print("2. Approved")
    print("3. Rejected")
    status_choice = input("Choose (1-3): ").strip()
    
    status_map = {"1": "Pending", "2": "Approved", "3": "Rejected"}
    status = status_map.get(status_choice, "Pending")
    
    # Check if email exists
    cursor.execute("SELECT * FROM Sellers WHERE email = %s", (email,))
    if cursor.fetchone():
        print(f"❌ Email {email} already exists!")
        conn.close()
        return False
    
    # Hash password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Insert
    cursor.execute("""
        INSERT INTO Sellers (fullname, email, store_name, store_description, password, status)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (fullname, email, store_name, store_description, hashed_password, status))
    
    conn.commit()
    print(f"\n✅ Seller {email} created successfully with status: {status}")
    
    conn.close()
    return True

# ================= MAIN MENU =================
def main_menu():
    while True:
        print("\n" + "="*80)
        print("🛠️  SELLER MANAGEMENT SYSTEM (CRUD)")
        print("="*80)
        print("\n📖 READ/VIEW:")
        print("  1. View All Sellers")
        print("  2. View Pending Sellers")
        print("  3. View Seller Details (by ID)")
        
        print("\n✏️  UPDATE:")
        print("  4. Approve Seller")
        print("  5. Reject Seller")
        print("  6. Update Seller Info")
        
        print("\n➕ CREATE:")
        print("  7. Create New Seller (Manual)")
        
        print("\n🗑️  DELETE:")
        print("  8. Delete Seller")
        
        print("\n📧 OTHER:")
        print("  9. Send Pending Approval Emails")
        
        print("\n  0. Exit")
        print("="*80)
        
        choice = input("\n👉 Enter choice: ").strip()
        
        if choice == "1":
            view_all_sellers()
        
        elif choice == "2":
            view_pending_sellers()
        
        elif choice == "3":
            seller_id = input("Enter Seller ID: ").strip()
            view_seller_details(int(seller_id))
        
        elif choice == "4":
            email = input("Enter seller email to APPROVE: ").strip()
            approve_seller(email)
        
        elif choice == "5":
            email = input("Enter seller email to REJECT: ").strip()
            reject_seller(email)
        
        elif choice == "6":
            seller_id = input("Enter Seller ID to update: ").strip()
            update_seller(int(seller_id))
        
        elif choice == "7":
            create_seller()
        
        elif choice == "8":
            seller_id = input("Enter Seller ID to DELETE: ").strip()
            delete_seller(int(seller_id))
        
        elif choice == "9":
            # Send pending emails
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, seller_name, seller_email, store_name, new_status
                FROM SellerStatusChanges
                WHERE email_sent = FALSE
                AND new_status IN ('Approved', 'Rejected')
            """)
            pending = cursor.fetchall()
            
            if not pending:
                print("✅ No pending emails!")
            else:
                for record in pending:
                    send_status_email(record[1], record[2], record[3], record[4])
                    cursor.execute("UPDATE SellerStatusChanges SET email_sent = TRUE WHERE id = %s", (record[0],))
                    conn.commit()
                print(f"✅ Sent {len(pending)} email(s)!")
            
            conn.close()
        
        elif choice == "0":
            print("\n👋 Goodbye!")
            break
        
        else:
            print(" Invalid choice!")

# ================= RUN =================
if __name__ == "__main__":
    print("\n🚀 Starting Seller Management System...")
    main_menu()