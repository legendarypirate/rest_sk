'use client';

import { MTable, MTableBody, MTableCell, MTableHead, MTableHeader, MTableRow } from './MTable';

export function MTableSkeleton() {
  return (
    <MTable>
      <MTableHeader className="sticky top-0 z-20">
        <MTableRow>
          {Array.from({ length: 5 }).map((_, index) => (
            <MTableHead key={index}>
              <div className="h-4 bg-muted-foreground/20 rounded animate-pulse" />
            </MTableHead>
          ))}
        </MTableRow>
      </MTableHeader>
      <MTableBody>
        {Array.from({ length: 10 }).map((_, rowIndex) => (
          <MTableRow key={rowIndex}>
            {Array.from({ length: 5 }).map((_, colIndex) => (
              <MTableCell key={colIndex}>
                <div className="h-4 bg-muted rounded animate-pulse" />
              </MTableCell>
            ))}
          </MTableRow>
        ))}
      </MTableBody>
    </MTable>
  );
}
