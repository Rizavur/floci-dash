import { Box, Skeleton, SpaceBetween } from "./ui";

// Note: table loading now uses Table.tsx's built-in column-aligned skeleton
// (pass `loading` to <Table>/<ResourceTable>) instead of a standalone component,
// since a generic skeleton here can't match the real table's column count/widths.

interface CardsSkeletonProps {
  count?: number;
}

export function CardsSkeleton({ count = 4 }: CardsSkeletonProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${count}, 1fr)`, gap: "16px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} padding="l">
          <SpaceBetween size="s">
            <Skeleton height="14px" width="60%" />
            <Skeleton height="28px" width="40%" />
            <Skeleton height="12px" width="80%" />
          </SpaceBetween>
        </Box>
      ))}
    </div>
  );
}

interface DetailSkeletonProps {
  lines?: number;
}

export function DetailSkeleton({ lines = 4 }: DetailSkeletonProps) {
  return (
    <Box padding="l">
      <SpaceBetween size="m">
        <Skeleton variant="text-heading-m" width="50%" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} height="14px" width={i === lines - 1 ? "60%" : "90%"} />
        ))}
      </SpaceBetween>
    </Box>
  );
}

export function DashboardSkeleton() {
  return (
    <SpaceBetween size="xl">
      <Skeleton variant="text-heading-xl" width="280px" />
      <CardsSkeleton count={4} />
      <Box padding="l">
        <SpaceBetween size="m">
          <Skeleton height="18px" width="140px" />
          <Skeleton height="16px" width="100%" />
          <Skeleton height="16px" width="100%" />
          <Skeleton height="16px" width="80%" />
        </SpaceBetween>
      </Box>
    </SpaceBetween>
  );
}
