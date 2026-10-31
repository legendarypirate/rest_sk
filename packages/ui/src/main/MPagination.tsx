'use client';

import * as React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@packages/ui/components/pagination';

interface MPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  /**
   * Force-render the pagination even when there is a single page (useful for
   * previewing / keeping a stable footer). Defaults to `false`, i.e. it hides
   * itself unless there is more than one page.
   */
  isVisible?: boolean;
}

export function MPagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  isVisible = false,
}: MPaginationProps) {
  // React Hook-ийг ЭХЭНД дуудах (conditional-аас өмнө)
  const pageNumbers = React.useMemo(() => {
    const pages: (number | string)[] = [];
    const MAX_VISIBLE = 7;

    // Хэрэв нийт хуудас 7-аас бага бол бүгдийг харуул
    if (totalPages <= MAX_VISIBLE) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Үргэлж эхний хуудсыг харуул
    pages.push(1);

    // Дундах хэсгийн тооцоолол
    let startPage: number;
    let endPage: number;

    if (currentPage <= 3) {
      // Эхний хэсэг: 1 [2] 3 4 5 ... 2844
      startPage = 2;
      endPage = 5;
    } else if (currentPage >= totalPages - 2) {
      // Сүүлийн хэсэг: 1 ... 2840 2841 2842 [2843] 2844
      startPage = totalPages - 4;
      endPage = totalPages - 1;
    } else {
      // Дундах хэсэг: 1 ... 22 [23] 24 ... 2844
      startPage = currentPage - 1;
      endPage = currentPage + 1;
    }

    // Эхний ellipsis
    if (startPage > 2) {
      pages.push('ellipsis-start');
    }

    // Дундах хуудсууд
    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    // Сүүлийн ellipsis
    if (endPage < totalPages - 1) {
      pages.push('ellipsis-end');
    }

    // Үргэлж сүүлийн хуудсыг харуул
    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  // Conditional return нь Hook-оос ДАРАА байх ёстой.
  // isVisible=true үед ганц хуудастай ч гэсэн харуулна.
  if (!isVisible && totalPages <= 1) return null;

  return (
    <Pagination className={className}>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            text="Өмнөх"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) {
                onPageChange(currentPage - 1);
              }
            }}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>

        {/* Page Numbers */}
        {pageNumbers.map((page) => {
          // Ellipsis харуулах
          if (typeof page === 'string') {
            return (
              <PaginationItem key={page}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <PaginationItem key={`page-${pageNum}`}>
              <PaginationLink
                href="#"
                isActive={isActive}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pageNum);
                }}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            text="Дараах"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) {
                onPageChange(currentPage + 1);
              }
            }}
            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
