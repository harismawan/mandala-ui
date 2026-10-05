import s from "./Spinner.module.css";

export const Spinner = ({ label = "Loading", size = 16 }: { label?: string; size?: 14 | 16 | 24 }) => (
  <span className={s.spinner} style={{ width: size, height: size }} role="status" aria-label={label} />
);

// Centred spinner for a region that has nothing else to show yet.
export const Loading = ({ label }: { label?: string }) => (
  <div className={s.block}>
    <Spinner label={label} size={24} />
  </div>
);
