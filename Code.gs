// Ganti ID dengan ID Spreadsheet milikmu
const SPREADSHEET_ID = '1PKgBirWyy3HFtfmWJc1P2jkN5ZaxwMWraApductXMn0';

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('ART1S - GMAHK Tidar 1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ==========================================
// INISIALISASI STRUKTUR SHEET OTOMATIS
// ==========================================
function ensureSheetsAndHeaders(ss) {
  const sheetsConfig = {
    'Jadwal Rabu': ['Tanggal', 'Pemimpin Acara', 'Renungan', 'Doa Syafaat', 'Diakon'],
    'Jadwal SS': ['Tanggal', 'Pianist', 'Pembawa Acara', 'Ayat Inti & Doa Buka', 'Berita Misi', 'Pelayanan Perorangan'],
    'Jadwal Khotbah': ['Tanggal', 'Khotbah', 'Pendamping 1', 'Pendamping 2', 'Cerita Anak-anak', 'Song Leader', 'Lagu Pujian'],
    'Jadwal Diakon': ['Tanggal', 'Diakon 1', 'Diakon 2', 'Diakones 1', 'Diakones 2'],
    'Jadwal Musik': ['Tanggal', 'Pianis', 'Keyboardis', 'Gitaris', 'Bassist', 'Saxophonist', 'Violinist'],
    'Jadwal Perjamuan': ['Tanggal', 'P. Roti & Anggur 1', 'P. Roti & Anggur 2', 'P. Roti & Anggur 3', 'P. Roti & Anggur 4', 'P. Roti & Anggur 5', 'P. Basuh Kaki 1', 'P. Basuh Kaki 2', 'P. Basuh Kaki 3', 'Pelayan Basuh Kaki 1', 'Pelayan Basuh Kaki 2', 'Pelayan Basuh Kaki 3', 'Pelayan Perjamuan (L1)', 'Pelayan Perjamuan (L2)', 'Pelayan Perjamuan (P1)', 'Pelayan Perjamuan (P2)', 'Cuci Baskom 1', 'Cuci Baskom 2', 'Cuci Baskom 3', 'Cuci Baskom 4', 'Cuci Alat Perjamuan']
  };

  for (let sheetName in sheetsConfig) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(sheetsConfig[sheetName]);
    }
  }
}

// ==========================================
// FUNGSI MEMBACA DATA DARI 6 SHEET TERPISAH
// ==========================================
function getAppData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureSheetsAndHeaders(ss);
  
  let sheetPejabat = ss.getSheetByName('Pejabat');
  if (!sheetPejabat) {
    sheetPejabat = ss.insertSheet('Pejabat');
    sheetPejabat.appendRow(['ID', 'Jabatan', 'Nama', 'WhatsApp', 'URL Foto Base64']);
  }

  const result = { jadwalDB: {} };

  const dataPejabat = [];
  if (sheetPejabat.getLastRow() > 1) {
    const pejabats = sheetPejabat.getRange(2, 1, sheetPejabat.getLastRow() - 1, 5).getValues();
    for (let i = 0; i < pejabats.length; i++) {
      if (pejabats[i][0]) {
        dataPejabat.push({
          id: pejabats[i][0], jabatan: pejabats[i][1], nama: pejabats[i][2], wa: String(pejabats[i][3]), img: pejabats[i][4]
        });
      }
    }
    if (dataPejabat.length > 0) result.dataPejabat = dataPejabat;
  }

  const toYMD = (d) => {
    const pad = n => n<10?'0'+n:n;
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  };

  const getTemplateRabu = () => ({
      title: "Ibadah Permintaan Doa (Rabu)", time: "19:00 WIB - selesai",
      petugas: [ { tugas: "Pemimpin Acara", nama: "Bpk. Budi Santoso" }, { tugas: "Renungan", nama: "Pdt. Samuel" }, { tugas: "Doa Syafaat", nama: "Ibu Maria" }, { tugas: "Diakon", nama: "Sdr. Joshua" } ]
  });
  
  const getTemplateSabat = () => ({
      title: "Ibadah Sabat (Sabtu)", time: "09:00 - 12:00 WIB",
      sekolahSabatTime: "09:00 - 10:30 WIB",
      sekolahSabat: [ { tugas: "Pianist", nama: "Sdri. Grace" }, { tugas: "Pembawa Acara", nama: "Bpk. Andi" }, { tugas: "Ayat Inti & Doa Buka", nama: "Bpk. Yohanes" }, { tugas: "Berita Misi", nama: "Ibu Lina" }, { tugas: "Pelayanan Perorangan", nama: "Bpk. Sitorus" } ],
      khotbahTime: "10:30 - 12:00 WIB",
      khotbah: [ { tugas: "Khotbah", nama: "Pdt. David Siregar" }, { tugas: "Pendamping 1", nama: "Bpk. Daniel" }, { tugas: "Pendamping 2", nama: "Sdr. Kevin" }, { tugas: "Cerita Anak-anak", nama: "Ibu Sarah" }, { tugas: "Song Leader", nama: "Sdr. Joshua" }, { tugas: "Lagu Pujian", nama: "Koor Pemuda" } ],
      diakon: [ { tugas: "Diakon 1", nama: "Bpk. Sitorus" }, { tugas: "Diakon 2", nama: "Bpk. Tambunan" }, { tugas: "Diakones 1", nama: "Ibu Sitorus" }, { tugas: "Diakones 2", nama: "Ibu Tambunan" } ],
      musik: [ { tugas: "Pianis", nama: "Sdri. Grace" }, { tugas: "Keyboardis", nama: "Sdr. Kevin" }, { tugas: "Gitaris", nama: "Sdr. Alex" }, { tugas: "Bassist", nama: "Sdr. Brian" }, { tugas: "Saxophonist", nama: "Bpk. Anton" }, { tugas: "Violinist", nama: "Sdri. Clara" } ],
      perjamuan: [
          { tugas: "P. Roti & Anggur 1", nama: "" }, { tugas: "P. Roti & Anggur 2", nama: "" }, { tugas: "P. Roti & Anggur 3", nama: "" }, { tugas: "P. Roti & Anggur 4", nama: "" }, { tugas: "P. Roti & Anggur 5", nama: "" },
          { tugas: "P. Basuh Kaki 1", nama: "" }, { tugas: "P. Basuh Kaki 2", nama: "" }, { tugas: "P. Basuh Kaki 3", nama: "" },
          { tugas: "Pelayan Basuh Kaki 1", nama: "" }, { tugas: "Pelayan Basuh Kaki 2", nama: "" }, { tugas: "Pelayan Basuh Kaki 3", nama: "" },
          { tugas: "Pelayan Perjamuan (L1)", nama: "" }, { tugas: "Pelayan Perjamuan (L2)", nama: "" }, { tugas: "Pelayan Perjamuan (P1)", nama: "" }, { tugas: "Pelayan Perjamuan (P2)", nama: "" },
          { tugas: "Cuci Baskom 1", nama: "" }, { tugas: "Cuci Baskom 2", nama: "" }, { tugas: "Cuci Baskom 3", nama: "" }, { tugas: "Cuci Baskom 4", nama: "" },
          { tugas: "Cuci Alat Perjamuan", nama: "Diatur oleh Diakones" }
      ]
  });

  const processSheetData = (sheetName, templateFunc, arrayKey, expectedDay) => {
     const sheet = ss.getSheetByName(sheetName);
     if (!sheet || sheet.getLastRow() < 2) return;
     const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();

     for(let i=0; i<data.length; i++) {
       let tglStr = data[i][0];
       if (!tglStr) continue;
       
       if (tglStr instanceof Date) tglStr = toYMD(tglStr);
       const d = new Date(tglStr + 'T00:00:00');
       if (d.getDay() !== expectedDay) continue;

       if (!result.jadwalDB[tglStr]) result.jadwalDB[tglStr] = templateFunc();

       const targetArray = result.jadwalDB[tglStr][arrayKey];
       if (targetArray) {
           for(let j=0; j<targetArray.length; j++) {
              if (data[i][j+1] !== undefined && data[i][j+1] !== "") {
                 targetArray[j].nama = String(data[i][j+1]);
              }
           }
       }
     }
  };

  processSheetData('Jadwal Rabu', getTemplateRabu, 'petugas', 3);
  processSheetData('Jadwal SS', getTemplateSabat, 'sekolahSabat', 6);
  processSheetData('Jadwal Khotbah', getTemplateSabat, 'khotbah', 6);
  processSheetData('Jadwal Diakon', getTemplateSabat, 'diakon', 6);
  processSheetData('Jadwal Musik', getTemplateSabat, 'musik', 6);
  processSheetData('Jadwal Perjamuan', getTemplateSabat, 'perjamuan', 6);

  return result;
}

// ==========================================
// FUNGSI MENYIMPAN DATA (DARI DASHBOARD)
// ==========================================
function savePejabatData(dataArray) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Pejabat');
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).clearContent();
  }
  if (dataArray && dataArray.length > 0) {
    const rows = dataArray.map(p => [p.id, p.jabatan, p.nama, p.wa, p.img]);
    sheet.getRange(2, 1, rows.length, 5).setValues(rows);
  }
  return true;
}

function updateOrAppendRow(sheet, tanggal, rowData) {
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    let tglStr = data[i][0];
    if (tglStr instanceof Date) {
        const pad = n => n<10?'0'+n:n;
        tglStr = `${tglStr.getFullYear()}-${pad(tglStr.getMonth()+1)}-${pad(tglStr.getDate())}`;
    }
    if (tglStr === tanggal) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex > -1) sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  else sheet.appendRow(rowData);
}

function saveJadwalSingle(tanggal, jadwalData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const d = new Date(tanggal + 'T00:00:00'); 
  const isRabu = d.getDay() === 3;

  if (isRabu) {
      const sheet = ss.getSheetByName('Jadwal Rabu');
      if (sheet && jadwalData.petugas) updateOrAppendRow(sheet, tanggal, [tanggal].concat(jadwalData.petugas.map(p => p.nama)));
  } else {
      if (jadwalData.sekolahSabat) {
          const sheetSS = ss.getSheetByName('Jadwal SS');
          if (sheetSS) updateOrAppendRow(sheetSS, tanggal, [tanggal].concat(jadwalData.sekolahSabat.map(p => p.nama)));
      }
      if (jadwalData.khotbah) {
          const sheetKhotbah = ss.getSheetByName('Jadwal Khotbah');
          if (sheetKhotbah) updateOrAppendRow(sheetKhotbah, tanggal, [tanggal].concat(jadwalData.khotbah.map(p => p.nama)));
      }
      if (jadwalData.diakon) {
          const sheetDiakon = ss.getSheetByName('Jadwal Diakon');
          if (sheetDiakon) updateOrAppendRow(sheetDiakon, tanggal, [tanggal].concat(jadwalData.diakon.map(p => p.nama)));
      }
      if (jadwalData.musik) {
          const sheetMusik = ss.getSheetByName('Jadwal Musik');
          if (sheetMusik) updateOrAppendRow(sheetMusik, tanggal, [tanggal].concat(jadwalData.musik.map(p => p.nama)));
      }
      if (jadwalData.perjamuan) {
          const sheetPerjamuan = ss.getSheetByName('Jadwal Perjamuan');
          if (sheetPerjamuan) updateOrAppendRow(sheetPerjamuan, tanggal, [tanggal].concat(jadwalData.perjamuan.map(p => p.nama)));
      }
  }
  return true;
}