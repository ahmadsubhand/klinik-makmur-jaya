// ==========================================
// 1. DOMAIN AUTENTIKASI & OTORISASI (RBAC)
// ==========================================

Table users {
  id int [primary key, increment]
  name varchar [not null]
  email varchar [unique, not null]
  email_verified_at timestamp
  password varchar [not null]
  remember_token varchar
  phone_number varchar
  address text
  status varchar [default: 'active'] // active, inactive
  created_at timestamp
  updated_at timestamp
}

Table roles {
  id int [primary key]
  name varchar
  guard_name varchar
}

Table permissions {
  id int [primary key]
  name varchar
  guard_name varchar
}

Table model_has_roles {
  role_id int [ref: > roles.id]
  model_type varchar
  model_id int
  indexes {
    (role_id, model_id, model_type) [pk]
  }
}

Table role_has_permissions {
  permission_id int [ref: > permissions.id]
  role_id int [ref: > roles.id]
  indexes {
    (permission_id, role_id) [pk]
  }
}

// ==========================================
// 2. DOMAIN MASTER DATA
// ==========================================

Table categories {
  id int [primary key, increment]
  name varchar [not null]
  description text
  created_at timestamp
  updated_at timestamp
}

Table medicines {
  id int [primary key, increment]
  category_id int
  name varchar [not null]
  description text
  type varchar [not null] // prescription, over-the-counter, supplement, medical_device
  price decimal(10,2) [not null]
  min_stock integer [default: 10]
  created_at timestamp
  updated_at timestamp
}

Table medicine_batches {
  id int [primary key, increment]
  medicine_id int [not null]
  supplier_id int
  batch_number varchar [not null]
  quantity_incoming integer [not null]
  quantity_current integer [not null] // Target pemotongan FIFO di level Eloquent/Query
  received_at date [not null]
  expired_at date [not null] // Dasar filter cron job / task scheduling Laravel
  created_at timestamp
  updated_at timestamp
}

Table suppliers {
  id int [primary key, increment]
  name varchar [not null]
  contact varchar
  address text
  created_at timestamp
  updated_at timestamp
}

// ==========================================
// 3. DOMAIN TRANSAKSI
// ==========================================

Table prescriptions {
  id int [primary key, increment]
  patient_id int [not null]
  pharmacist_id int // Diisi saat apoteker melakukan verifikasi via Inertia request
  prescription_path varchar [not null] // Menyimpan path file resep di Laravel Storage
  status varchar [default: 'pending'] // pending, approved, rejected
  notes text
  created_at timestamp
  updated_at timestamp
}

Table transactions {
  id int [primary key, increment]
  patient_id int // Nullable jika transaksi POS offline langsung di kasir klinik
  cashier_id int // Nullable jika transaksi online via e-commerce
  prescription_id int // Nullable jika pembelian obat bebas
  type varchar [not null] // online, offline
  total_price decimal(10,2) [not null]
  status varchar [not null] // pending, confirmed, processing, ready_for_pickup, shipped, completed
  payment_method varchar [not null]
  created_at timestamp
  updated_at timestamp
}

Table transaction_details {
  id int [primary key, increment]
  transaction_id int [not null]
  medicine_id int [not null]
  medicine_batch_id int [not null] // Mengunci batch spesifik berdasarkan urutan FIFO
  quantity integer [not null]
  price_per_unit decimal(10,2) [not null]
  subtotal decimal(10,2) [not null]
  created_at timestamp
  updated_at timestamp
}

// ==========================================
// 4. DOMAIN BACKGROUND JOBS & TELEMETRY
// ==========================================

Table jobs {
  id int [primary key, increment]
  queue varchar [not null]
  payload text [not null]
  attempts integer [not null]
  reserved_at integer
  available_at integer [not null]
  created_at integer [not null]

  Indexes {
    queue
  }
}

Table job_batches {
  id varchar [primary key]
  name varchar [not null]
  total_jobs integer [not null]
  pending_jobs integer [not null]
  failed_jobs integer [not null]
  failed_job_ids text [not null]
  options text
  cancelled_at integer
  created_at integer [not null]
  finished_at integer
}

Table failed_jobs {
  id int [primary key, increment]
  uuid varchar [unique, not null]
  connection text [not null]
  queue text [not null]
  payload text [not null]
  exception text [not null]
  failed_at timestamp [default: `now()` ]
}

Table audit_logs {
  id int [primary key]
  user_id int [null, ref: > users.id]
  event varchar [note: 'created, updated, deleted']
  auditable_type varchar
  auditable_id int
  old_values json
  new_values json
  ip_address varchar
  created_at timestamp
}

// ==========================================
// 5. DOMAIN NOTIFIKASI
// ==========================================

Table notifications {
  id uuid [primary key]
  type varchar
  notifiable_type varchar
  notifiable_id int
  data json [note: 'Detail alert stok minimum, import selesai, transfer diterima, dll']
  read_at timestamp [null]
  created_at timestamp
  updated_at timestamp

  indexes {
    (notifiable_type, notifiable_id)
  }

  Note: 'Laravel database notification system'
}

// ==========================================
// 6. DOMAIN EXPORT LAPORAN
// ==========================================

Enum export_status {
  pending
  processing
  completed
  failed
}

Table export_documents {
  id int [primary key]
  user_id int [ref: > users.id, note: 'User yang meminta export']
  report_name varchar [note: 'Contoh: Laporan Stok']
  type varchar [note: 'inventory, transaction, audit, transfer']
  status export_status
  file_path varchar [null, note: 'Lokasi file hasil generate PDF/Excel']
  error_message text [null]
  created_at timestamp
  updated_at timestamp

  indexes {
    (user_id)
    (status)
    (type)
  }

  Note: 'Tracking asynchronous report export process'
}


// Relationships / Foreign Keys Constraints
Ref: medicines.category_id > categories.id [delete: set null]
Ref: medicine_batches.medicine_id > medicines.id [delete: cascade]
Ref: medicine_batches.supplier_id > suppliers.id [delete: set null]
Ref: prescriptions.patient_id > users.id
Ref: prescriptions.pharmacist_id > users.id
Ref: transactions.patient_id > users.id
Ref: transactions.cashier_id > users.id
Ref: transactions.prescription_id > prescriptions.id
Ref: transaction_details.transaction_id > transactions.id [delete: cascade]
Ref: transaction_details.medicine_id > medicines.id
Ref: transaction_details.medicine_batch_id > medicine_batches.id