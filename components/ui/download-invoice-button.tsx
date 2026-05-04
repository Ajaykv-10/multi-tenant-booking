"use client";

import { useState } from "react";

type DownloadState = "idle" | "loading" | "error";

interface DownloadInvoiceButtonProps {
  bookingId: string;
  invoiceNumber?: string | null;
  /** Visual variant — "button" for the customer/provider full-width style, "link" for the admin table inline style */
  variant?: "button" | "link";
  className?: string;
}

export function DownloadInvoiceButton({
  bookingId,
  invoiceNumber,
  variant = "button",
  className,
}: DownloadInvoiceButtonProps) {
  const [state, setState] = useState<DownloadState>("idle");

  async function handleDownload() {
    if (state === "loading") return;
    setState("loading");

    try {
      const res = await fetch(`/api/bookings/${bookingId}/invoice`);

      if (!res.ok) {
        console.error("[Invoice] API error:", res.status);
        setState("error");
        setTimeout(() => setState("idle"), 2500);
        return;
      }

      // Read the response as a Blob (PDF bytes)
      const blob = await res.blob();

      // Create a temporary object URL — no navigation happens here
      const objectUrl = URL.createObjectURL(blob);

      // Programmatically click a hidden anchor to trigger the browser save dialog
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = invoiceNumber
        ? `${invoiceNumber}.pdf`
        : `invoice-${bookingId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      // Release the object URL immediately
      URL.revokeObjectURL(objectUrl);

      setState("idle");
    } catch (err) {
      console.error("[Invoice] Download error:", err);
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  }

  // ── Link variant (used in Admin table actions row) ──────────────────────
  if (variant === "link") {
    return (
      <button
        onClick={handleDownload}
        disabled={state === "loading"}
        title={invoiceNumber ?? "Download invoice"}
        className={
          className ??
          "flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-40 transition whitespace-nowrap"
        }
      >
        {state === "loading" ? (
          <>
            <svg
              className="w-3.5 h-3.5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
              />
            </svg>
            Generating…
          </>
        ) : state === "error" ? (
          <span className="text-red-500">Failed</span>
        ) : (
          <>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Invoice
          </>
        )}
      </button>
    );
  }

  // ── Button variant (used in Customer My Bookings & Provider modal) ───────
  return (
    <button
      onClick={handleDownload}
      disabled={state === "loading"}
      className={
        className ??
        "inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-blue-200 dark:border-blue-800 text-sm font-medium rounded-lg text-blue-600 dark:text-blue-400 bg-white dark:bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-60"
      }
    >
      {state === "loading" ? (
        <>
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
            />
          </svg>
          Generating…
        </>
      ) : state === "error" ? (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Failed — retry
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download Invoice
        </>
      )}
    </button>
  );
}
