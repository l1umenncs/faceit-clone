import "./Skeleton.css"

export const Skeleton = ({ width, height, borderRadius, className }) => (
  <div
    className={`skeleton ${className || ""}`}
    style={{ width: width || "100%", height: height || "20px", borderRadius: borderRadius || "6px" }}
  />
)

export const SkeletonCard = ({ height }) => (
  <div className="skeleton-card" style={{ height: height || "120px" }}>
    <Skeleton width="52px" height="52px" borderRadius="50%" />
    <div className="skeleton-card__body">
      <Skeleton width="60%" height="16px" />
      <Skeleton width="40%" height="12px" />
      <Skeleton width="30%" height="12px" />
    </div>
  </div>
)

export const SkeletonRow = () => (
  <div className="skeleton-row">
    <Skeleton width="36px" height="36px" borderRadius="50%" />
    <Skeleton width="50%" height="14px" />
    <Skeleton width="30px" height="20px" borderRadius="4px" />
    <Skeleton width="60px" height="14px" />
  </div>
)

export const SkeletonBanner = () => (
  <div className="skeleton-banner">
    <div className="skeleton-banner__content">
      <Skeleton width="40%" height="32px" />
      <Skeleton width="70%" height="14px" />
      <Skeleton width="160px" height="40px" borderRadius="4px" />
    </div>
    <div className="skeleton-banner__levels">
      {[1, 2, 3, 4, 5].map(i => (
        <Skeleton key={i} width="60px" height="60px" borderRadius="0" />
      ))}
    </div>
  </div>
)
