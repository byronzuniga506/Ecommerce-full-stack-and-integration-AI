from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
import random
import time
import re
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
# import ollama
import os

load_dotenv()

# ------------------- DATABASE SETUP -------------------
DATABASE_URL = os.getenv("DATABASE_URL")

# ------------------- FLASK APP -------------------
app = Flask(__name__)
CORS(app)

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD") 

# In-memory OTP store
otp_store = {}

# ------------------- DATABASE HELPER -------------------
def get_db_connection():
    """Get PostgreSQL database connection"""
    return psycopg2.connect(DATABASE_URL, sslmode='require')

# ------------------- HELPER FUNCTIONS -------------------

def log_product_activity(product_id, seller_email, seller_name, action, product_title, old_data=None, new_data=None):
    """Log product changes to database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO ProductActivityLog (product_id, seller_email, seller_name, action, product_title, old_data, new_data)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            product_id,
            seller_email,
            seller_name,
            action,
            product_title,
            json.dumps(old_data) if old_data else None,
            json.dumps(new_data) if new_data else None
        ))
        
        conn.commit()
        print(f"✅ Logged activity: {action} - {product_title}")
        
    except Exception as e:
        print(f"❌ Error logging activity: {str(e)}")
    finally:
        if conn:
            conn.close()


def send_activity_email(seller_email, seller_name, action, product_title, details=""):
    """Send email notification for product actions"""
    try:
        action_emoji = {
            "created": "➕",
            "updated": "✏️",
            "deleted": "🗑️",
            "published": "✅",
            "unpublished": "🔴"
        }
        
        emoji = action_emoji.get(action, "📦")
        
        subject = f"{emoji} Product {action.capitalize()}: {product_title}"
        
        body = f"""
Hello {seller_name},

Your product action was successful!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{emoji} ACTION: {action.upper()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Product: {product_title}
Action: {action.capitalize()}
Time: {time.strftime('%B %d, %Y at %I:%M %p')}

{details}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

View your dashboard: http://localhost:5173/seller-dashboard

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
        
        print(f"✅ Email sent to {seller_email} for {action}")
        
    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")


# ------------------- SIGNUP -------------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    print("📝 Data:", data)
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "Email already registered"}), 400

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cursor.execute("INSERT INTO Users (name, email, password) VALUES (%s, %s, %s)", (name, email, hashed_password))
        conn.commit()
        return jsonify({"message": "Signup successful!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ------------------- SEND OTP -------------------
@app.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.json
    email = data.get("email", "").strip()

    if not email:
        return jsonify({"error": "Email is required"}), 400
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Invalid email format"}), 400

    otp = str(random.randint(100000, 999999))
    otp_store[email] = {"otp": otp, "expires": time.time() + 300}

    # Print OTP to console (for testing on Render)
    print(f"🔑 [OTP for {email}] → {otp}")
    
    return jsonify({
        "message": "OTP sent successfully! (Check server logs for OTP)",
    })
# ------------------- VERIFY OTP -------------------
@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    email = data.get("email", "").strip()
    otp = data.get("otp", "").strip()

    if not email or not otp:
        return jsonify({"error": "Email and OTP required"}), 400

    record = otp_store.get(email)
    if not record:
        return jsonify({"error": "OTP not found"}), 400
    if time.time() > record["expires"]:
        return jsonify({"error": "OTP expired"}), 400

    if otp == record["otp"]:
        del otp_store[email]
        return jsonify({"message": "OTP verified successfully!"})
    else:
        return jsonify({"error": "Invalid OTP"}), 400

# ------------------- LOGIN -------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT password, name FROM Users WHERE email = %s", (email,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Invalid email or password"}), 401

        if bcrypt.checkpw(password.encode('utf-8'), row[0].encode('utf-8')):
            return jsonify({"message": f"Welcome {row[1]}!"})
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ------------------- SEND ORDER EMAIL -------------------
@app.route("/send-order-email", methods=["POST"])
def send_order_email():
    data = request.json
    email = data.get("email")
    fullName = data.get("fullName")
    items = data.get("items", [])
    totalPrice = data.get("totalPrice")
    addressInfo = data.get("address", {})

    if not email or not fullName or not items or not totalPrice or not addressInfo:
        return jsonify({"error": "Missing order information"}), 400

    items_text = "\n".join([f"{item['quantity']} x {item['title']} = ${item['price'] * item['quantity']:.2f}" for item in items])
    body = f"""
Hello {fullName},

Thank you for your order!

{items_text}

Total: ${totalPrice:.2f}

Delivering to:
{addressInfo.get('fullName')}
{addressInfo.get('address')}, {addressInfo.get('city')}, {addressInfo.get('state')} - {addressInfo.get('pincode')}
Phone: {addressInfo.get('phone')}
"""

    try:
        msg = MIMEMultipart()
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = email
        msg["Subject"] = "Your Order Confirmation"
        msg.attach(MIMEText(body, "plain", "utf-8"))

        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)

        return jsonify({"message": "Order confirmation email sent successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------- SAVE ORDER TO DATABASE -------------------
@app.route("/save-order", methods=["POST"])
def save_order():
    data = request.json
    email = data.get("email")
    fullName = data.get("fullName")
    items = data.get("items", [])
    totalPrice = data.get("totalPrice")
    addressInfo = data.get("address", {})

    if not email or not fullName or not items or not totalPrice or not addressInfo:
        return jsonify({"error": "Missing order information"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO Orders (email, fullName, totalPrice, address, city, state, pincode)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            email,
            fullName,
            totalPrice,
            addressInfo.get('address'),
            addressInfo.get('city'),
            addressInfo.get('state'),
            addressInfo.get('pincode')
        ))
        order_id = cursor.fetchone()[0]

        for item in items:
            cursor.execute("""
                INSERT INTO OrderItems (order_id, title, price, quantity)
                VALUES (%s, %s, %s, %s)
            """, (order_id, item['title'], item['price'], item['quantity']))

        conn.commit()
        return jsonify({"message": "Order saved successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ------------------- GET USER ORDERS -------------------
@app.route("/get-orders/<email>", methods=["GET"])
def get_orders(email):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, fullName, totalPrice, address, city, state, pincode
            FROM Orders
            WHERE email = %s
            ORDER BY id DESC
        """, (email,))
        orders = cursor.fetchall()

        orders_list = []
        for order in orders:
            order_id = order[0]
            cursor.execute("""
                SELECT title, price, quantity
                FROM OrderItems
                WHERE order_id = %s
            """, (order_id,))
            items = cursor.fetchall()
            items_list = [
                {"title": i[0], "price": float(i[1]), "quantity": i[2]} for i in items
            ]

            orders_list.append({
                "orderId": order_id,
                "fullName": order[1],
                "totalPrice": float(order[2]),
                "address": order[3],
                "city": order[4],
                "state": order[5],
                "pincode": order[6],
                "items": items_list
            })

        return jsonify(orders_list)
    except Exception as e:
        print("❌ Error fetching orders:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ------------------- SELLER SIGNUP -------------------
@app.route("/seller-signup", methods=["POST"])
def apply_seller():
    data = request.json
    print("📝 Incoming JSON:", data)
    
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    storeName = data.get("storeName", "").strip()
    store_description = data.get("store_description", "").strip()
    password = data.get("password", "").strip()

    if not name or not email or not storeName or not store_description or not password:
        return jsonify({"error": "All fields are required"}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Invalid email format"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM Sellers WHERE email = %s", (email,))
        existing = cursor.fetchone()
        if existing:
            return jsonify({"error": "This email is already registered as a seller. Please login or use a different email."}), 400

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        cursor.execute("""
            INSERT INTO Sellers (fullname, store_name, store_description, password, email, status)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (name, storeName, store_description, hashed_password, email, "Pending"))
        
        conn.commit()

        subject = "Seller Application Received"
        body = f"""
Hello {name},

Thank you for applying to be a seller on our platform!

Your application is currently **Pending Review**.  
You'll receive another email once your request has been approved.

Store Name: {storeName}

Best,
MyStore Team
"""
        msg = MIMEMultipart()
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))

        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)

        return jsonify({"message": "Seller application submitted successfully! Check your email for confirmation."}), 201

    except Exception as e:
        print("❌ Error during seller signup:", str(e))
        return jsonify({"error": f"Failed to submit application: {str(e)}"}), 500
    finally:
        if conn:
            conn.close()

# ------------------- SELLER LOGIN -------------------
@app.route("/seller-login", methods=["POST"])
def seller_login():
    data = request.json
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT password, fullname, status FROM Sellers WHERE email = %s", (email,))
        row = cursor.fetchone()
        
        if not row:
            return jsonify({"error": "Invalid email or password"}), 401

        stored_password, name, status = row

        if not bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):
            return jsonify({"error": "Invalid email or password"}), 401

        status_lower = status.lower()
        
        if status_lower == "pending":
            return jsonify({
                "error": "Your account is pending approval. Please wait for admin to approve your application."
            }), 403
        
        elif status_lower == "rejected":
            return jsonify({
                "error": "Your seller application was rejected. Please contact support."
            }), 403
        
        elif status_lower == "approved":
            return jsonify({
                "message": f"Welcome {name}!",
                "name": name,
                "email": email,
                "status": "approved"
            }), 200
        
        else:
            return jsonify({"error": "Invalid account status"}), 403

    except Exception as e:
        print("❌ Error during seller login:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ------------------- ADD PRODUCT -------------------
@app.route("/add-product", methods=["POST"])
def add_product():
    data = request.json
    print("📦 Incoming product data:", data)
    
    title = data.get("title", "").strip()
    price = data.get("price")
    description = data.get("description", "").strip()
    category = data.get("category", "").strip()
    image = data.get("image", "").strip()
    seller_email = data.get("sellerId", "").strip()
    seller_name = data.get("sellerName", "").strip()

    if not title or not price or not description or not category:
        return jsonify({"error": "All required fields must be filled"}), 400

    if not seller_email:
        return jsonify({"error": "Seller information missing"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT status FROM Sellers WHERE email = %s", (seller_email,))
        seller = cursor.fetchone()
        
        if not seller:
            return jsonify({"error": "Seller not found"}), 404
        
        if seller[0].lower() != "approved":
            return jsonify({
                "error": f"Only approved sellers can add products. Your status: {seller[0]}"
            }), 403

        if not image:
            image = "https://via.placeholder.com/300x300?text=No+Image"
        
        print(f"💾 Saving product: {title} by {seller_name} as DRAFT")
        cursor.execute("""
            INSERT INTO Products (title, price, description, category, image, seller_email, seller_name, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (title, float(price), description, category, image, seller_email, seller_name, 'draft'))
        
        product_id = cursor.fetchone()[0]
        conn.commit()
        print(f"✅ Product saved with ID: {product_id} (Status: draft)")

        # LOG ACTIVITY
        log_product_activity(product_id, seller_email, seller_name, "created", title)

        subject = "📦 Product Saved as Draft"
        body = f"""
Hello {seller_name},

Your product has been successfully saved as a DRAFT.

Product Details:
• Name: {title}
• Price: ${price}
• Category: {category}
• Status: DRAFT (Not visible to customers yet)

Next Steps:
1. Review your product in the dashboard
2. Edit if needed
3. Publish when ready to make it live

Login to Dashboard: http://localhost:5173/seller-dashboard

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
        
        print(f"📧 Email sent to {seller_email}")

        return jsonify({
            "message": "Product saved as draft! Check your email and dashboard.",
            "product_id": product_id,
            "status": "draft"
        }), 201

    except Exception as e:
        print("❌ Error adding product:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# ------------------- GET SELLER'S PRODUCTS -------------------
@app.route("/seller-products", methods=["GET"])
def get_seller_products():
    seller_email = request.args.get('sellerId')
    
    if not seller_email:
        return jsonify({"error": "Seller email is required"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT status FROM Sellers WHERE email = %s", (seller_email,))
        seller = cursor.fetchone()
        
        if not seller:
            return jsonify({"error": "Seller not found"}), 404
        
        if seller[0].lower() != "approved":
            return jsonify({"error": "Only approved sellers can view products"}), 403
        
        cursor.execute("""
            SELECT id, title, price, description, category, image, seller_email, seller_name, status, created_at
            FROM Products
            WHERE seller_email = %s
            ORDER BY created_at DESC
        """, (seller_email,))
        
        rows = cursor.fetchall()
        
        products = [
            {
                "id": row[0],
                "title": row[1],
                "price": float(row[2]) if row[2] else 0,
                "description": row[3] if row[3] else "",
                "category": row[4] if row[4] else "",
                "image": row[5] if row[5] else "https://via.placeholder.com/300x300?text=No+Image",
                "sellerId": row[6] if row[6] else "",
                "sellerName": row[7] if row[7] else "",
                "status": row[8] if row[8] else "draft",
                "createdAt": row[9].isoformat() if row[9] else "",
                "rating": {"rate": 0, "count": 0}
            }
            for row in rows
        ]
        
        print(f"✅ Found {len(products)} products for seller: {seller_email}")
        return jsonify(products), 200
        
    except Exception as e:
        print("❌ Error fetching seller products:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ------------------- DELETE PRODUCT -------------------
@app.route("/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT title, seller_email, seller_name FROM Products WHERE id = %s", (product_id,))
        product = cursor.fetchone()
        
        if not product:
            return jsonify({"error": "Product not found"}), 404
        
        title, seller_email, seller_name = product
        
        cursor.execute("DELETE FROM Products WHERE id = %s", (product_id,))
        conn.commit()
        
        print(f"🗑️ Product deleted: {title} (ID: {product_id})")
        
        # LOG ACTIVITY
        log_product_activity(product_id, seller_email, seller_name, "deleted", title)
        
        # SEND EMAIL
        send_activity_email(
            seller_email, 
            seller_name, 
            "deleted", 
            title,
            f"The product '{title}' has been permanently removed from your store."
        )
        
        return jsonify({"message": "Product deleted successfully!"}), 200
        
    except Exception as e:
        print("❌ Error deleting product:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ------------------- PUBLISH PRODUCT -------------------
@app.route("/products/<int:product_id>/publish", methods=["PATCH"])
def publish_product(product_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT title, seller_email, seller_name, status FROM Products WHERE id = %s", (product_id,))
        product = cursor.fetchone()
        
        if not product:
            return jsonify({"error": "Product not found"}), 404
        
        title, seller_email, seller_name, old_status = product
        
        cursor.execute("UPDATE Products SET status = %s WHERE id = %s", ('published', product_id))
        conn.commit()
        
        print(f"✅ Product published: {title} (ID: {product_id})")
        
        # LOG ACTIVITY
        log_product_activity(
            product_id, 
            seller_email, 
            seller_name, 
            "published", 
            title,
            old_data={"status": old_status},
            new_data={"status": "published"}
        )
        
        # SEND EMAIL
        send_activity_email(
            seller_email, 
            seller_name, 
            "published", 
            title,
            f"Your product '{title}' is now LIVE and visible to all customers on the store! 🎉"
        )
        
        return jsonify({
            "message": "Product published successfully!",
            "status": "published"
        }), 200
        
    except Exception as e:
        print("❌ Error publishing product:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ------------------- UNPUBLISH PRODUCT -------------------
@app.route("/products/<int:product_id>/unpublish", methods=["PATCH"])
def unpublish_product(product_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT title, seller_email, seller_name, status FROM Products WHERE id = %s", (product_id,))
        product = cursor.fetchone()
        
        if not product:
            return jsonify({"error": "Product not found"}), 404
        
        title, seller_email, seller_name, old_status = product
        
        cursor.execute("UPDATE Products SET status = %s WHERE id = %s", ('draft', product_id))
        conn.commit()
        
        print(f"🔴 Product unpublished: {title} (ID: {product_id})")
        
        # LOG ACTIVITY
        log_product_activity(
            product_id, 
            seller_email, 
            seller_name, 
            "unpublished", 
            title,
            old_data={"status": old_status},
            new_data={"status": "draft"}
        )
        
        # SEND EMAIL
        send_activity_email(
            seller_email, 
            seller_name, 
            "unpublished", 
            title,
            f"Your product '{title}' has been moved back to DRAFT status and is no longer visible to customers."
        )
        
        return jsonify({
            "message": "Product unpublished successfully!",
            "status": "draft"
        }), 200
        
    except Exception as e:
        print("❌ Error unpublishing product:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ------------------- CHECK SELLER STATUS -------------------
@app.route("/check-seller-status", methods=["POST"])
def check_seller_status():
    data = request.json
    email = data.get("email", "").strip()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT fullname, status FROM Sellers WHERE email = %s", (email,))
        row = cursor.fetchone()
        
        if not row:
            return jsonify({"error": "Seller not found", "isApproved": False}), 404

        name, status = row
        status_lower = status.lower()
        
        return jsonify({
            "name": name,
            "email": email,
            "status": status_lower,
            "isApproved": status_lower == "approved"
        }), 200

    except Exception as e:
        print("❌ Error checking seller status:", str(e))
        return jsonify({"error": str(e), "isApproved": False}), 500
    finally:
        conn.close()

# ------------------- GET SINGLE PRODUCT -------------------
@app.route("/products/<int:product_id>", methods=["GET"])
def get_single_product(product_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, title, price, description, category, image, seller_email, seller_name, status
            FROM Products
            WHERE id = %s
        """, (product_id,))
        
        row = cursor.fetchone()
        
        if not row:
            return jsonify({"error": "Product not found"}), 404
        
        product = {
            "id": row[0],
            "title": row[1],
            "price": float(row[2]) if row[2] else 0,
            "description": row[3] if row[3] else "",
            "category": row[4] if row[4] else "",
            "image": row[5] if row[5] else "",
            "sellerId": row[6] if row[6] else "",
            "sellerName": row[7] if row[7] else "",
            "status": row[8] if row[8] else "draft"
        }
        
        return jsonify(product), 200
        
    except Exception as e:
        print("❌ Error fetching product:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ------------------- UPDATE PRODUCT -------------------
@app.route("/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.json
    
    title = data.get("title", "").strip()
    price = data.get("price")
    description = data.get("description", "").strip()
    category = data.get("category", "").strip()
    image = data.get("image", "").strip()
    
    if not title or not price or not description or not category:
        return jsonify({"error": "All required fields must be filled"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT title, price, description, category, image, seller_email, seller_name 
            FROM Products 
            WHERE id = %s
        """, (product_id,))
        product = cursor.fetchone()
        
        if not product:
            return jsonify({"error": "Product not found"}), 404
        
        old_title, old_price, old_desc, old_cat, old_img, seller_email, seller_name = product
        
        old_data = {
            "title": old_title,
            "price": float(old_price),
            "description": old_desc,
            "category": old_cat,
            "image": old_img
        }
        
        new_data = {
            "title": title,
            "price": float(price),
            "description": description,
            "category": category,
            "image": image
        }
        
        cursor.execute("""
            UPDATE Products 
            SET title = %s, price = %s, description = %s, category = %s, image = %s
            WHERE id = %s
        """, (title, float(price), description, category, image, product_id))
        
        conn.commit()
        
        print(f"✏️ Product updated: {title} (ID: {product_id})")
        
        # LOG ACTIVITY
        log_product_activity(
            product_id, 
            seller_email, 
            seller_name, 
            "updated", 
            title,
            old_data=old_data,
            new_data=new_data
        )
        
        # Build change summary
        changes = []
        if old_title != title:
            changes.append(f"• Title: '{old_title}' → '{title}'")
        if float(old_price) != float(price):
            changes.append(f"• Price: ${old_price} → ${price}")
        if old_desc != description:
            changes.append(f"• Description updated")
        if old_cat != category:
            changes.append(f"• Category: {old_cat} → {category}")
        if old_img != image:
            changes.append(f"• Image updated")
        
        change_summary = "\n".join(changes) if changes else "No changes detected"
        
        # SEND EMAIL
        send_activity_email(
            seller_email, 
            seller_name, 
            "updated", 
            title,
            f"Changes made:\n{change_summary}"
        )
        
        return jsonify({"message": "Product updated successfully!"}), 200
        
    except Exception as e:
        print("❌ Error updating product:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ------------------- GET SELLER ACTIVITY -------------------
@app.route("/seller-activity", methods=["GET"])
def get_seller_activity():
    seller_email = request.args.get('sellerId')
    
    if not seller_email:
        return jsonify({"error": "Seller email required"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, product_id, action, product_title, created_at
            FROM ProductActivityLog
            WHERE seller_email = %s
            ORDER BY created_at DESC
            LIMIT 50
        """, (seller_email,))
        
        rows = cursor.fetchall()
        
        activities = [
            {
                "id": row[0],
                "product_id": row[1],
                "action": row[2],
                "product_title": row[3],
                "timestamp": row[4].isoformat() if row[4] else ""
            }
            for row in rows
        ]
        
        return jsonify(activities), 200
        
    except Exception as e:
        print("❌ Error fetching seller activity:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ------------------- FETCH PRODUCTS -------------------
@app.route("/products", methods=["GET"])
def get_products():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, title, price, description, category, image FROM Products WHERE status = 'published'")
        rows = cursor.fetchall()

        products = [
            {
                "id": row[0],
                "title": row[1],
                "price": float(row[2]),
                "description": row[3],
                "category": row[4],
                "image": row[5],
                "rating": {"rate": 4.5, "count": 10},
            }
            for row in rows
        ]
        return jsonify(products)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ------------------- UPDATE SELLER STATUS -------------------
@app.route("/update-seller-status", methods=["POST"])
def update_seller_status():
    data = request.json
    email = data.get("email", "").strip()
    new_status = data.get("status", "").strip().capitalize()

    if not email or not new_status:
        return jsonify({"error": "Email and new status are required"}), 400
    if new_status not in ["Approved", "Rejected"]:
        return jsonify({"error": "Invalid status. Must be Approved or Rejected"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT fullname, status FROM Sellers WHERE email = %s", (email,))
        seller = cursor.fetchone()
        if not seller:
            return jsonify({"error": "Seller not found"}), 404

        name, old_status = seller
        if old_status == new_status:
            return jsonify({"message": f"Seller is already {new_status}."}), 200

        cursor.execute("UPDATE Sellers SET status = %s WHERE email = %s", (new_status, email))
        conn.commit()

        subject = "Seller Account Status Update"
        if new_status == "Approved":
            body = f"""
Hello {name},

🎉 Congratulations! Your seller account has been APPROVED by our team.

You can now start adding products and selling on our platform.

Thank you,
MyStore Team
"""
        else:
            body = f"""
Hello {name},

We regret to inform you that your seller application has been REJECTED.

If you believe this is a mistake or would like to reapply, please contact our support team.

Best regards,
MyStore Team
"""

        msg = MIMEMultipart()
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))

        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)

        return jsonify({"message": f"Seller status updated to {new_status} and email sent."})

    except Exception as e:
        print("❌ Error updating seller status:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ------------------- CONTACT US -------------------
@app.route("/contact-us", methods=["POST"])
def contact_us():
    data = request.json
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    subject = data.get("subject", "").strip()
    message = data.get("message", "").strip()

    if not name or not email or not message:
        return jsonify({"error": "Name, email, and message are required"}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Invalid email format"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO ContactMessages (name, email, subject, message, status)
            VALUES (%s, %s, %s, %s, %s)
        """, (name, email, subject or "General Inquiry", message, "New"))
        
        conn.commit()
        print(f"💬 Contact message saved from {name} ({email})")

        user_subject = "We Received Your Message! 📧"
        user_body = f"""
Hello {name},

Thank you for contacting MyStore!

We have received your message and will get back to you within 24-48 hours.

Your Message:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject: {subject or 'General Inquiry'}

{message}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Best regards,
MyStore Support Team

---
This is an automated confirmation email.
"""

        msg = MIMEMultipart()
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = email
        msg["Subject"] = user_subject
        msg.attach(MIMEText(user_body, "plain", "utf-8"))

        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)

        print(f"📧 Confirmation email sent to {email}")

        admin_subject = f"🔔 New Contact Message from {name}"
        admin_body = f"""
New contact form submission:

From: {name}
Email: {email}
Subject: {subject or 'General Inquiry'}

Message:
{message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Received at: {time.strftime('%B %d, %Y at %I:%M %p')}
"""

        admin_msg = MIMEMultipart()
        admin_msg["From"] = EMAIL_ADDRESS
        admin_msg["To"] = EMAIL_ADDRESS
        admin_msg["Subject"] = admin_subject
        admin_msg.attach(MIMEText(admin_body, "plain", "utf-8"))

        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(admin_msg)

        print(f"📧 Admin notification sent")

        return jsonify({
            "message": "Thank you for contacting us! We'll get back to you soon.",
            "success": True
        }), 200

    except Exception as e:
        print("❌ Error processing contact form:", str(e))
        return jsonify({"error": f"Failed to send message: {str(e)}"}), 500
    finally:
        if conn:
            conn.close()

# ------------------- GET ALL CONTACT MESSAGES -------------------
@app.route("/admin/contact-messages", methods=["GET"])
def get_contact_messages():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, name, email, subject, message, created_at, status
            FROM ContactMessages
            ORDER BY created_at DESC
        """)
        
        rows = cursor.fetchall()
        
        messages = [
            {
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "subject": row[3],
                "message": row[4],
                "createdAt": row[5].isoformat() if row[5] else "",
                "status": row[6]
            }
            for row in rows
        ]
        
        return jsonify(messages), 200
        
    except Exception as e:
        print("❌ Error fetching contact messages:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# # ------------------- CHATBOT WITH OLLAMA -------------------
# @app.route("/chat", methods=["POST"])
# def chat():
#     data = request.json
#     user_message = data.get("message", "").strip()
    
#     if not user_message:
#         return jsonify({"error": "Message is required"}), 400
    
#     print(f"\n{'='*60}")
#     print(f"📨 Incoming message: {user_message}")
#     print(f"{'='*60}")
    
#     try:
#         system_prompt = """You are Emma, a friendly AI customer support assistant for MyStore, an e-commerce platform. 
#         You help customers with:
#         - Product inquiries
#         - Order tracking
#         - Return policies
#         - Account issues
#         - General shopping questions
        
#         Be friendly, professional, and concise. If you don't know something, admit it and suggest contacting support."""
        
#         print("🤖 Calling Ollama with llama3.2:1b...")
        
#         response = ollama.chat(
#             model='llama3.2:1b',
#             messages=[
#                 {'role': 'system', 'content': system_prompt},
#                 {'role': 'user', 'content': user_message}
#             ],
#             options={
#                 'temperature': 0.7,
#                 'num_predict': 150
#             }
#         )
        
#         bot_reply = response['message']['content']
        
#         print(f"✅ Bot replied: {bot_reply[:100]}...")
#         print(f"{'='*60}\n")
        
#         return jsonify({
#             "reply": bot_reply,
#             "success": True,
#             "timestamp": time.strftime('%Y-%m-%d %H:%M:%S')
#         }), 200
        
#     except Exception as e:
#         import traceback
#         error_details = traceback.format_exc()
        
#         print(f"❌ ERROR!")
#         print(f"   Type: {type(e).__name__}")
#         print(f"   Message: {str(e)}")
#         print(error_details)
#         print(f"{'='*60}\n")
        
#         fallback_responses = {
#             "shipping": "We offer free shipping on orders over $50! Standard delivery takes 3-5 business days. 📦",
#             "return": "We have a hassle-free 30-day return policy! Email support@mystore.com with your order number. 🔄",
#             "payment": "We accept all major credit cards, PayPal, and debit cards. All transactions are SSL secured. 💳",
#             "default": "I'm having trouble connecting right now. Please email us at support@mystore.com or call 1-800-MYSTORE. We're here 24/7! 😊"
#         }
        
#         user_lower = user_message.lower()
#         if any(word in user_lower for word in ['ship', 'delivery', 'track']):
#             fallback = fallback_responses['shipping']
#         elif any(word in user_lower for word in ['return', 'refund', 'exchange']):
#             fallback = fallback_responses['return']
#         elif any(word in user_lower for word in ['pay', 'payment', 'credit', 'card']):
#             fallback = fallback_responses['payment']
#         else:
#             fallback = fallback_responses['default']
        
#         return jsonify({
#             "reply": fallback,
#             "success": False,
#             "fallback": True,
#             "error_type": type(e).__name__,
#             "error_message": str(e)
#         }), 200

# # ------------------- CHAT WITH CONVERSATION HISTORY -------------------
# @app.route("/chat-with-history", methods=["POST"])
# def chat_with_history():
#     data = request.json
#     user_message = data.get("message", "").strip()
#     conversation_history = data.get("history", [])
    
#     if not user_message:
#         return jsonify({"error": "Message is required"}), 400
    
#     try:
#         system_prompt = """You are Emma, MyStore's friendly AI assistant. You help customers with shopping, orders, returns, and general questions. Be helpful, concise, and friendly!"""
        
#         messages = [{'role': 'system', 'content': system_prompt}]
#         messages.extend(conversation_history[-6:])
#         messages.append({'role': 'user', 'content': user_message})
    
#         response = ollama.chat(
#             model='llama3.2:1b',  
#             messages=messages,
#             options={
#                 'temperature': 0.7,
#                 'num_predict': 150
#             }
#         )
        
#         bot_reply = response['message']['content']
        
#         return jsonify({
#             "reply": bot_reply,
#             "success": True,
#             "timestamp": time.strftime('%Y-%m-%d %H:%M:%S')
#         }), 200
        
#     except Exception as e:
#         print(f"❌ Chatbot Error: {str(e)}")
#         return jsonify({
#             "reply": "I'm experiencing technical difficulties. Please try again or contact support@mystore.com 💙",
#             "success": False,
#             "fallback": True
#         }), 200

# # ------------------- SMART PRODUCT SEARCH CHATBOT -------------------
# @app.route("/chat-product-search", methods=["POST"])
# def chat_product_search():
#     data = request.json
#     user_message = data.get("message", "").strip()
    
#     if not user_message:
#         return jsonify({"error": "Message is required"}), 400
    
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         cursor.execute("""
#             SELECT title, price, category, image 
#             FROM Products 
#             WHERE status = 'published' 
#             AND (title ILIKE %s OR category ILIKE %s OR description ILIKE %s)
#             LIMIT 3
#         """, (f'%{user_message}%', f'%{user_message}%', f'%{user_message}%'))
        
#         products = cursor.fetchall()
#         conn.close()
        
#         if products:
#             product_info = "\n".join([
#                 f"- {p[0]} (${p[1]}) in {p[2]} category"
#                 for p in products
#             ])
            
#             enhanced_prompt = f"""You are Emma, MyStore's AI assistant. 

# The customer asked: "{user_message}"

# We found these relevant products in our store:
# {product_info}

# Recommend these products naturally and mention their prices. Be enthusiastic but not pushy!"""
        
#             response = ollama.chat(
#                 model='llama3.2:1b',
#                 messages=[
#                     {'role': 'system', 'content': enhanced_prompt},
#                     {'role': 'user', 'content': user_message}
#                 ],
#                 options={'temperature': 0.8, 'num_predict': 200}
#             )
            
#             return jsonify({
#                 "reply": response['message']['content'],
#                 "products": [
#                     {
#                         "title": p[0],
#                         "price": float(p[1]),
#                         "category": p[2],
#                         "image": p[3]
#                     } for p in products
#                 ],
#                 "success": True
#             }), 200
        
#         system_prompt = """You are Emma, a helpful shopping assistant for MyStore. The customer is asking about products we might not have. Politely let them know and suggest browsing our categories or contacting support."""
        
#         response = ollama.chat(
#             model='llama3.2:1b',  
#             messages=[
#                 {'role': 'system', 'content': system_prompt},
#                 {'role': 'user', 'content': user_message}
#             ]
#         )
        
#         return jsonify({
#             "reply": response['message']['content'],
#             "products": [],
#             "success": True
#         }), 200
        
#     except Exception as e:
#         print(f"❌ Product Search Error: {str(e)}")
#         return jsonify({
#             "reply": "I'm having trouble searching products right now. Please browse our categories or contact support! 🛍️",
#             "success": False
#         }), 200

# ------------------- RUN APP -------------------
if __name__ == "__main__":
    app.run(port=5000, debug=True)
