-- ==============================
-- 📦 COMPLETE SELLERDB SETUP - FINAL VERSION
-- ==============================

USE SellerDB;
GO

PRINT '========================================';
PRINT '🚀 STARTING SELLERDB SETUP';
PRINT '========================================';
GO

-- ==============================
-- 1️⃣ ADD MISSING COLUMNS TO SELLERS TABLE
-- ==============================
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Sellers' AND COLUMN_NAME = 'created_at'
)
BEGIN
    ALTER TABLE Sellers ADD created_at DATETIME DEFAULT GETDATE();
    PRINT '✅ Added created_at column to Sellers table';
END
ELSE
BEGIN
    PRINT '⚠️ created_at column already exists in Sellers table';
END
GO

select * from Sellers

UPDATE Sellers SET created_at = GETDATE() WHERE created_at IS NULL;
GO

-- ==============================
-- 2️⃣ ADD MISSING COLUMNS TO PRODUCTS TABLE
-- ==============================
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Products' AND COLUMN_NAME = 'seller_email'
)
BEGIN
    ALTER TABLE Products ADD seller_email NVARCHAR(255);
    PRINT '✅ Added seller_email column to Products table';
END
ELSE
BEGIN
    PRINT '⚠️ seller_email column already exists in Products';
END
GO

IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Products' AND COLUMN_NAME = 'seller_name'
)
BEGIN
    ALTER TABLE Products ADD seller_name NVARCHAR(255);
    PRINT '✅ Added seller_name column to Products table';
END
ELSE
BEGIN
    PRINT '⚠️ seller_name column already exists in Products';
END
GO

IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Products' AND COLUMN_NAME = 'created_at'
)
BEGIN
    ALTER TABLE Products ADD created_at DATETIME DEFAULT GETDATE();
    PRINT '✅ Added created_at column to Products table';
END
ELSE
BEGIN
    PRINT '⚠️ created_at column already exists in Products';
END
GO

IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Products' AND COLUMN_NAME = 'status'
)
BEGIN
    ALTER TABLE Products ADD status NVARCHAR(20) DEFAULT 'draft';
    PRINT '✅ Added status column to Products table';
END
ELSE
BEGIN
    PRINT '⚠️ status column already exists in Products';
END
GO

UPDATE Products SET status = 'draft' WHERE status IS NULL;
GO

-- ==============================
-- 3️⃣ ✨ CREATE ACTIVITY LOG TABLE
-- ==============================

-- Drop if exists (to fix any previous errors)
IF OBJECT_ID('ProductActivityLog', 'U') IS NOT NULL
BEGIN
    DROP TABLE ProductActivityLog;
    PRINT '🗑️ Dropped existing ProductActivityLog table';
END
GO

-- Create with seller_email NVARCHAR(100) to match Sellers.email exactly
CREATE TABLE ProductActivityLog (
    id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT,
    seller_email NVARCHAR(100) NOT NULL,  -- ✅ Matches Sellers.email NVARCHAR(100)
    seller_name NVARCHAR(255),
    action NVARCHAR(50) NOT NULL,
    product_title NVARCHAR(255),
    old_data NVARCHAR(MAX),
    new_data NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (seller_email) REFERENCES Sellers(email)
);
GO

PRINT '✅ ProductActivityLog table created with seller_email NVARCHAR(100)!';
GO

-- ==============================
-- 4️⃣ CREATE INDEXES FOR PERFORMANCE
-- ==============================
CREATE INDEX idx_seller_email ON ProductActivityLog(seller_email);
CREATE INDEX idx_product_id ON ProductActivityLog(product_id);
CREATE INDEX idx_created_at ON ProductActivityLog(created_at DESC);
GO

PRINT '✅ Indexes created on ProductActivityLog!';
GO

-- ==============================
-- 5️⃣ ENABLE DATABASE MAIL
-- ==============================
EXEC sp_configure 'show advanced options', 1;
RECONFIGURE;
EXEC sp_configure 'Database Mail XPs', 1;
RECONFIGURE;
GO

PRINT '✅ Database Mail enabled';
GO

-- ==============================
-- 6️⃣ DROP OLD TRIGGER IF EXISTS
-- ==============================
IF OBJECT_ID('trg_SendApprovalEmail', 'TR') IS NOT NULL
BEGIN
    DROP TRIGGER trg_SendApprovalEmail;
    PRINT '🗑️ Old trigger dropped';
END
GO

-- ==============================
-- 7️⃣ CREATE TRIGGER FOR SELLER APPROVAL/REJECTION
-- ==============================
CREATE TRIGGER trg_SendApprovalEmail
ON Sellers
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Email NVARCHAR(100);
    DECLARE @Name NVARCHAR(255);
    DECLARE @StoreName NVARCHAR(255);
    DECLARE @NewStatus NVARCHAR(50);
    DECLARE @OldStatus NVARCHAR(50);

    SELECT 
        @Email = i.email,
        @Name = i.fullname,
        @StoreName = i.store_name,
        @NewStatus = LOWER(i.status),
        @OldStatus = LOWER(d.status)
    FROM inserted i
    INNER JOIN deleted d ON i.id = d.id;

    IF (@OldStatus <> @NewStatus AND @NewStatus IN ('approved', 'rejected'))
    BEGIN
        DECLARE @subject NVARCHAR(255);
        DECLARE @body NVARCHAR(MAX);

        IF (@NewStatus = 'approved')
        BEGIN
            SET @subject = 'Your Seller Account is Approved ✅';
            SET @body = 
                'Hello ' + @Name + ',' + CHAR(13) + CHAR(10) + CHAR(13) + CHAR(10) +
                'Congratulations! Your seller account has been APPROVED by our team.' + CHAR(13) + CHAR(10) + CHAR(13) + CHAR(10) +
                'You can now log in and start adding your products to sell on our platform.' + CHAR(13) + CHAR(10) + CHAR(13) + CHAR(10) +
                'Store Name: ' + @StoreName + CHAR(13) + CHAR(10) + CHAR(13) + CHAR(10) +
                'Login here: http://localhost:5173/seller-login' + CHAR(13) + CHAR(10) + CHAR(13) + CHAR(10) +
                'Best regards,' + CHAR(13) + CHAR(10) +
                'MyStore Team';
        END
        ELSE IF (@NewStatus = 'rejected')
        BEGIN
            SET @subject = 'Seller Application Status Update';
            SET @body = 
                'Hello ' + @Name + ',' + CHAR(13) + CHAR(10) + CHAR(13) + CHAR(10) +
                'We regret to inform you that your seller application has been REJECTED.' + CHAR(13) + CHAR(10) + CHAR(13) + CHAR(10) +
                'If you believe this is a mistake or would like to reapply, please contact our support team.' + CHAR(13) + CHAR(10) + CHAR(13) + CHAR(10) +
                'Store Name: ' + @StoreName + CHAR(13) + CHAR(10) + CHAR(13) + CHAR(10) +
                'Best regards,' + CHAR(13) + CHAR(10) +
                'MyStore Team';
        END

        BEGIN TRY
            EXEC msdb.dbo.sp_send_dbmail
                @profile_name = 'SellerMailProfile',
                @recipients = @Email,
                @subject = @subject,
                @body = @body;
            
            PRINT '✅ Email sent to: ' + @Email + ' (Status: ' + @NewStatus + ')';
        END TRY
        BEGIN CATCH
            PRINT '❌ Email failed: ' + ERROR_MESSAGE();
        END CATCH
    END
END
GO

PRINT '✅ Trigger created successfully!';
GO

-- ==============================
-- 8️⃣ VERIFICATION: TABLE STRUCTURES
-- ==============================
PRINT '';
PRINT '========================================';
PRINT '📋 SELLERS TABLE STRUCTURE';
PRINT '========================================';
SELECT 
    COLUMN_NAME AS ColumnName,
    DATA_TYPE AS DataType,
    CHARACTER_MAXIMUM_LENGTH AS MaxLength,
    IS_NULLABLE AS Nullable
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Sellers'
ORDER BY ORDINAL_POSITION;
GO

PRINT '';
PRINT '========================================';
PRINT '📋 PRODUCTS TABLE STRUCTURE';
PRINT '========================================';
SELECT 
    COLUMN_NAME AS ColumnName,
    DATA_TYPE AS DataType,
    CHARACTER_MAXIMUM_LENGTH AS MaxLength,
    IS_NULLABLE AS Nullable
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Products'
ORDER BY ORDINAL_POSITION;
GO

PRINT '';
PRINT '========================================';
PRINT '📋 PRODUCTACTIVITYLOG TABLE STRUCTURE';
PRINT '========================================';
SELECT 
    COLUMN_NAME AS ColumnName,
    DATA_TYPE AS DataType,
    CHARACTER_MAXIMUM_LENGTH AS MaxLength,
    IS_NULLABLE AS Nullable
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'ProductActivityLog'
ORDER BY ORDINAL_POSITION;
GO

-- ==============================
-- 9️⃣ VERIFICATION: TRIGGERS
-- ==============================
PRINT '';
PRINT '========================================';
PRINT '🔔 ACTIVE TRIGGERS';
PRINT '========================================';
SELECT 
    name AS TriggerName,
    OBJECT_NAME(parent_id) AS TableName,
    is_disabled AS IsDisabled,
    create_date AS CreatedOn
FROM sys.triggers
WHERE parent_id = OBJECT_ID('Sellers');
GO

-- ==============================
-- 🔟 DATABASE SUMMARY
-- ==============================
PRINT '';
PRINT '========================================';
PRINT '📊 DATABASE SUMMARY';
PRINT '========================================';

DECLARE @TotalSellers INT = (SELECT COUNT(*) FROM Sellers);
DECLARE @ApprovedSellers INT = (SELECT COUNT(*) FROM Sellers WHERE status = 'Approved');
DECLARE @PendingSellers INT = (SELECT COUNT(*) FROM Sellers WHERE status = 'Pending');
DECLARE @RejectedSellers INT = (SELECT COUNT(*) FROM Sellers WHERE status = 'Rejected');
DECLARE @TotalProducts INT = (SELECT COUNT(*) FROM Products);
DECLARE @PublishedProducts INT = (SELECT COUNT(*) FROM Products WHERE status = 'published');
DECLARE @DraftProducts INT = (SELECT COUNT(*) FROM Products WHERE status = 'draft');
DECLARE @TotalActivities INT = (SELECT COUNT(*) FROM ProductActivityLog);

PRINT '👥 Total Sellers: ' + CAST(@TotalSellers AS VARCHAR);
PRINT '   ✅ Approved: ' + CAST(@ApprovedSellers AS VARCHAR);
PRINT '   🕒 Pending: ' + CAST(@PendingSellers AS VARCHAR);
PRINT '   ❌ Rejected: ' + CAST(@RejectedSellers AS VARCHAR);
PRINT '';
PRINT '📦 Total Products: ' + CAST(@TotalProducts AS VARCHAR);
PRINT '   ✅ Published: ' + CAST(@PublishedProducts AS VARCHAR);
PRINT '   📝 Drafts: ' + CAST(@DraftProducts AS VARCHAR);
PRINT '';
PRINT '📋 Total Activities Logged: ' + CAST(@TotalActivities AS VARCHAR);
PRINT '========================================';
GO

-- ==============================
-- 1️⃣1️⃣ VIEW YOUR SELLER INFO
-- ==============================
PRINT '';
PRINT '========================================';
PRINT '👤 YOUR SELLER INFO';
PRINT '========================================';
SELECT 
    id,
    fullname,
    email,
    store_name,
    status,
    created_at
FROM Sellers
WHERE email = 'shashankgowni09@gmail.com';
GO

-- ==============================
-- 1️⃣2️⃣ VIEW ALL PRODUCTS
-- ==============================
PRINT '';
PRINT '========================================';
PRINT '📦 ALL PRODUCTS';
PRINT '========================================';
SELECT 
    id,
    title,
    price,
    category,
    status,
    seller_name,
    seller_email,
    created_at
FROM Products
ORDER BY created_at DESC;
GO

-- ==============================
-- 1️⃣3️⃣ VIEW RECENT ACTIVITY LOG
-- ==============================
PRINT '';
PRINT '========================================';
PRINT '📋 RECENT ACTIVITY LOG (Last 10)';
PRINT '========================================';
IF EXISTS (SELECT * FROM ProductActivityLog)
BEGIN
    SELECT TOP 10
        id,
        action,
        product_title,
        seller_name,
        created_at
    FROM ProductActivityLog
    ORDER BY created_at DESC;
END
ELSE
BEGIN
    PRINT 'No activities logged yet.';
END
GO

-- ==============================
-- ✅ SETUP COMPLETE!
-- ==============================
PRINT '';
PRINT '========================================';
PRINT '✅ SETUP COMPLETE!';
PRINT '========================================';
PRINT '';
PRINT '✨ WHAT WAS CREATED:';
PRINT '   • Sellers table - updated with created_at';
PRINT '   • Products table - added seller_email, seller_name, created_at, status';
PRINT '   • ProductActivityLog table - tracks all product changes';
PRINT '   • Indexes - for fast queries on activity log';
PRINT '   • Email trigger - sends email on approve/reject';
PRINT '';
PRINT '📝 WHAT YOU CAN DO NOW:';
PRINT '   1. Approve/Reject sellers (email sent automatically)';
PRINT '   2. Track all product changes in ProductActivityLog';
PRINT '   3. Sellers can login and manage products';
PRINT '   4. Activity feed shows in seller dashboard';
PRINT '';
PRINT '🚀 NEXT STEPS:';
PRINT '   1. Restart your Flask backend (python app.py)';
PRINT '   2. Test seller login and product management';
PRINT '   3. Check activity tracking in dashboard';
PRINT '';
PRINT '========================================';
GO

-- ==============================
-- QUICK ADMIN COMMANDS (For Reference)
-- ==============================
PRINT '';
PRINT '========================================';
PRINT '📝 QUICK ADMIN COMMANDS';
PRINT '========================================';
PRINT '';
PRINT '-- Approve a seller:';
PRINT 'UPDATE Sellers SET status = ''Approved'' WHERE email = ''shashankgowni09@gmail.com'';';
PRINT '';
PRINT '-- Reject a seller:';
PRINT 'UPDATE Sellers SET status = ''Rejected'' WHERE email = ''shashankgowni09@gmail.com'';';
PRINT '';
PRINT '-- View pending sellers:';
PRINT 'SELECT id, fullname, email, store_name FROM Sellers WHERE status = ''Pending'';';
PRINT '';
PRINT '-- Check last email sent:';
PRINT 'SELECT TOP 1 * FROM msdb.dbo.sysmail_mailitems ORDER BY send_request_date DESC;';
PRINT '';
PRINT '========================================';
GO

-- ==============================
-- 1️⃣ VIEW ALL SELLERS
-- ==============================
SELECT 
    id,
    fullname AS Name,
    email AS Email,
    store_name AS StoreName,
    store_description AS Description,
    status AS Status,
    created_at AS RegisteredOn
FROM Sellers
ORDER BY id DESC;
GO

-- ==============================
-- 2️⃣ VIEW ALL PRODUCTS
-- ==============================
SELECT 
    id,
    title AS ProductName,
    price AS Price,
    description AS Description,
    category AS Category,
    status AS Status,
    seller_name AS SellerName,
    seller_email AS SellerEmail,
    image AS ImageURL,
    created_at AS AddedOn
FROM Products
ORDER BY id DESC;
GO

-- ==============================
-- 3️⃣ VIEW ACTIVITY LOG
-- ==============================
SELECT 
    id,
    product_id AS ProductID,
    action AS Action,
    product_title AS ProductName,
    seller_name AS SellerName,
    seller_email AS SellerEmail,
    created_at AS ActionTime
FROM ProductActivityLog
ORDER BY created_at DESC;


-- Check if table exists
SELECT * FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'ProductActivityLog';
GO

-- Check table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'ProductActivityLog'
ORDER BY ORDINAL_POSITION;
GO

-- Check row count
SELECT COUNT(*) AS TotalRows FROM ProductActivityLog;
GO

-- Try to view data (will be empty if no actions yet)
SELECT * FROM ProductActivityLog;
GO