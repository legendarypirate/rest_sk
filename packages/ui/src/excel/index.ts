import ExcelJS from 'exceljs';

export type ExcelColumn<Row> = {
  header: string;
  width?: number;
  value: (row: Row) => string | number | null | undefined;
};

export async function downloadExcel<Row>(options: {
  fileName: string;
  title: string;
  sheetName?: string;
  columns: ExcelColumn<Row>[];
  rows: Row[];
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'restaurant';
  const sheet = workbook.addWorksheet(options.sheetName ?? 'Sheet1');
  const columnCount = Math.max(options.columns.length, 1);

  sheet.mergeCells(1, 1, 1, columnCount);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = options.title;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet.getRow(1).height = 24;

  const header = sheet.addRow(options.columns.map((column) => column.header));
  header.font = { bold: true };
  header.alignment = { vertical: 'middle' };
  header.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF4F4F5' },
    };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFE4E4E7' } },
    };
  });

  for (const row of options.rows) {
    sheet.addRow(options.columns.map((column) => column.value(row) ?? ''));
  }

  options.columns.forEach((column, index) => {
    sheet.getColumn(index + 1).width = column.width ?? 18;
  });
  sheet.views = [{ state: 'frozen', ySplit: 2 }];
  sheet.autoFilter = {
    from: { row: 2, column: 1 },
    to: { row: 2, column: columnCount },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = options.fileName.endsWith('.xlsx') ? options.fileName : `${options.fileName}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
