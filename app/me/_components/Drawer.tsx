import type { ReactNode } from "react";
import styles from "../me.module.css";

/** A collapsible section, so the locker page is not a wall of fields on a phone. */
export default function Drawer({
  id,
  title,
  hint,
  sticker,
  open = false,
  children,
}: {
  id?: string;
  title: string;
  hint?: string;
  sticker?: ReactNode;
  open?: boolean;
  children: ReactNode;
}) {
  return (
    <details className={styles.drawer} id={id} open={open}>
      <summary>
        <span className={styles.drawerTitle}>
          <strong>{title}</strong>
          {hint && <span>{hint}</span>}
        </span>
        {sticker}
        <span className={styles.chevron} aria-hidden="true" />
      </summary>
      <div className={styles.drawerBody}>{children}</div>
    </details>
  );
}
