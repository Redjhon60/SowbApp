/**
 * School Manager Pro - Electron Main Process
 * Handles window creation, IPC, database, backup
 */

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

// Database path
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'school_manager.db');
const backupsPath = path.join(userDataPath, 'backups');
const docsPath = path.join(userDataPath, 'documents');
const receiptsPath = path.join(userDataPath, 'receipts');

// Ensure directories exist
[backupsPath, docsPath, receiptsPath].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Set DATABASE_URL for Prisma
process.env.DATABASE_URL = `file:${dbPath}`;

let db;
let mainWindow;

function initDatabase() {
  try {
    const Database = require('better-sqlite3');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    createTables();
    seedDefaults();
    console.log('Database initialized:', dbPath);
  } catch (err) {
    console.error('DB init error:', err);
  }
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'secretaire',
      name TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      level TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      photo TEXT,
      gender TEXT DEFAULT 'M',
      dateOfBirth TEXT,
      address TEXT,
      parentName TEXT NOT NULL,
      parentPhone TEXT NOT NULL,
      emergencyPhone TEXT,
      classId INTEGER NOT NULL,
      registrationDate TEXT DEFAULT (datetime('now')),
      hasTransport INTEGER DEFAULT 0,
      insurancePaid INTEGER DEFAULT 0,
      monthlyFee REAL DEFAULT 0,
      transportFee REAL DEFAULT 0,
      insuranceFee REAL DEFAULT 0,
      notes TEXT,
      active INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (classId) REFERENCES classes(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receiptNumber TEXT UNIQUE NOT NULL,
      studentId INTEGER NOT NULL,
      type TEXT NOT NULL,
      month TEXT,
      amount REAL NOT NULL,
      amountPaid REAL NOT NULL,
      remaining REAL DEFAULT 0,
      paymentDate TEXT DEFAULT (datetime('now')),
      paymentMethod TEXT DEFAULT 'especes',
      notes TEXT,
      receiptPdf TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (studentId) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cin TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      role TEXT NOT NULL,
      salary REAL NOT NULL DEFAULT 0,
      hiringDate TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      notes TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS salaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeId INTEGER NOT NULL,
      month TEXT NOT NULL,
      baseSalary REAL NOT NULL,
      bonus REAL DEFAULT 0,
      advance REAL DEFAULT 0,
      netSalary REAL NOT NULL,
      paidDate TEXT,
      isPaid INTEGER DEFAULT 0,
      notes TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (employeeId) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT,
      description TEXT,
      receipt TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS buses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      plateNumber TEXT UNIQUE NOT NULL,
      capacity INTEGER NOT NULL,
      driverId INTEGER,
      route TEXT,
      active INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      classId INTEGER NOT NULL,
      day TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      subject TEXT NOT NULL,
      teacher TEXT NOT NULL,
      room TEXT,
      FOREIGN KEY (classId) REFERENCES classes(id)
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId INTEGER,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      filePath TEXT NOT NULL,
      fileSize INTEGER,
      mimeType TEXT,
      description TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (studentId) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS backups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      filePath TEXT NOT NULL,
      size INTEGER,
      type TEXT DEFAULT 'auto',
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);
}

function seedDefaults() {
  // Default admin user (password: admin123)
  const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!adminExists) {
    db.prepare(`INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)`)
      .run('admin', 'admin123', 'admin', 'Administrateur');
    db.prepare(`INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)`)
      .run('comptable', 'compta123', 'comptable', 'Comptable');
    db.prepare(`INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)`)
      .run('secretaire', 'secr123', 'secretaire', 'Secrétaire');
  }

  // Default classes
  const classCount = db.prepare('SELECT COUNT(*) as c FROM classes').get();
  if (classCount.c === 0) {
    const classes = [
      { name: 'PS', level: 'Préscolaire' },
      { name: 'MS', level: 'Préscolaire' },
      { name: 'GS', level: 'Préscolaire' },
      { name: 'CP', level: 'Primaire' },
      { name: 'CE1', level: 'Primaire' },
      { name: 'CE2', level: 'Primaire' },
      { name: 'CM1', level: 'Primaire' },
      { name: 'CM2', level: 'Primaire' },
      { name: '6EME', level: 'Collège' },
      { name: '1AC', level: 'Collège' },
      { name: '2AC', level: 'Collège' },
      { name: '3AC', level: 'Collège' },
      { name: 'TC', level: 'Lycée' },
      { name: '1BAC', level: 'Lycée' },
      { name: '2BAC', level: 'Lycée' },
    ];
    const insertClass = db.prepare('INSERT INTO classes (name, level) VALUES (?, ?)');
    classes.forEach(c => insertClass.run(c.name, c.level));
  }

  // Default settings
  const defaultSettings = [
    ['school_name', 'Le Schéma'],
    ['school_address', 'Maroc'],
    ['school_phone', '+212 000 000 000'],
    ['school_email', 'contact@leschema.ma'],
    ['currency', 'DH'],
    ['theme', 'dark'],
    ['language', 'fr'],
    ['backup_auto', '1'],
    ['backup_frequency', 'daily'],
    ['insurance_fee', '300'],
    ['receipt_footer', 'Merci de votre confiance - Le Schéma'],
  ];
  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  defaultSettings.forEach(([k, v]) => insertSetting.run(k, v));
}

// ========================
// IPC HANDLERS
// ========================

// AUTH
ipcMain.handle('auth:login', (_, { username, password }) => {
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ? AND active = 1').get(username, password);
  if (user) {
    const { password: _, ...safeUser } = user;
    return { success: true, user: safeUser };
  }
  return { success: false, error: 'Identifiants incorrects' };
});

// DASHBOARD
ipcMain.handle('dashboard:stats', () => {
  const totalStudents = db.prepare('SELECT COUNT(*) as c FROM students WHERE active = 1').get().c;
  const totalTeachers = db.prepare("SELECT COUNT(*) as c FROM employees WHERE role = 'professeur' AND active = 1").get().c;
  const totalEmployees = db.prepare('SELECT COUNT(*) as c FROM employees WHERE active = 1').get().c;
  const paidStudents = db.prepare(`
    SELECT COUNT(DISTINCT studentId) as c FROM payments 
    WHERE type = 'mensualite' AND strftime('%Y-%m', paymentDate) = strftime('%Y-%m', 'now')
  `).get().c;
  const transportStudents = db.prepare('SELECT COUNT(*) as c FROM students WHERE hasTransport = 1 AND active = 1').get().c;
  const insurancePaid = db.prepare('SELECT COUNT(*) as c FROM students WHERE insurancePaid = 1 AND active = 1').get().c;

  const monthlyRevenue = db.prepare(`
    SELECT COALESCE(SUM(amountPaid), 0) as total FROM payments 
    WHERE strftime('%Y-%m', paymentDate) = strftime('%Y-%m', 'now')
  `).get().total;

  const yearlyRevenue = db.prepare(`
    SELECT COALESCE(SUM(amountPaid), 0) as total FROM payments 
    WHERE strftime('%Y', paymentDate) = strftime('%Y', 'now')
  `).get().total;

  const monthlyExpenses = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM expenses 
    WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
  `).get().total;

  const yearlyExpenses = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM expenses 
    WHERE strftime('%Y', date) = strftime('%Y', 'now')
  `).get().total;

  // Monthly revenue chart (last 12 months)
  const monthlyChart = db.prepare(`
    SELECT strftime('%Y-%m', paymentDate) as month, SUM(amountPaid) as total
    FROM payments
    WHERE paymentDate >= date('now', '-12 months')
    GROUP BY month ORDER BY month
  `).all();

  // Monthly expenses chart
  const expensesChart = db.prepare(`
    SELECT strftime('%Y-%m', date) as month, SUM(amount) as total
    FROM expenses
    WHERE date >= date('now', '-12 months')
    GROUP BY month ORDER BY month
  `).all();

  // Students per class
  const classChart = db.prepare(`
    SELECT c.name, COUNT(s.id) as count
    FROM classes c LEFT JOIN students s ON s.classId = c.id AND s.active = 1
    GROUP BY c.id ORDER BY c.id
  `).all();

  // Recent payments
  const recentPayments = db.prepare(`
    SELECT p.*, s.firstName || ' ' || s.lastName as studentName, c.name as className
    FROM payments p
    JOIN students s ON s.id = p.studentId
    JOIN classes c ON c.id = s.classId
    ORDER BY p.createdAt DESC LIMIT 10
  `).all();

  // Recent expenses
  const recentExpenses = db.prepare('SELECT * FROM expenses ORDER BY createdAt DESC LIMIT 5').all();

  return {
    totalStudents, totalTeachers, totalEmployees,
    paidStudents, unpaidStudents: totalStudents - paidStudents,
    transportStudents, insurancePaid,
    monthlyRevenue, yearlyRevenue,
    monthlyExpenses, yearlyExpenses,
    profit: monthlyRevenue - monthlyExpenses,
    monthlyChart, expensesChart, classChart,
    recentPayments, recentExpenses
  };
});

// STUDENTS
ipcMain.handle('students:list', (_, filters = {}) => {
  let query = `
    SELECT s.*, c.name as className, c.level as classLevel
    FROM students s JOIN classes c ON c.id = s.classId
    WHERE s.active = 1
  `;
  const params = [];
  if (filters.classId) { query += ' AND s.classId = ?'; params.push(filters.classId); }
  if (filters.search) {
    query += ' AND (s.firstName LIKE ? OR s.lastName LIKE ? OR s.code LIKE ? OR s.parentPhone LIKE ?)';
    const q = `%${filters.search}%`;
    params.push(q, q, q, q);
  }
  query += ' ORDER BY s.lastName, s.firstName';
  return db.prepare(query).all(...params);
});

ipcMain.handle('students:get', (_, id) => {
  const student = db.prepare(`
    SELECT s.*, c.name as className FROM students s 
    JOIN classes c ON c.id = s.classId WHERE s.id = ?
  `).get(id);
  const payments = db.prepare('SELECT * FROM payments WHERE studentId = ? ORDER BY paymentDate DESC').all(id);
  return { ...student, payments };
});

ipcMain.handle('students:create', (_, data) => {
  const code = generateStudentCode();
  const stmt = db.prepare(`
    INSERT INTO students (code, firstName, lastName, photo, gender, dateOfBirth, address, 
    parentName, parentPhone, emergencyPhone, classId, hasTransport, insurancePaid, 
    monthlyFee, transportFee, insuranceFee, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    code, data.firstName, data.lastName, data.photo || null,
    data.gender, data.dateOfBirth || null, data.address || null,
    data.parentName, data.parentPhone, data.emergencyPhone || null,
    data.classId, data.hasTransport ? 1 : 0, data.insurancePaid ? 1 : 0,
    data.monthlyFee || 0, data.transportFee || 0, data.insuranceFee || 0,
    data.notes || null
  );
  return { id: result.lastInsertRowid, code };
});

ipcMain.handle('students:update', (_, { id, ...data }) => {
  db.prepare(`
    UPDATE students SET firstName=?, lastName=?, photo=?, gender=?, dateOfBirth=?, 
    address=?, parentName=?, parentPhone=?, emergencyPhone=?, classId=?, 
    hasTransport=?, insurancePaid=?, monthlyFee=?, transportFee=?, insuranceFee=?, 
    notes=?, updatedAt=datetime('now') WHERE id=?
  `).run(
    data.firstName, data.lastName, data.photo || null, data.gender,
    data.dateOfBirth || null, data.address || null, data.parentName,
    data.parentPhone, data.emergencyPhone || null, data.classId,
    data.hasTransport ? 1 : 0, data.insurancePaid ? 1 : 0,
    data.monthlyFee || 0, data.transportFee || 0, data.insuranceFee || 0,
    data.notes || null, id
  );
  return { success: true };
});

ipcMain.handle('students:delete', (_, id) => {
  db.prepare("UPDATE students SET active = 0, updatedAt = datetime('now') WHERE id = ?").run(id);
  return { success: true };
});

// CLASSES
ipcMain.handle('classes:list', () => {
  return db.prepare('SELECT * FROM classes ORDER BY id').all();
});

// PAYMENTS
ipcMain.handle('payments:list', (_, filters = {}) => {
  let query = `
    SELECT p.*, s.firstName || ' ' || s.lastName as studentName, s.code as studentCode, c.name as className
    FROM payments p
    JOIN students s ON s.id = p.studentId
    JOIN classes c ON c.id = s.classId
    WHERE 1=1
  `;
  const params = [];
  if (filters.studentId) { query += ' AND p.studentId = ?'; params.push(filters.studentId); }
  if (filters.month) { query += ' AND p.month = ?'; params.push(filters.month); }
  if (filters.type) { query += ' AND p.type = ?'; params.push(filters.type); }
  query += ' ORDER BY p.paymentDate DESC';
  if (filters.limit) { query += ' LIMIT ?'; params.push(filters.limit); }
  return db.prepare(query).all(...params);
});

ipcMain.handle('payments:create', (_, data) => {
  const receiptNumber = generateReceiptNumber();
  const remaining = (data.amount || 0) - (data.amountPaid || 0);
  const stmt = db.prepare(`
    INSERT INTO payments (receiptNumber, studentId, type, month, amount, amountPaid, remaining, paymentMethod, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    receiptNumber, data.studentId, data.type, data.month || null,
    data.amount, data.amountPaid, remaining,
    data.paymentMethod || 'especes', data.notes || null
  );

  // Mark insurance as paid if type is assurance
  if (data.type === 'assurance') {
    db.prepare("UPDATE students SET insurancePaid = 1, updatedAt = datetime('now') WHERE id = ?").run(data.studentId);
  }

  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid);
  const student = db.prepare('SELECT s.*, c.name as className FROM students s JOIN classes c ON c.id = s.classId WHERE s.id = ?').get(data.studentId);
  const settings = getSettings();

  return { payment, student, settings, receiptNumber };
});

ipcMain.handle('payments:unpaid', () => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  return db.prepare(`
    SELECT s.*, c.name as className,
    (SELECT COUNT(*) FROM payments p WHERE p.studentId = s.id AND p.month = ? AND p.type = 'mensualite') as paidThisMonth
    FROM students s JOIN classes c ON c.id = s.classId
    WHERE s.active = 1
    HAVING paidThisMonth = 0
    ORDER BY s.lastName
  `).all(currentMonth);
});

// EMPLOYEES
ipcMain.handle('employees:list', (_, filters = {}) => {
  let query = 'SELECT * FROM employees WHERE active = 1';
  const params = [];
  if (filters.role) { query += ' AND role = ?'; params.push(filters.role); }
  if (filters.search) {
    query += ' AND (name LIKE ? OR cin LIKE ?)';
    const q = `%${filters.search}%`;
    params.push(q, q);
  }
  query += ' ORDER BY name';
  return db.prepare(query).all(...params);
});

ipcMain.handle('employees:create', (_, data) => {
  const result = db.prepare(`
    INSERT INTO employees (name, cin, phone, address, role, salary, hiringDate, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(data.name, data.cin, data.phone, data.address || null, data.role, data.salary, data.hiringDate, data.notes || null);
  return { id: result.lastInsertRowid };
});

ipcMain.handle('employees:update', (_, { id, ...data }) => {
  db.prepare(`
    UPDATE employees SET name=?, cin=?, phone=?, address=?, role=?, salary=?, hiringDate=?, notes=?, updatedAt=datetime('now')
    WHERE id=?
  `).run(data.name, data.cin, data.phone, data.address || null, data.role, data.salary, data.hiringDate, data.notes || null, id);
  return { success: true };
});

ipcMain.handle('employees:delete', (_, id) => {
  db.prepare("UPDATE employees SET active = 0, updatedAt = datetime('now') WHERE id = ?").run(id);
  return { success: true };
});

// SALARIES
ipcMain.handle('salaries:list', (_, filters = {}) => {
  let query = `SELECT sl.*, e.name as employeeName, e.role FROM salaries sl JOIN employees e ON e.id = sl.employeeId WHERE 1=1`;
  const params = [];
  if (filters.month) { query += ' AND sl.month = ?'; params.push(filters.month); }
  if (filters.employeeId) { query += ' AND sl.employeeId = ?'; params.push(filters.employeeId); }
  query += ' ORDER BY sl.createdAt DESC';
  return db.prepare(query).all(...params);
});

ipcMain.handle('salaries:create', (_, data) => {
  const net = data.baseSalary + (data.bonus || 0) - (data.advance || 0);
  const result = db.prepare(`
    INSERT INTO salaries (employeeId, month, baseSalary, bonus, advance, netSalary, isPaid, paidDate, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(data.employeeId, data.month, data.baseSalary, data.bonus || 0, data.advance || 0, net, data.isPaid ? 1 : 0, data.isPaid ? new Date().toISOString() : null, data.notes || null);
  return { id: result.lastInsertRowid, netSalary: net };
});

// EXPENSES
ipcMain.handle('expenses:list', (_, filters = {}) => {
  let query = 'SELECT * FROM expenses WHERE 1=1';
  const params = [];
  if (filters.category) { query += ' AND category = ?'; params.push(filters.category); }
  if (filters.month) { query += " AND strftime('%Y-%m', date) = ?"; params.push(filters.month); }
  if (filters.search) { query += ' AND (title LIKE ? OR description LIKE ?)'; const q = `%${filters.search}%`; params.push(q, q); }
  query += ' ORDER BY date DESC';
  return db.prepare(query).all(...params);
});

ipcMain.handle('expenses:create', (_, data) => {
  const result = db.prepare(`
    INSERT INTO expenses (title, amount, date, category, subcategory, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(data.title, data.amount, data.date, data.category, data.subcategory || null, data.description || null);
  return { id: result.lastInsertRowid };
});

ipcMain.handle('expenses:update', (_, { id, ...data }) => {
  db.prepare(`UPDATE expenses SET title=?, amount=?, date=?, category=?, subcategory=?, description=?, updatedAt=datetime('now') WHERE id=?`)
    .run(data.title, data.amount, data.date, data.category, data.subcategory || null, data.description || null, id);
  return { success: true };
});

ipcMain.handle('expenses:delete', (_, id) => {
  db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  return { success: true };
});

// BUSES / TRANSPORT
ipcMain.handle('buses:list', () => db.prepare('SELECT * FROM buses WHERE active = 1').all());
ipcMain.handle('buses:create', (_, data) => {
  const result = db.prepare('INSERT INTO buses (name, plateNumber, capacity, route) VALUES (?, ?, ?, ?)')
    .run(data.name, data.plateNumber, data.capacity, data.route || null);
  return { id: result.lastInsertRowid };
});

// SCHEDULES
ipcMain.handle('schedules:list', (_, classId) => {
  return db.prepare('SELECT * FROM schedules WHERE classId = ? ORDER BY day, startTime').all(classId);
});
ipcMain.handle('schedules:create', (_, data) => {
  const result = db.prepare('INSERT INTO schedules (classId, day, startTime, endTime, subject, teacher, room) VALUES (?,?,?,?,?,?,?)')
    .run(data.classId, data.day, data.startTime, data.endTime, data.subject, data.teacher, data.room || null);
  return { id: result.lastInsertRowid };
});
ipcMain.handle('schedules:delete', (_, id) => {
  db.prepare('DELETE FROM schedules WHERE id = ?').run(id);
  return { success: true };
});

// DOCUMENTS
ipcMain.handle('documents:list', (_, studentId) => {
  let query = 'SELECT * FROM documents';
  const params = [];
  if (studentId) { query += ' WHERE studentId = ?'; params.push(studentId); }
  query += ' ORDER BY createdAt DESC';
  return db.prepare(query).all(...params);
});

ipcMain.handle('documents:open', (_, filePath) => {
  shell.openPath(filePath);
  return { success: true };
});

// SETTINGS
ipcMain.handle('settings:get', () => getSettings());
ipcMain.handle('settings:update', (_, settings) => {
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value, updatedAt) VALUES (?, ?, datetime(\'now\'))');
  Object.entries(settings).forEach(([k, v]) => stmt.run(k, String(v)));
  return { success: true };
});

// BACKUP
ipcMain.handle('backup:create', () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup_${timestamp}.db`;
  const destPath = path.join(backupsPath, filename);
  fs.copyFileSync(dbPath, destPath);
  const stats = fs.statSync(destPath);
  db.prepare('INSERT INTO backups (filename, filePath, size, type) VALUES (?, ?, ?, ?)').run(filename, destPath, stats.size, 'manual');
  return { success: true, filename, path: destPath };
});

ipcMain.handle('backup:list', () => {
  return db.prepare('SELECT * FROM backups ORDER BY createdAt DESC').all();
});

ipcMain.handle('backup:restore', async (_, filePath) => {
  // Create safety backup first
  const safeBackup = path.join(backupsPath, `pre_restore_${Date.now()}.db`);
  fs.copyFileSync(dbPath, safeBackup);
  fs.copyFileSync(filePath, dbPath);
  return { success: true };
});

ipcMain.handle('backup:export', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Exporter la sauvegarde',
    defaultPath: `school_backup_${new Date().toISOString().slice(0, 10)}.db`,
    filters: [{ name: 'Database', extensions: ['db'] }]
  });
  if (!result.canceled && result.filePath) {
    fs.copyFileSync(dbPath, result.filePath);
    return { success: true, path: result.filePath };
  }
  return { success: false };
});

// RECEIPT PDF path
ipcMain.handle('receipt:save', (_, { receiptNumber, pdfData }) => {
  const filePath = path.join(receiptsPath, `${receiptNumber}.pdf`);
  const buffer = Buffer.from(pdfData, 'base64');
  fs.writeFileSync(filePath, buffer);
  db.prepare("UPDATE payments SET receiptPdf = ? WHERE receiptNumber = ?").run(filePath, receiptNumber);
  return { success: true, path: filePath };
});

ipcMain.handle('receipt:open', (_, filePath) => {
  shell.openPath(filePath);
  return { success: true };
});

// FILE DIALOG
ipcMain.handle('dialog:openFile', async (_, options = {}) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    ...options
  });
  return result;
});

ipcMain.handle('app:getPath', (_, name) => {
  if (name === 'receipts') return receiptsPath;
  if (name === 'docs') return docsPath;
  if (name === 'backups') return backupsPath;
  return app.getPath(name);
});

// REPORTS
ipcMain.handle('reports:students', (_, filters = {}) => {
  let query = `SELECT s.*, c.name as className FROM students s JOIN classes c ON c.id = s.classId WHERE s.active = 1`;
  const params = [];
  if (filters.classId) { query += ' AND s.classId = ?'; params.push(filters.classId); }
  return db.prepare(query + ' ORDER BY c.name, s.lastName').all(...params);
});

ipcMain.handle('reports:payments', (_, filters = {}) => {
  let query = `SELECT p.*, s.firstName || ' ' || s.lastName as studentName, c.name as className 
    FROM payments p JOIN students s ON s.id = p.studentId JOIN classes c ON c.id = s.classId WHERE 1=1`;
  const params = [];
  if (filters.month) { query += " AND strftime('%Y-%m', p.paymentDate) = ?"; params.push(filters.month); }
  if (filters.type) { query += ' AND p.type = ?'; params.push(filters.type); }
  return db.prepare(query + ' ORDER BY p.paymentDate DESC').all(...params);
});

// UTILITY FUNCTIONS
function generateStudentCode() {
  const year = new Date().getFullYear();
  const count = db.prepare('SELECT COUNT(*) as c FROM students').get().c;
  return `ETU-${year}-${String(count + 1).padStart(4, '0')}`;
}

function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const count = db.prepare('SELECT COUNT(*) as c FROM payments').get().c;
  return `REC-${year}-${String(count + 1).padStart(6, '0')}`;
}

function getSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  return rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
}

// AUTO BACKUP
function scheduleAutoBackup() {
  const doBackup = () => {
    try {
      const settings = getSettings();
      if (settings.backup_auto === '1') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `auto_backup_${timestamp}.db`;
        const destPath = path.join(backupsPath, filename);
        fs.copyFileSync(dbPath, destPath);
        const stats = fs.statSync(destPath);
        db.prepare('INSERT INTO backups (filename, filePath, size, type) VALUES (?, ?, ?, ?)').run(filename, destPath, stats.size, 'auto');
        
        // Keep only last 30 auto backups
        const autoBackups = db.prepare("SELECT * FROM backups WHERE type = 'auto' ORDER BY createdAt DESC").all();
        if (autoBackups.length > 30) {
          const toDelete = autoBackups.slice(30);
          toDelete.forEach(b => {
            try { fs.unlinkSync(b.filePath); } catch {}
            db.prepare('DELETE FROM backups WHERE id = ?').run(b.id);
          });
        }
      }
    } catch (err) {
      console.error('Auto backup error:', err);
    }
  };
  
  // Run backup every 24 hours
  setInterval(doBackup, 24 * 60 * 60 * 1000);
  // Also run once on startup after 5 seconds
  setTimeout(doBackup, 5000);
}

// WINDOW CREATION
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'School Manager Pro - Le Schéma',
    icon: path.join(__dirname, '../public/logo.jpeg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
    backgroundColor: '#0f172a',
    titleBarStyle: 'default',
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize();
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();
  scheduleAutoBackup();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
