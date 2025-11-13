-- --------------------- Create Database ---------------------
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'SignupDB')
BEGIN
    CREATE DATABASE SignupDB;
END
GO

USE SignupDB;
GO

-- --------------------- Drop dependent tables first ---------------------
IF OBJECT_ID('OrderItems', 'U') IS NOT NULL
    DROP TABLE OrderItems;
GO

IF OBJECT_ID('Orders', 'U') IS NOT NULL
    DROP TABLE Orders;
GO

IF OBJECT_ID('Users', 'U') IS NOT NULL
    DROP TABLE Users;
GO

------------------------ Users Table ---------------------
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL
);
GO

-- --------------------- Orders Table ---------------------
CREATE TABLE Orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(100) NOT NULL,
    fullName NVARCHAR(100) NOT NULL,
    totalPrice DECIMAL(10,2) NOT NULL,
    address NVARCHAR(255),
    city NVARCHAR(100),
    state NVARCHAR(100),
    pincode NVARCHAR(20)
);
GO

-- --------------------- OrderItems Table ---------------------
CREATE TABLE OrderItems (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL FOREIGN KEY REFERENCES Orders(id),
    title NVARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL
);
GO

select * from OrderItems

-- Count how many orders a user has placed
SELECT email, COUNT(*) AS total_orders
FROM Orders
WHERE email = 'shashankgowni09@gmail.com'
GROUP BY email;
select * from Users

CREATE TABLE ContactMessages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    subject NVARCHAR(200),
    message NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    status NVARCHAR(20) DEFAULT 'New'
);

select * from ContactMessages