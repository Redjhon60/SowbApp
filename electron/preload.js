/**
 * Preload Script - Secure bridge between Electron main and React renderer
 */
const { contextBridge, ipcRenderer } = require('electron');

// Expose safe API to renderer process
contextBridge.exposeInMainWorld('api', {
  // AUTH
  login: (data) => ipcRenderer.invoke('auth:login', data),

  // DASHBOARD
  getDashboardStats: () => ipcRenderer.invoke('dashboard:stats'),

  // STUDENTS
  getStudents: (filters) => ipcRenderer.invoke('students:list', filters),
  getStudent: (id) => ipcRenderer.invoke('students:get', id),
  createStudent: (data) => ipcRenderer.invoke('students:create', data),
  updateStudent: (data) => ipcRenderer.invoke('students:update', data),
  deleteStudent: (id) => ipcRenderer.invoke('students:delete', id),

  // CLASSES
  getClasses: () => ipcRenderer.invoke('classes:list'),

  // PAYMENTS
  getPayments: (filters) => ipcRenderer.invoke('payments:list', filters),
  createPayment: (data) => ipcRenderer.invoke('payments:create', data),
  getUnpaidStudents: () => ipcRenderer.invoke('payments:unpaid'),

  // EMPLOYEES
  getEmployees: (filters) => ipcRenderer.invoke('employees:list', filters),
  createEmployee: (data) => ipcRenderer.invoke('employees:create', data),
  updateEmployee: (data) => ipcRenderer.invoke('employees:update', data),
  deleteEmployee: (id) => ipcRenderer.invoke('employees:delete', id),

  // SALARIES
  getSalaries: (filters) => ipcRenderer.invoke('salaries:list', filters),
  createSalary: (data) => ipcRenderer.invoke('salaries:create', data),

  // EXPENSES
  getExpenses: (filters) => ipcRenderer.invoke('expenses:list', filters),
  createExpense: (data) => ipcRenderer.invoke('expenses:create', data),
  updateExpense: (data) => ipcRenderer.invoke('expenses:update', data),
  deleteExpense: (id) => ipcRenderer.invoke('expenses:delete', id),

  // TRANSPORT / BUSES
  getBuses: () => ipcRenderer.invoke('buses:list'),
  createBus: (data) => ipcRenderer.invoke('buses:create', data),

  // SCHEDULES
  getSchedules: (classId) => ipcRenderer.invoke('schedules:list', classId),
  createSchedule: (data) => ipcRenderer.invoke('schedules:create', data),
  deleteSchedule: (id) => ipcRenderer.invoke('schedules:delete', id),

  // DOCUMENTS
  getDocuments: (studentId) => ipcRenderer.invoke('documents:list', studentId),
  openDocument: (path) => ipcRenderer.invoke('documents:open', path),

  // SETTINGS
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (data) => ipcRenderer.invoke('settings:update', data),

  // BACKUP
  createBackup: () => ipcRenderer.invoke('backup:create'),
  listBackups: () => ipcRenderer.invoke('backup:list'),
  restoreBackup: (path) => ipcRenderer.invoke('backup:restore', path),
  exportBackup: () => ipcRenderer.invoke('backup:export'),

  // RECEIPTS
  saveReceipt: (data) => ipcRenderer.invoke('receipt:save', data),
  openReceipt: (path) => ipcRenderer.invoke('receipt:open', path),

  // FILE DIALOG
  openFileDialog: (options) => ipcRenderer.invoke('dialog:openFile', options),
  getAppPath: (name) => ipcRenderer.invoke('app:getPath', name),

  // REPORTS
  getStudentsReport: (filters) => ipcRenderer.invoke('reports:students', filters),
  getPaymentsReport: (filters) => ipcRenderer.invoke('reports:payments', filters),
});
