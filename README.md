# VotelySign

VotelySign adalah platform e-voting modern yang menggabungkan teknologi blockchain, kriptografi modern (Schnorr signature, Zero-Knowledge Proof), dan desain frontend interaktif untuk menghadirkan sistem pemilihan yang **aman, transparan, dan dapat diverifikasi**.

---

## ✨ Fitur Utama

- **Voting Aman & Terenkripsi**  
  Setiap suara dienkripsi dan ditandatangani secara digital menggunakan algoritma Schnorr Signature.
- **Verifikasi Blockchain**  
  Semua suara dicatat di blockchain (Ethereum Sepolia) untuk transparansi dan auditabilitas.
- **Zero-Knowledge Proof (ZKP)**  
  Menggunakan ZKP (Bulletproof) untuk membuktikan validitas suara tanpa membocorkan pilihan pemilih.
- **Live Count Real-Time**  
  Hasil pemilihan dapat dipantau secara real-time langsung dari blockchain.
- **Multi-Role**  
  Mendukung peran panitia (admin) dan pemilih dengan alur terpisah.
- **Audit Log**  
  Setiap aksi penting dicatat dan dapat diaudit dengan hash dan ZKP.
- **Antarmuka Modern**  
  UI/UX responsif berbasis Next.js, TailwindCSS, dan komponen custom.

---

## 🏗️ Arsitektur & Teknologi

- **Frontend:**  
  - Next.js (React)
  - TailwindCSS
  - Framer Motion (animasi)
  - ethers.js (integrasi blockchain)
- **Backend:**  
  - Node.js (API, server actions)
  - Drizzle ORM (PostgreSQL)
  - Custom cryptography (Schnorr, Bulletproof)
- **Blockchain:**  
  - Ethereum Sepolia Testnet
  - Smart Contract Solidity (Voting)
- **Database:**  
  - PostgreSQL (struktur tabel: elections, candidates, voters, vote_transactions, blocks, audit_logs, election_results)

---

## 🔒 Algoritma & Kriptografi

### 1. **Schnorr Signature**
- **Tujuan:**  
  Menandatangani data voting secara digital, membuktikan suara berasal dari pemilih sah tanpa membocorkan identitas.
- **Cara Kerja:**  
  - Pemilih memasukkan private key.
  - Data voting di-hash (SHA-256), lalu ditandatangani dengan Schnorr.
  - Signature diverifikasi di backend/blockchain.

### 2. **Zero-Knowledge Proof (snarkjs)**
- **Tujuan:**  
  Membuktikan suara valid (misal: memilih kandidat yang sah) tanpa membocorkan isi suara.
- **Cara Kerja:**  
  - ZKP dihasilkan menggunakan snarkjs untuk setiap transaksi voting.
  - Bukti ini disimpan di blockchain dan database.

### 3. **Merkle Tree & Block Hash**
- **Tujuan:**  
  Menjamin integritas blok dan transaksi voting.
- **Cara Kerja:**  
  - Setiap blok berisi hash Merkle root dari transaksi.
  - Block hash dihasilkan dari seluruh isi blok.

### 4. **Nullifier Hash**
- **Tujuan:**  
  Mencegah double voting tanpa mengaitkan identitas pemilih.
- **Cara Kerja:**  
  - Nullifier hash dihasilkan dari ID pemilih + private key.
  - Disimpan di database dan blockchain.

---

## 🗂️ Struktur Database

- **elections:** Info pemilihan (judul, deskripsi, waktu, kode, blockchain address, dsb)
- **candidates:** Data kandidat (nama, deskripsi, public key)
- **voters:** Data pemilih (kode akses, public key, nullifier, dsb)
- **vote_transactions:** Transaksi voting (hash, encrypted vote, signature, bulletproof, dsb)
- **blocks:** Blok blockchain internal (block hash, merkle root, dsb)
- **audit_logs:** Log audit (event hash, ZKP, metadata)
- **election_results:** Hasil akhir (vote count, tally proof)

---

## 🚦 Alur Kerja Sistem

### 1. **Panitia/Admin**
- Input data pemilihan & kandidat.
- Sistem generate kode pemilihan, kode pemilih, dan private key untuk tiap pemilih.
- Kode dibagikan ke pemilih.

### 2. **Pemilih**
- Input kode pemilihan & kode pemilih.
- Sistem verifikasi ke backend (hash & DB).
- Jika valid, pilih kandidat.
- Input private key → sistem generate signature & ZKP.
- Vote dikirim ke blockchain.
- Status pemilih diupdate (has_voted).

### 3. **Live Count**
- User input kode pemilihan.
- Frontend request hasil suara ke backend.
- Backend ambil data suara dari smart contract.
- Hasil suara ditampilkan secara real-time.

---

## 🗺️ Diagram Alur Sistem

### **Alur Panitia**
```mermaid
flowchart TD
  PA1(Mulai) --> PA2{Input data pemilihan}
  PA2 -->|Valid| PA3(Buat election di database)
  PA3 --> PA4(Generate kode pemilihan, kode pemilih, dan private key)
  PA4 --> PA5(Bagikan kode ke masing-masing pemilih)
  PA5 --> PA6(Selesai setup)
  PA2 -->|Tidak valid| PA7(Error: Data tidak lengkap)
  PA7 --> PA2
```

### **Alur Pemilih**
```mermaid
flowchart TD
  V1(Mulai: Pemilih ingin voting) --> V2{Input kode pemilihan & kode pemilih}
  V2 -->|Valid| V3(Verifikasi ke backend: hash & cek DB)
  V2 -->|Tidak valid| VX1(Error: kode salah)
  V3 -->|Sudah voting| VX2(Error: sudah voting)
  V3 -->|Belum voting| V4(Pilih kandidat)
  V4 --> V5(Input private key)
  V5 --> V6{Cek status voting lagi}
  V6 -->|Sudah voting| VX3(Error: sudah voting)
  V6 -->|Belum voting| V7(Buat transaksi vote di blockchain)
  V7 --> V8(Update status voter: has_voted true)
  V8 --> V9(Simpan transaksi ke database)
  V9 --> V10(Vote sukses)
  VX1 --> VEND(Selesai)
  VX2 --> VEND
  VX3 --> VEND
  V10 --> VEND
```

### **Sequence Diagram Voting**
```mermaid
sequenceDiagram
    participant Voter
    participant Backend
    participant Blockchain

    Voter->>Backend: Kirim kode pemilih, kode pemilihan
    Backend->>Backend: Verifikasi kode (hash)
    Backend-->>Voter: Status valid/tidak

    Voter->>Backend: Pilih kandidat, kirim private key
    Backend->>Backend: Generate signature (Schnorr)
    Note right of Backend: 🔒 Generate signature (Schnorr)
    Backend->>Backend: Generate ZKP (Zero-Knowledge Proof)
    Note right of Backend: 🕵️ Generate ZKP (Zero-Knowledge Proof)
    Backend->>Blockchain: Submit vote (dengan signature & ZKP)
    Note right of Blockchain: ⛓️ Simpan transaksi vote ke blockchain
    Blockchain-->>Backend: Hash transaksi
    Backend->>DB: Update status has_voted
    Backend-->>Voter: Konfirmasi sukses
```

### **Sequence Diagram Live Count**
```mermaid
sequenceDiagram
    participant User as User/Panitia
    participant Frontend
    participant Backend
    participant Blockchain

    User->>Frontend: Input kode pemilihan (lihat hasil)
    Frontend->>Backend: Request hasil suara (dengan kode pemilihan)
    Backend->>Blockchain: Ambil data suara dari smart contract
    Note right of Blockchain: ⛓️ Data suara real-time
    Blockchain-->>Backend: Kirim data hasil suara
    Backend-->>Frontend: Kirim hasil suara ke frontend
    Frontend-->>User: Tampilkan live count (grafik/statistik)
```

---

## 🧑‍💻 Cara Kerja Voting (Ringkas)

1. Pemilih akses halaman voting, input kode pemilihan & kode pemilih.
2. Backend verifikasi kode, cek status voting.
3. Pemilih pilih kandidat, input private key.
4. Sistem generate signature & ZKP, kirim ke smart contract.
5. Blockchain mencatat suara, backend update status pemilih.
6. Hasil voting dapat dipantau real-time.

---

## 📚 Referensi & Sumber

- [Ethereum Sepolia Testnet](https://sepolia.etherscan.io/)
- [Schnorr Signature](https://en.wikipedia.org/wiki/Schnorr_signature)
- [Bulletproofs (ZKP)](https://crypto.stanford.edu/bulletproofs/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [ethers.js](https://docs.ethers.org/)
- [Next.js](https://nextjs.org/)

---

## 📝 Catatan

- Untuk produksi, ZKP sudah menggunakan snarkjs.
- Private key harus dijaga kerahasiaannya oleh pemilih.

---

## 📧 Kontak & Kontribusi

- Email: [fadhilgani2@gmail.com](mailto:fadhilgani2@gmail.com)
- Pull request & issue sangat diterima!

---

**VotelySign** – Vote digitally, signed & secured by blockchain ⛓️🚀
